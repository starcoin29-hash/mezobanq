// contracts/test/MezoBanqGiftCard.test.ts
// Hardhat 3 test format:
//   - ethers comes from hre.network.create()
//   - network helpers (loadFixture, time) come from networkHelpers
//   - import hre (default) from "hardhat", not named exports
import { expect } from "chai";
import hre from "hardhat";

// Create a network connection (top-level await, ESM)
const { ethers, networkHelpers } = await hre.network.create();

//  Test helpers 
// Hash a plain claim code the same way the contract does
function hashCode(code: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(code));
}
// 30 days in seconds
const THIRTY_DAYS = 30 * 24 * 60 * 60;

//  Fixture: deploy contracts once, reuse across tests 
// A fixture is a snapshot of the blockchain state that tests can reuse.
// This is much faster than deploying fresh contracts for every test.
async function deployFixture() {
  // Get test accounts
  // deployer  = contract owner
  // creator   = user who creates gift cards
  // claimer   = user who claims gift cards
  const [deployer, creator, claimer] = await ethers.getSigners();

  //  Deploy a mock MUSD token for testing 
  // In production, MUSD is already deployed by Mezo Protocol.
  // For tests, we deploy a simple ERC-20 mock so we control it.
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const musd = await MockERC20.deploy(
    "Mock MUSD",  // name
    "MUSD",       // symbol
    18            // decimals
  );
  await musd.waitForDeployment();

  //  Deploy the Gift Card escrow contract 
  const GiftCard = await ethers.getContractFactory("MezoBanqGiftCard");
  const giftCard = await GiftCard.deploy(await musd.getAddress());
  await giftCard.waitForDeployment();

  //  Fund the creator with 10,000 MUSD 
  // ethers.parseEther converts "10000" to 10000 * 10^18 (wei format)
  const mintAmount = ethers.parseEther("10000");
  await musd.mint(creator.address, mintAmount);

  return { musd, giftCard, deployer, creator, claimer };
}

//  TEST SUITE 
describe("MezoBanqGiftCard", function () {
  //  Deployment tests 
  describe("Deployment", function () {
    it("should set the correct MUSD token address", async function () {
      const { musd, giftCard } = await networkHelpers.loadFixture(deployFixture);
      expect(await giftCard.musdToken()).to.equal(await musd.getAddress());
    });

    it("should set deployer as owner", async function () {
      const { giftCard, deployer } = await networkHelpers.loadFixture(deployFixture);
      expect(await giftCard.owner()).to.equal(deployer.address);
    });

    it("should start with nextCardId of 1", async function () {
      const { giftCard } = await networkHelpers.loadFixture(deployFixture);
      expect(await giftCard.nextCardId()).to.equal(1n);
    });
  });

  //  createCard tests 
  describe("createCard", function () {
    it("should create a card and pull MUSD into escrow", async function () {
      const { musd, giftCard, creator } = await networkHelpers.loadFixture(deployFixture);
      const amount   = ethers.parseEther("100"); // 100 MUSD
      const code     = "MEZO1234ABCD5678";
      const codeHash = hashCode(code);
      const expiry   = Math.floor(Date.now() / 1000) + THIRTY_DAYS;

      // Creator must approve the contract to spend their MUSD first
      await musd.connect(creator).approve(await giftCard.getAddress(), amount);

      // Create the card
      const tx = await giftCard.connect(creator).createCard(
        amount, codeHash, expiry
      );
      await tx.wait();

      // Verify card was created with correct data
      const card = await giftCard.getCard(1n);
      expect(card.creator).to.equal(creator.address);
      expect(card.amount).to.equal(amount);
      expect(card.claimed).to.equal(false);
      expect(card.refunded).to.equal(false);

      // Verify MUSD moved into escrow
      const escrowBalance = await musd.balanceOf(await giftCard.getAddress());
      expect(escrowBalance).to.equal(amount);
    });

    it("should revert if amount is less than 1 MUSD", async function () {
      const { musd, giftCard, creator } = await networkHelpers.loadFixture(deployFixture);
      const tooSmall = ethers.parseEther("0.5"); // 0.5 MUSD -- too small
      await musd.connect(creator).approve(await giftCard.getAddress(), tooSmall);
      const expiry = Math.floor(Date.now() / 1000) + THIRTY_DAYS;

      await expect(
        giftCard.connect(creator).createCard(
          tooSmall, hashCode("CODE1234CODE5678"), expiry
        )
      ).to.be.revertedWithCustomError(giftCard, "InvalidAmount");
    });

    it("should revert if expiry is in the past", async function () {
      const { musd, giftCard, creator } = await networkHelpers.loadFixture(deployFixture);
      const amount   = ethers.parseEther("100");
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

      await musd.connect(creator).approve(await giftCard.getAddress(), amount);

      await expect(
        giftCard.connect(creator).createCard(
          amount, hashCode("CODE1234CODE5678"), pastTime
        )
      ).to.be.revertedWithCustomError(giftCard, "InvalidExpiry");
    });

    it("should revert without MUSD approval", async function () {
      const { giftCard, creator } = await networkHelpers.loadFixture(deployFixture);
      const expiry = Math.floor(Date.now() / 1000) + THIRTY_DAYS;

      // No approve() called -- should fail with InsufficientAllowance
      await expect(
        giftCard.connect(creator).createCard(
          ethers.parseEther("100"), hashCode("CODE1234CODE5678"), expiry
        )
      ).to.be.revertedWithCustomError(giftCard, "InsufficientAllowance");
    });
  });

  //  claimCard tests 
  describe("claimCard", function () {
    // Helper: create a card and return the details
    async function createTestCard(
      musd: any, giftCard: any, creator: any,
      code: string, amountEther: string = "100"
    ) {
      const amount = ethers.parseEther(amountEther);
      const expiry = Math.floor(Date.now() / 1000) + THIRTY_DAYS;
      await musd.connect(creator).approve(await giftCard.getAddress(), amount);
      await giftCard.connect(creator).createCard(amount, hashCode(code), expiry);
      return { amount, expiry };
    }

    it("should transfer MUSD to claimer on valid code", async function () {
      const { musd, giftCard, creator, claimer } =
        await networkHelpers.loadFixture(deployFixture);
      const code = "VALIDCODE1234567";
      const { amount } = await createTestCard(musd, giftCard, creator, code);

      // Record claimer's MUSD balance before claiming
      const balanceBefore = await musd.balanceOf(claimer.address);

      // Claim the card with the plain text code
      await giftCard.connect(claimer).claimCard(code);

      // Verify MUSD transferred to claimer
      const balanceAfter = await musd.balanceOf(claimer.address);
      expect(balanceAfter - balanceBefore).to.equal(amount);

      // Verify card is marked as claimed
      const card = await giftCard.getCard(1n);
      expect(card.claimed).to.equal(true);
      expect(card.claimer).to.equal(claimer.address);
    });

    it("should revert on wrong claim code", async function () {
      const { musd, giftCard, creator, claimer } =
        await networkHelpers.loadFixture(deployFixture);
      await createTestCard(musd, giftCard, creator, "REALCODE1234567");

      await expect(
        giftCard.connect(claimer).claimCard("WRONGCODE123456")
      ).to.be.revertedWithCustomError(giftCard, "CardNotFound");
    });

    it("should revert on double claim", async function () {
      const { musd, giftCard, creator, claimer } =
        await networkHelpers.loadFixture(deployFixture);
      const code = "DOUBLECLAIM1234X";
      await createTestCard(musd, giftCard, creator, code);

      await giftCard.connect(claimer).claimCard(code); // First claim -- OK

      // Second claim should fail
      await expect(
        giftCard.connect(claimer).claimCard(code)
      ).to.be.revertedWithCustomError(giftCard, "CardAlreadyClaimed");
    });

    it("should revert if card has expired", async function () {
      const { musd, giftCard, creator, claimer } =
        await networkHelpers.loadFixture(deployFixture);
      const code   = "EXPIREDCARD12345";
      const amount = ethers.parseEther("100");
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

      await musd.connect(creator).approve(await giftCard.getAddress(), amount);
      await giftCard.connect(creator).createCard(amount, hashCode(code), expiry);

      // Fast-forward time past the expiry
      // This is a Hardhat feature -- only works in tests, not on real blockchain
      await networkHelpers.time.increaseTo(expiry + 1);

      await expect(
        giftCard.connect(claimer).claimCard(code)
      ).to.be.revertedWithCustomError(giftCard, "CardExpired");
    });
  });

  //  refundCard tests 
  describe("refundCard", function () {
    it("should refund expired card to creator", async function () {
      const { musd, giftCard, creator } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseEther("100");
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour

      await musd.connect(creator).approve(await giftCard.getAddress(), amount);
      await giftCard.connect(creator).createCard(
        amount, hashCode("REFUNDTEST12345X"), expiry
      );

      // Record creator's balance after creating (MUSD was taken)
      const balanceBeforeRefund = await musd.balanceOf(creator.address);

      // Fast-forward past expiry
      await networkHelpers.time.increaseTo(expiry + 1);

      // Refund -- note: anyone can call this, but MUSD goes to creator
      await giftCard.refundCard(1n);

      // Creator should have their MUSD back
      const balanceAfterRefund = await musd.balanceOf(creator.address);
      expect(balanceAfterRefund - balanceBeforeRefund).to.equal(amount);
    });

    it("should revert if card has not expired yet", async function () {
      const { musd, giftCard, creator } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseEther("100");
      const expiry = Math.floor(Date.now() / 1000) + THIRTY_DAYS;

      await musd.connect(creator).approve(await giftCard.getAddress(), amount);
      await giftCard.connect(creator).createCard(
        amount, hashCode("NOTEXPIREDCODE1X"), expiry
      );

      await expect(
        giftCard.refundCard(1n)
      ).to.be.revertedWithCustomError(giftCard, "CardNotExpired");
    });
  });
});
