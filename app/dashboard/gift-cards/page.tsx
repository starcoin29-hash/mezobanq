// app/dashboard/gift-cards/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { GiftCard } from "@/components/gift-cards/GiftCardGrid";
import { DemoGiftCardsDashboard } from "@/components/gift-cards/DemoGiftCardsDashboard";
import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";

export const metadata = { title: "Gift Cards" };

export default async function GiftCardsPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const isDevBypass = process.env.DEV_BYPASS_AUTH === "true";
  let giftCards: any[] = [];

  // In demo mode, gift cards live in client-side React state (DemoContext).
  // The DemoGiftCardsDashboard component reads them directly — no DB needed.
  if (!isDemoMode) {
    try {
      if (!isDevBypass) {
        let user = null;
        try {
          user = await currentUser();
        } catch (error) {
          console.warn("[GiftCardsPage] Clerk auth failed:", error);
          return null;
        }
        if (!user) return null;

        // Ensure user exists in DB (needed for FK on gift cards)
        const existingUser = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.id, user.id))
          .limit(1);

        if (existingUser.length === 0) {
          await db.insert(schema.users).values({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress ?? null,
            username: user.firstName ?? user.username ?? null,
          });
        }

        giftCards = await db
          .select()
          .from(schema.giftCards)
          .where(eq(schema.giftCards.creatorId, user.id))
          .orderBy(desc(schema.giftCards.createdAt))
          .limit(20);
      } else {
        giftCards = await db
          .select()
          .from(schema.giftCards)
          .where(eq(schema.giftCards.creatorId, "dev-user"))
          .orderBy(desc(schema.giftCards.createdAt))
          .limit(20);
      }
    } catch (error) {
      console.error("Failed to fetch gift cards:", error);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-400" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-space tracking-tight">
              MUSD Gift Cards
            </h1>
          </div>
          <p className="text-zinc-400 text-sm sm:text-base mt-1 font-light">
            Send Bitcoin-backed gift cards to anyone, claimable with a simple
            code
          </p>
        </div>

        <Link
          href="/dashboard/gift-cards/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-bitcoin-500 hover:bg-bitcoin-600 text-white font-semibold
            text-sm transition-all shadow-bitcoin-sm hover:shadow-bitcoin
            hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Create Gift Card
        </Link>
      </div>

      {/* Gift card grid */}
      {isDemoMode ? (
        // Demo mode: reads from DemoContext client state
        <DemoGiftCardsDashboard />
      ) : giftCards.length === 0 ? (
        <div className="card-premium p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-800 border border-surface-600 flex items-center justify-center mx-auto mb-4">
            <CreditCard
              className="w-8 h-8 text-zinc-500"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            No Gift Cards Yet
          </h3>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6 font-light">
            Create your first MUSD gift card and share it with friends,
            family, or anyone who deserves some Bitcoin-backed stablecoins.
          </p>
          <Link
            href="/dashboard/gift-cards/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-bitcoin-500 hover:bg-bitcoin-600 text-white font-semibold
              text-sm transition-all shadow-bitcoin-sm hover:shadow-bitcoin"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create Your First Gift Card
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {giftCards.map((card) => (
            <GiftCard
              key={card.id}
              claimCode={card.claimCode}
              amountMusd={card.amountMusd}
              message={card.message}
              theme={(card.theme as "bitcoin" | "birthday" | "minimal" | "neon" | "gold") ?? "bitcoin"}
              status={(card.status as "active" | "claimed" | "expired" | "cancelled") ?? "active"}
              expiresAt={card.expiresAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
