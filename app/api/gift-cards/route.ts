// app/api/gift-cards/route.ts
// API endpoint for creating gift cards
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const isDevBypass = process.env.DEV_BYPASS_AUTH === "true";
    let userId = "dev-user";

    if (!isDevBypass) {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;

      // Ensure user exists in the users table (FK constraint requires this)
      const existingUser = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (existingUser.length === 0) {
        await db.insert(schema.users).values({
          id: userId,
          email: user.emailAddresses[0]?.emailAddress ?? null,
          username: user.firstName ?? user.username ?? null,
        });
      }
    } else {
      // Dev bypass: ensure dev-user exists
      const existingUser = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.id, "dev-user"))
        .limit(1);

      if (existingUser.length === 0) {
        await db.insert(schema.users).values({
          id: "dev-user",
          email: "dev@mezobanq.local",
          username: "DevUser",
        });
      }
    }

    // Parse request body
    const body = await req.json();
    const { amount, message, theme } = body;

    // Validate amount
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount < 1) {
      return NextResponse.json(
        { error: "Amount must be at least 1 MUSD" },
        { status: 400 }
      );
    }

    if (numAmount > 10_000) {
      return NextResponse.json(
        { error: "Maximum gift card amount is 10,000 MUSD" },
        { status: 400 }
      );
    }

    // Generate a unique 16-character claim code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let claimCode = "MEZO";
    for (let i = 0; i < 12; i++) {
      claimCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Set expiry to 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Validate theme
    const validThemes = ["bitcoin", "birthday", "minimal", "neon", "gold"];
    const safeTheme = validThemes.includes(theme) ? theme : "bitcoin";

    // Insert into database
    const [giftCard] = await db
      .insert(schema.giftCards)
      .values({
        claimCode,
        creatorId: userId,
        amountMusd: numAmount.toFixed(2),
        message: message || null,
        theme: safeTheme,
        status: "active",
        expiresAt,
      })
      .returning();

    return NextResponse.json({
      success: true,
      giftCard: {
        id: giftCard.id,
        claimCode: giftCard.claimCode,
        amountMusd: giftCard.amountMusd,
        theme: giftCard.theme,
        expiresAt: giftCard.expiresAt,
      },
    });
  } catch (error: any) {
    console.error("Failed to create gift card:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create gift card" },
      { status: 500 }
    );
  }
}
