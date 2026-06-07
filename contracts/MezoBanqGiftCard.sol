// SPDX-License-Identifier: MIT
// This license comment is REQUIRED by Solidity -- MIT means open source
pragma solidity ^0.8.24;
// ^0.8.24 means: use compiler version 0.8.24 or any compatible newer version
// ============================================================
// INTERFACE DEFINITIONS
// An interface tells our contract what functions another contract has
// We do not need the full MUSD contract code -- just the functions we call
// ============================================================
interface IMUSD {
    // Transfer MUSD from one address to another
    // Returns true if successful
    function transfer(address to, uint256 amount) external returns (bool);
    // Transfer MUSD on behalf of someone who has given us allowance
    // Used when pulling funds FROM the creator INTO the escrow
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    // Check how much MUSD an address holds
    function balanceOf(address account) external view returns (uint256);
    // Check how much MUSD 'owner' has allowed 'spender' to use
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}
// ============================================================
// MAIN CONTRACT
// ============================================================
/**
 * @title MezoBanqGiftCard
 * @author MezoBanq Team
 * @notice Escrow contract for MUSD gift cards on the Mezo network.
 *
 * HOW IT WORKS:
 * 1. Creator calls createCard() with MUSD amount + claim code hash
 *    - The MUSD is pulled from creator's wallet into this contract
 *    - A GiftCard record is stored on-chain with the hashed claim code
 *
 * 2. Recipient calls claimCard() with the plain-text claim code
 *    - Contract hashes the code and checks it matches the stored hash
 *    - If it matches, MUSD is transferred to the recipient
 *
 * 3. If the card expires, creator calls refundCard()
 *    - MUSD is returned to the original creator
 *
 * SECURITY:
 * - Claim codes are stored as keccak256 hashes ONLY (never plain text)
 * - Each card has a unique ID to prevent double-claiming
 * - Reentrancy guard prevents attack where malicious contract
 *   calls back into claimCard() before the first call finishes
 */
contract MezoBanqGiftCard {
      //  State Variables 
    // These are stored permanently on the blockchain
    // The MUSD token contract address
    // immutable = set once in constructor, never changes (saves gas)
    IMUSD public immutable musdToken;
    // The contract owner (deployer) -- can pause in emergency
    address public owner;
    // Auto-incrementing counter for gift card IDs
    // Each new card gets the next ID (0, 1, 2, 3...)
    uint256 private _nextCardId;
    // Reentrancy guard lock
    // true = a function is currently executing (locked)
    // false = no function executing (unlocked)
    bool private _locked;
    //  Struct: GiftCard 
    // A struct is a custom data type that groups related fields
    // Think of it as a row in a database table
    struct GiftCard {
   uint256 id;          // Unique card ID (auto-incremented)
        address creator;     // Who created and funded this card
        address claimer;     // Who claimed it (address(0) if unclaimed)
        uint256 amount;      // Amount of MUSD locked (in wei, 18 decimals)
        bytes32 codeHash;    // keccak256 hash of the claim code (NOT plain text)
        uint256 expiresAt;   // Unix timestamp when card expires (seconds)
        bool    claimed;     // Has this card been claimed?
        bool    refunded;    // Has the creator been refunded?
    }
    // Mapping: cardId => GiftCard struct
    // A mapping is like a dictionary/HashMap -- look up card by its ID
    mapping(uint256 => GiftCard) public cards;
    // Mapping: codeHash => cardId
    // Allows looking up a card by its claim code hash
    // This is what claimCard() uses to find the right card
    mapping(bytes32 => uint256) private _codeHashToCardId;
    //  Events 
    // Events are logged to the blockchain and can be read by our frontend
    // They are the blockchain equivalent of console.log() -- free to emit,
    // cheap to store, and can be queried by transaction hash
    // Emitted when a new gift card is created
    event CardCreated(
        uint256 indexed cardId,    // indexed = can filter by this value
        address indexed creator,
        uint256 amount,
        uint256 expiresAt
    );
    // Emitted when a gift card is claimed
    event CardClaimed(
        uint256 indexed cardId,
        address indexed claimer,
        uint256 amount
    );
    // Emitted when a creator refunds an expired card
    event CardRefunded(  uint256 indexed cardId,
        address indexed creator,
        uint256 amount
    );
    //  Custom Errors 
    // Custom errors are more gas-efficient than require() strings
    // They also provide better error messages in MetaMask
    error NotOwner();
    error InvalidAmount();
    error InvalidExpiry();
    error InsufficientAllowance();
    error CardNotFound();
  error CardAlreadyClaimed();
    error CardAlreadyRefunded();
    error CardNotExpired();
    error CardExpired();
    error InvalidClaimCode();
    error TransferFailed();
    error Reentrancy();
    error ZeroAddress();
    //  Modifiers 
    // Modifiers are reusable guards that run BEFORE a function body
    // onlyOwner: only the contract deployer can call this function
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _; // Continue to the actual function body
    }
    // nonReentrant: prevents reentrancy attacks
    // A reentrancy attack is when a malicious contract calls back into
    // our function before the first call has finished executing.
    // By setting _locked = true at the start and false at the end,
    // any re-entry attempt hits the 'if (_locked)' check and reverts.
    modifier nonReentrant() {
        if (_locked) revert Reentrancy();
        _locked = true;
        _;            // Execute the function body
        _locked = false;
    }
    //  Constructor 
    // The constructor runs ONCE when the contract is deployed
    // It sets up the initial state
    /**
     * @param _musdToken Address of the MUSD token contract on Mezo
     */
    constructor(address _musdToken) {
        // Validate the address is not zero (common mistake)
        if (_musdToken == address(0)) revert ZeroAddress();
          musdToken = IMUSD(_musdToken);
        owner     = msg.sender; // msg.sender = the deployer's address
        _nextCardId = 1;        // Start IDs at 1 (0 means "not found")
    }
    // 
    // CORE FUNCTIONS
    // 
    /**
     * @notice Create a new MUSD gift card
     * @dev Pulls MUSD from caller's wallet into escrow.
     *      Caller must have approved this contract to spend their MUSD first
  *      (by calling musdToken.approve(address(this), amount) beforehand).
     *
     * @param amount    Amount of MUSD to lock (in wei -- 18 decimals)
     *                  Example: 100 MUSD = 100 * 10^18 = 100000000000000000000
     * @param codeHash  keccak256 hash of the claim code
     *                  NEVER pass the plain text code here!
     *                  Compute it off-chain: keccak256(abi.encodePacked(code))
     * @param expiresAt Unix timestamp for expiry (seconds since Jan 1 1970)
     *                  Example: block.timestamp + 30 days = expires in 30 days
     * @return cardId   The ID of the newly created gift card
     */
    function createCard(
        uint256 amount,
        bytes32 codeHash,
        uint256 expiresAt
    ) external nonReentrant returns (uint256 cardId) {
        //  Validations 
        // Amount must be at least 1 MUSD (1 * 10^18 wei)
        if (amount < 1e18) revert InvalidAmount();
        // Expiry must be in the future
        // block.timestamp = current block time in Unix seconds
        if (expiresAt <= block.timestamp) revert InvalidExpiry();
        // Expiry cannot be more than 90 days from now (reasonable limit)
        if (expiresAt > block.timestamp + 90 days) revert InvalidExpiry();
        // Check the caller has approved us to spend their MUSD
        uint256 allowance = musdToken.allowance(msg.sender, address(this));
        if (allowance < amount) revert InsufficientAllowance();
        //  Transfer MUSD into escrow 
        // Pull MUSD from creator's wallet into THIS contract's balance
        // transferFrom(from, to, amount):
        //   from = msg.sender (the creator)
        //   to   = address(this) (this contract's address)
        bool success = musdToken.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        //  Create the card record 
        cardId = _nextCardId++;
        cards[cardId] = GiftCard({
            id:        cardId,
            creator:   msg.sender,
              claimer:   address(0),  // No claimer yet
            amount:    amount,
            codeHash:  codeHash,
            expiresAt: expiresAt,
            claimed:   false,
            refunded:  false
        });
        // Map the code hash to this card ID for fast lookup in claimCard()
   _codeHashToCardId[codeHash] = cardId;
        // Emit event -- our frontend listens for this to update the UI
        emit CardCreated(cardId, msg.sender, amount, expiresAt);
    }
    /**
     * @notice Claim a gift card by providing the plain-text claim code
     * @dev The contract hashes the code and verifies it matches the stored hash.
     *      MUSD is transferred to the caller if valid.
     *
     * @param plainCode The plain-text claim code (e.g., "MEZO1234ABCD5678")
     *                  This is the code the gift card creator shared with you
     */
    function claimCard(string calldata plainCode) external nonReentrant {
        //  Hash the code 
        // We NEVER stored the plain code on-chain -- only its hash
        // So we hash what the user provided and compare to stored hash
        // keccak256 is Ethereum's built-in hash function (like SHA-256)
        bytes32 codeHash = keccak256(abi.encodePacked(plainCode));
        //  Look up the card 
        uint256 cardId = _codeHashToCardId[codeHash];
        if (cardId == 0) revert CardNotFound();  // 0 = not found
        GiftCard storage card = cards[cardId];
        // 'storage' means we get a reference to the actual stored data
        // Changes to 'card' will update the blockchain storage
        //  Validations 
        if (card.claimed)  revert CardAlreadyClaimed();
        if (card.refunded) revert CardAlreadyRefunded();
        // Card must not be expired
        if (block.timestamp > card.expiresAt) revert CardExpired();
        //  Mark as claimed BEFORE transferring 
        // CRITICAL: Always update state BEFORE making external calls
        // This is the "Checks-Effects-Interactions" pattern
        // If we did the transfer first and it somehow re-entered,
        // the card would still show as unclaimed, allowing double-claiming
        card.claimed = true;
        card.claimer = msg.sender;
         //  Transfer MUSD to claimer 
        // Transfer from THIS contract's balance to the claimer
        bool success = musdToken.transfer(msg.sender, card.amount);
        if (!success) revert TransferFailed();
        emit CardClaimed(cardId, msg.sender, card.amount);
    }
    /**
     * @notice Refund an expired, unclaimed gift card to the original creator
 * @dev Anyone can call this, but MUSD always goes back to card.creator
     *      This allows automated systems to trigger refunds
     *
     * @param cardId The ID of the gift card to refund
     */
    function refundCard(uint256 cardId) external nonReentrant {
        GiftCard storage card = cards[cardId];
        // Validations
        if (card.creator == address(0)) revert CardNotFound();
        if (card.claimed)               revert CardAlreadyClaimed();
        if (card.refunded)              revert CardAlreadyRefunded();
        // Card must be expired before it can be refunded
        if (block.timestamp <= card.expiresAt) revert CardNotExpired();
        // Mark as refunded BEFORE transferring (Checks-Effects-Interactions)
        card.refunded = true;
        // Return MUSD to the original creator
        bool success = musdToken.transfer(card.creator, card.amount);
        if (!success) revert TransferFailed();
        emit CardRefunded(cardId, card.creator, card.amount);
    }
    // 
    // VIEW FUNCTIONS (FREE -- no gas cost)
    // 
    /**
     * @notice Get all details of a gift card by its ID
     * @param cardId The gift card ID
     * @return The full GiftCard struct
     */
    function getCard(uint256 cardId)
        external
        view
        returns (GiftCard memory)
    {
        if (cards[cardId].creator == address(0)) revert CardNotFound();
        return cards[cardId];
    } /**
     * @notice Check if a claim code hash is valid and the card is active
     * @dev Use this to validate a code before asking user to sign a transaction
     * @param codeHash keccak256 hash of the claim code to check
     * @return valid   true if the code maps to an active, unclaimed, unexpired card
     * @return cardId  The card ID (0 if not valid)
     * @return amount  The MUSD amount (0 if not valid)
     */
    function checkCode(bytes32 codeHash)
        external
  view
        returns (bool valid, uint256 cardId, uint256 amount)
    {
        cardId = _codeHashToCardId[codeHash];
        if (cardId == 0) return (false, 0, 0);
        GiftCard memory card = cards[cardId];
        valid = (
            !card.claimed &&
            !card.refunded &&
            block.timestamp <= card.expiresAt
        );
        amount = valid ? card.amount : 0;
    }
    /**
     * @notice Get the total MUSD locked in this contract right now
     * @return Total MUSD balance of this escrow contract
     */
    function totalLockedMusd() external view returns (uint256) {
        return musdToken.balanceOf(address(this));
    }
    /**
     * @notice Get the next card ID that will be assigned
     * @return The next card ID (also equals total cards created + 1)
     */
    function nextCardId() external view returns (uint256) {
        return _nextCardId;
    }
    // 
    // UTILITY: Hash a plain code to bytes32
    // Useful for frontend testing -- see what hash your code produces
    // 
    /**
     * @notice Hash a claim code string to bytes32
     * @dev Use this to compute the codeHash before calling createCard()
     * @param plainCode The plain text claim code
     * @return The keccak256 hash to pass to createCard()
       */
    function hashCode(string calldata plainCode)
        external
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(plainCode));
    }
}
