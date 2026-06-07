// lib/db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  varchar,
  jsonb,
  pgEnum,
  index,
  decimal,
} from "drizzle-orm/pg-core";

// =====================================================================
// ENUMS -- Fixed sets of allowed values for certain columns
// Using enums instead of plain text prevents typos in status fields
// =====================================================================

export const positionStatusEnum = pgEnum("position_status", [
  "active", // BTC locked, MUSD borrowed and in use
  "closed", // User repaid MUSD and got BTC back
  "liquidated", // Auto-closed because BTC price dropped too low
]);

export const giftCardStatusEnum = pgEnum("gift_card_status", [
  "active", // Created, not yet claimed
  "claimed", // Successfully redeemed by recipient
  "expired", // Past the 30-day expiry date
  "cancelled", // Creator cancelled before it was claimed
]);

export const txTypeEnum = pgEnum("tx_type", [
  "borrow",
  "repay",
  "send",
  "receive",
  "gift_create",
  "gift_claim",
  "yield_deposit",
  "yield_withdraw",
]);

// =====================================================================
// USERS TABLE
// Stores profile data that goes beyond what Clerk Auth provides
// The id column MUST match the user's id in Clerk exactly (string format)
// =====================================================================

export const users = pgTable(
  "users",
  {
    // Primary key matches Clerk user ID (string format, e.g. "user_2abc123")
    id: text("id").primaryKey(),
    // Ethereum wallet address (42 chars: 0x + 40 hex digits)
    walletAddress: varchar("wallet_address", { length: 42 }).unique(),
    // User-chosen display name
    username: varchar("username", { length: 50 }).unique(),
    email: text("email").unique(),
    // Has the user verified their email and set up their profile?
    isVerified: boolean("is_verified").default(false),
    // Mezo Passport NFT token ID -- null if user has not minted one yet
    passportTokenId: text("passport_token_id"),
    // Unique referral code for the referral program (12 chars)
    referralCode: varchar("referral_code", { length: 12 }).unique(),
    // Which currency to show amounts in (USD, EUR, GBP, etc.)
    displayCurrency: varchar("display_currency", { length: 5 }).default("USD"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Index on walletAddress for fast lookups when user connects wallet
    walletIdx: index("users_wallet_idx").on(table.walletAddress),
  })
);

// =====================================================================
// POSITIONS TABLE
// Each row = one borrow event (lock BTC, receive MUSD)
// =====================================================================

export const positions = pgTable(
  "positions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Foreign key: which user owns this position
    // onDelete: "cascade" means if user is deleted, position is too
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    // The Ethereum transaction hash when this position was opened
    // This lets users verify the transaction on the blockchain explorer
    txHash: text("tx_hash").unique(),
    // Amount of BTC locked (stored as string to avoid floating point issues)
    // Example: "0.10000000" (8 decimal places for BTC)
    collateralBtc: decimal("collateral_btc", {
      precision: 18, // Total digits
      scale: 8, // Digits after decimal point
    }),
    // USD value of the BTC at the time the position was opened
    collateralUsdAtOpen: decimal("collateral_usd_at_open", {
      precision: 18,
      scale: 2,
    }),
    // How much MUSD was minted (1 MUSD = $1 USD)
    borrowedMusd: decimal("borrowed_musd", { precision: 18, scale: 2 }),
    // Annual interest rate -- always 1.00 on Mezo
    interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default(
      "1.00"
    ),
    // LTV ratio at time of borrow (e.g., 0.50 = 50% LTV)
    ltvRatio: decimal("ltv_ratio", { precision: 5, scale: 4 }),
    // The on-chain position ID from the Mezo borrowing contract
    onChainPositionId: text("on_chain_position_id"),
    status: positionStatusEnum("status").default("active"),
    openedAt: timestamp("opened_at").defaultNow(),
    closedAt: timestamp("closed_at"), // Null until position is closed
  },
  (table) => ({
    userIdx: index("positions_user_idx").on(table.userId),
    statusIdx: index("positions_status_idx").on(table.status),
  })
);

// =====================================================================
// GIFT CARDS TABLE
// MUSD gift cards that can be sent and claimed
// =====================================================================

export const giftCards = pgTable("gift_cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  // 16-character alphanumeric claim code (e.g., "MEZO1234ABCD5678")
  claimCode: varchar("claim_code", { length: 16 }).unique().notNull(),
  // Who created the gift card
  creatorId: text("creator_id").references(() => users.id),
  // Who claimed it (null until claimed)
  claimerId: text("claimer_id").references(() => users.id),
  // Amount of MUSD on the card
  amountMusd: decimal("amount_musd", { precision: 18, scale: 2 }).notNull(),
  // Optional personal message from creator
  message: text("message"),
  // Visual theme for the card design
  // We have: "bitcoin", "birthday", "minimal", "neon", "gold"
  theme: varchar("theme", { length: 30 }).default("bitcoin"),
  status: giftCardStatusEnum("status").default("active"),
  // On-chain transaction hashes for audit trail
  lockTxHash: text("lock_tx_hash"), // When MUSD was locked into escrow
  claimTxHash: text("claim_tx_hash"), // When MUSD was released to claimer
  // Cards expire after 30 days -- funds return to creator
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  claimedAt: timestamp("claimed_at"),
});

// =====================================================================
// TRANSACTIONS TABLE
// Audit trail of every MUSD movement
// =====================================================================

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id),
    type: txTypeEnum("type").notNull(),
    // Amount and currency of the transaction
    amount: decimal("amount", { precision: 18, scale: 8 }),
    currency: varchar("currency", { length: 10 }).default("MUSD"),
    // Blockchain transaction hash (for block explorer link)
    txHash: text("tx_hash"),
    // From/To Ethereum addresses
    fromAddress: varchar("from_address", { length: 42 }),
    toAddress: varchar("to_address", { length: 42 }),
    // Extra data stored as JSON (e.g., { positionId, giftCardId })
    metadata: jsonb("metadata"),
    // Block number on the Mezo network
    blockNumber: integer("block_number"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("tx_user_idx").on(table.userId),
    typeIdx: index("tx_type_idx").on(table.type),
  })
);

// =====================================================================
// YIELD POSITIONS TABLE
// Tracks MUSD deposited into yield-generating protocols
// =====================================================================

export const yieldPositions = pgTable("yield_positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id),
  // Which yield protocol (e.g., "mezo_native", "aave_v3")
  protocol: varchar("protocol", { length: 50 }),
  depositedMusd: decimal("deposited_musd", { precision: 18, scale: 2 }),
  // Current Annual Percentage Yield (e.g., 5.25 = 5.25%)
  currentApy: decimal("current_apy", { precision: 6, scale: 2 }),
  // Total MUSD earned so far from this yield position
  earnedMusd: decimal("earned_musd", { precision: 18, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  depositTxHash: text("deposit_tx_hash"),
  depositedAt: timestamp("deposited_at").defaultNow(),
  lastHarvestedAt: timestamp("last_harvested_at"),
});