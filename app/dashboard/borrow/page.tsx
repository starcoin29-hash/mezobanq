// app/(dashboard)/borrow/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { BorrowForm } from "@/components/mezo/BorrowForm";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { DemoBorrowPositions } from "@/components/dashboard/DemoBorrowPositions";
import { Landmark } from "lucide-react";

export const metadata = { title: "Borrow MUSD" };

export default async function BorrowPage() {
  const isDevBypass = process.env.DEV_BYPASS_AUTH === "true";
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  let positions: any[] = [];

  if (!isDevBypass && !isDemoMode) {
    let user = null;
    try {
      user = await currentUser();
    } catch (error) {
      console.warn("[BorrowPage] Clerk auth failed:", error);
      return null;
    }

    if (!user) return null;

    positions = await db
      .select()
      .from(schema.positions)
      .where(eq(schema.positions.userId, user.id))
      .orderBy(desc(schema.positions.openedAt))
      .limit(20);
  }

  const activePositions = positions.filter((p: any) => p.status === "active");

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-bitcoin-500/10 border border-bitcoin-500/20 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-bitcoin-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-space tracking-tight">
            Borrow MUSD
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base mt-1 font-light">
          Lock Bitcoin as collateral and mint MUSD at 1% fixed annual rate
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Borrow form */}
        <BorrowForm />

        {/* Right: Active positions */}
        {isDemoMode ? (
          <DemoBorrowPositions />
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white font-space">
              Your Positions ({activePositions.length})
            </h2>

            {activePositions.length === 0 ? (
              <div className="card-premium p-8 text-center">
                <p className="text-zinc-400 text-sm font-light">
                  No active positions. Use the form to open your first one.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activePositions.map((pos) => (
                  <PositionCard key={pos.id} position={pos} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
