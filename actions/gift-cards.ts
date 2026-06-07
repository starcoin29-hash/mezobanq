// actions/gift-cards.ts
"use server";

// 'use server' at the top of the file marks ALL exports as Server Actions

import { z } from "zod";
import { db, schema } from "@/lib/db";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { rateLimitedActionClient, authActionClient } from "@/lib/safe-action";

// ■■ Schema for Creating a Gift Card ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

const createGiftCardSchema = z.object({
  // MUSD amount: must be between 1 and 10,000
  amountMusd: z
    .number({ error: "Amount is required" })
    .min(1, "Minimum gift card amount is 1 MUSD")
    .max(10_000, "Maximum gift card amount is 10,000 MUSD"),

  // Optional message: max 200 characters
  message: z
    .string()
    .max(200, "Message cannot exceed 200 characters")
    .optional(),

  // Theme must be one of these exact values
  theme: z.enum(["bitcoin", "birthday", "minimal", "neon", "gold"], {
    error: "Please select a valid theme",
  }),

  // The blockchain tx hash from locking MUSD in the escrow contract
  // Pattern ensures it's a valid Ethereum hash format
  lockTxHash: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/, "Invalid transaction hash")
    .optional(),
});

// Uses rateLimitedActionClient: requires login AND rate limits the endpoint
export const createGiftCard = rateLimitedActionClient
  .schema(createGiftCardSchema) // Zod validates input before action runs
  .action(async ({ parsedInput, ctx }) => {
    const { amountMusd, message, theme, lockTxHash } = parsedInput;
    const { userId } = ctx; // userId comes from the auth middleware

    // Generate a unique 16-character claim code
    // nanoid() creates a cryptographically random URL-safe string
    // We uppercase it for easier sharing (e.g., "MEZO1234ABCD5678")
    const claimCode = nanoid(16).toUpperCase().replace(/-|_/g, "X");

    // Set expiry to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Insert into the database
    const [giftCard] = await db
      .insert(schema.giftCards)
      .values({
        claimCode,
        creatorId: userId,
        amountMusd: amountMusd.toString(),
        message,
        theme,
        lockTxHash,
        expiresAt,
        status: "active",
      })
      .returning(); // Returns the inserted row with auto-generated ID

    // Cache the gift card for 24 hours for fast claim lookups
    // Fire-and-forget: don't block the response waiting for Redis
    redis
      .setex(CACHE_KEYS.giftCard(claimCode), 86400, JSON.stringify(giftCard))
      .catch(() => {}); // Swallow Redis errors -- non-critical

    return {
      success: true,
      claimCode,
      giftCardId: giftCard.id,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/claim/${claimCode}`,
      expiresAt: expiresAt.toISOString(),
    };
  });

const claimGiftCardSchema = z.object({
  claimCode: z
    .string()
    .min(1, "Claim code is required")
    .length(16, "Claim code must be exactly 16 characters")
    .transform((val) => val.toUpperCase().trim()), // Normalize input
});

export const claimGiftCard = authActionClient
  .schema(claimGiftCardSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { claimCode } = parsedInput;
    const { userId } = ctx;

    // FAST PATH: check Redis cache first (microseconds vs milliseconds)
    let giftCard: typeof schema.giftCards.$inferSelect | null = null;

    try {
      const cached = await redis.get<string>(CACHE_KEYS.giftCard(claimCode));
      if (cached) {
        giftCard = JSON.parse(cached);
      }
    } catch {
      // Cache miss or Redis error -- fall through to database
    }

    // SLOW PATH: query database if not in cache
    if (!giftCard) {
      const results = await db
        .select()
        .from(schema.giftCards)
        .where(eq(schema.giftCards.claimCode, claimCode))
        .limit(1);

      giftCard = results[0] ?? null;
    }

    // Validation checks
    if (!giftCard) {
      throw new Error("Gift card not found. Check the code and try again.");
    }

    if (giftCard.status !== "active") {
      throw new Error(
        `This gift card has already been ${giftCard.status}.`
      );
    }

    if (new Date() > new Date(giftCard.expiresAt)) {
      throw new Error("This gift card has expired.");
    }

    if (giftCard.creatorId === userId) {
      throw new Error("You cannot claim your own gift card.");
    }

    // Mark as claimed in database
    await db
      .update(schema.giftCards)
      .set({
        status: "claimed",
        claimerId: userId,
        claimedAt: new Date(),
      })
      .where(eq(schema.giftCards.claimCode, claimCode));

    // Remove from cache (it's been claimed -- no longer active)
    redis.del(CACHE_KEYS.giftCard(claimCode)).catch(() => {});

    // Record in transaction history
    await db.insert(schema.transactions).values({
      userId,
      type: "gift_claim",
      amount: giftCard.amountMusd,
      currency: "MUSD",
      metadata: { giftCardId: giftCard.id, claimCode },
    });

    return {
      success: true,
      amountMusd: giftCard.amountMusd,
      message: giftCard.message ?? null,
      theme: giftCard.theme,
    };
  });