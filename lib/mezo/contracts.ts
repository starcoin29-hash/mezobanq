// lib/mezo/contracts.ts
// These are loaded from environment variables so we can easily
// switch between testnet and mainnet without changing code

export const CONTRACTS = {
  MUSD_TOKEN: process.env
    .NEXT_PUBLIC_MUSD_TOKEN_ADDRESS as `0x${string}`,
  BTC_VAULT: process.env
    .NEXT_PUBLIC_BTC_VAULT_ADDRESS as `0x${string}`,
  BORROWING: process.env
    .NEXT_PUBLIC_BORROWING_ADDRESS as `0x${string}`,
  PASSPORT: process.env
    .NEXT_PUBLIC_PASSPORT_ADDRESS as `0x${string}`,
  GIFT_CARD: process.env
    .NEXT_PUBLIC_GIFT_CARD_ADDRESS as `0x${string}`,
} as const;

// Check if a contract address is a placeholder (e.g., 0x000...0001)
// Returns true if the address is NOT a real deployed contract
export function isPlaceholderAddress(address: string | undefined): boolean {
  if (!address) return true;
  const stripped = address.replace(/^0x0*/i, "");
  return stripped.length <= 4; // Real addresses have 40 hex chars total
}

// Standard ERC-20 interface (the minimum we need)
export const MUSD_ABI = [
  // balanceOf: returns how many MUSD tokens this address holds
  // 'view' means it's a READ operation -- free, no gas cost
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  // totalSupply: returns total MUSD minted across all users
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // allowance: check if user has approved a contract to spend their MUSD
  // This is needed before the borrowing contract can move MUSD on repay
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  // approve: user allows a contract to spend their MUSD
  // Must be called before repaying or sending MUSD via a contract
  // 'nonpayable' means it writes to blockchain (costs gas, but no ETH/BTC)
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  // transfer: send MUSD directly to another address
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  // Transfer event: emitted whenever MUSD moves between addresses
  // We can listen to this event to detect incoming payments
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

export const BORROWING_ABI = [
  // openPosition: lock BTC collateral and mint MUSD
  // 'payable' means this function RECEIVES BTC -- we send BTC WITH this call
  {
    name: "openPosition",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "collateralAmount", type: "uint256" }, // BTC to lock (in wei)
      { name: "musdAmount", type: "uint256" }, // MUSD to mint (in wei)
    ],
    outputs: [{ name: "positionId", type: "uint256" }],
  },
  // closePosition: repay MUSD and get BTC back
  // User must have approved the borrowing contract to spend their MUSD first
  {
    name: "closePosition",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "positionId", type: "uint256" }],
    outputs: [],
  },
  // addCollateral: add more BTC to an existing position
  // Reduces liquidation risk when BTC price drops
  {
    name: "addCollateral",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "positionId", type: "uint256" }],
    outputs: [],
  },
  // getPosition: read the details of a position (free, no gas)
  {
    name: "getPosition",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "positionId", type: "uint256" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "collateralAmount", type: "uint256" },
      { name: "debtAmount", type: "uint256" },
      { name: "interestRate", type: "uint256" },
      { name: "createdAt", type: "uint256" },
      { name: "isActive", type: "bool" },
    ],
  },
  // PositionOpened: event emitted when a new position is created
  {
    name: "PositionOpened",
    type: "event",
    inputs: [
      { name: "positionId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "collateralAmount", type: "uint256", indexed: false },
      { name: "musdAmount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const PASSPORT_ABI = [
  // passportOf: returns the passport token ID for a wallet address
  // Returns 0 if the address has no passport yet
  {
    name: "passportOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  // getPassportData: returns the passport details for a given tokenId
  {
    name: "getPassportData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "level", type: "uint8" }, // 1-5 prestige level
      { name: "totalBorrowed", type: "uint256" }, // Lifetime MUSD borrowed
      { name: "totalRepaid", type: "uint256" }, // Lifetime MUSD repaid
      { name: "activePositions", type: "uint8" }, // Currently open positions
      { name: "createdAt", type: "uint256" }, // Unix timestamp
    ],
  },
  // mint: create a new Mezo Passport (free for first mint)
  {
    name: "mint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
] as const;
export const GIFT_CARD_ABI = [
  // createCard: lock MUSD and create an escrow gift card
  {
    name:             "createCard",
    type:             "function",
    stateMutability:  "nonpayable",
    inputs: [
      { name: "amount",    type: "uint256" },
      { name: "codeHash",  type: "bytes32" },
      { name: "expiresAt", type: "uint256" },
    ],
    outputs: [{ name: "cardId", type: "uint256" }],
  },
  // claimCard: present the plain code to receive MUSD
  {
    name:             "claimCard",
    type:             "function",
    stateMutability:  "nonpayable",
    inputs:  [{ name: "plainCode", type: "string" }],
    outputs: [],
  },
  // refundCard: return MUSD to creator after expiry
  {
    name:             "refundCard",
    type:             "function",
    stateMutability:  "nonpayable",
    inputs:  [{ name: "cardId", type: "uint256" }],
    outputs: [],
  },
  // hashCode: compute codeHash before calling createCard
  {
    name:             "hashCode",
    type:             "function",
    stateMutability:  "pure",
    inputs:  [{ name: "plainCode", type: "string" }],
    outputs: [{ name: "", type: "bytes32" }],
  },
  // checkCode: verify a code is valid before prompting user to sign
  {
    name:             "checkCode",
    type:             "function",
    stateMutability:  "view",
    inputs:  [{ name: "codeHash", type: "bytes32" }],
    outputs: [
      { name: "valid",  type: "bool"    },
      { name: "cardId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
  },
  // totalLockedMusd: how much MUSD is in escrow right now
  {
    name:             "totalLockedMusd",
    type:             "function",
    stateMutability:  "view",
    inputs:           [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Events for listening to on-chain activity
  { name:   "CardCreated",
    type:   "event",
    inputs: [
      { name: "cardId",    type: "uint256", indexed: true  },
      { name: "creator",   type: "address", indexed: true  },
      { name: "amount",    type: "uint256", indexed: false },
      { name: "expiresAt", type: "uint256", indexed: false },
    ],
  },
  {
    name:   "CardClaimed",
    type:   "event",
    inputs: [
      { name: "cardId",  type: "uint256", indexed: true  },
      { name: "claimer", type: "address", indexed: true  },
 { name: "amount",  type: "uint256", indexed: false },
    ],
  },
] as const;