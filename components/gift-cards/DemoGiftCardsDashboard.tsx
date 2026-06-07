// components/gift-cards/DemoGiftCardsDashboard.tsx
// Renders gift cards from DemoContext — used when NEXT_PUBLIC_DEMO_MODE is true.
"use client";

import Link from "next/link";
import { Plus, CreditCard } from "lucide-react";
import { useDemo } from "@/lib/demo/DemoContext";
import { GiftCard } from "./GiftCardGrid";

export function DemoGiftCardsDashboard() {
  const { giftCards } = useDemo();

  return (
    <>
      {giftCards.length === 0 ? (
        <div className="card-premium p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-800 border border-surface-600 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-zinc-500" aria-hidden="true" />
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
              theme={card.theme}
              status={card.status}
              expiresAt={card.expiresAt}
            />
          ))}
        </div>
      )}
    </>
  );
}
