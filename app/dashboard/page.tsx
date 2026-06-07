// app/(dashboard)/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DemoDashboard } from "@/components/dashboard/DemoDashboard";
import Link from "next/link";
import { Bitcoin, ArrowRight, Sparkles } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const isDevBypass = process.env.DEV_BYPASS_AUTH === "true";
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // In demo mode, render the client-side DemoDashboard
  // which reads all data from DemoContext (no DB queries needed)
  if (isDemoMode) {
    return <DemoDashboard />;
  }

  let positions: any[] = [];
  let transactions: any[] = [];

  if (!isDevBypass) {
    let user = null;
    try {
      user = await currentUser();
    } catch (error) {
      console.warn("[DashboardPage] Clerk auth failed:", error);
      return null; // Layout will show InlineSignIn
    }

    if (!user) return null;

    // Run both queries in parallel for performance
    [positions, transactions] = await Promise.all([
      db
        .select()
        .from(schema.positions)
        .where(eq(schema.positions.userId, user.id))
        .orderBy(desc(schema.positions.openedAt))
        .limit(10),
      db
        .select()
        .from(schema.transactions)
        .where(eq(schema.transactions.userId, user.id))
        .orderBy(desc(schema.transactions.createdAt))
        .limit(15),
    ]);
  }

  const activePositions = positions.filter((p: any) => p.status === "active");
  const totalBorrowed = activePositions.reduce(
    (sum: number, p: any) => sum + Number(p.borrowedMusd ?? 0),
    0
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-bitcoin-500/10 border border-bitcoin-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-bitcoin-400" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-white font-space tracking-tight">
              Dashboard Overview
            </h1>
          </div>
          <p className="text-zinc-400 text-base mt-1 font-light">
            Welcome back to your Bitcoin banking portal.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <BalanceCard
          label="MUSD Borrowed"
          value={`$${totalBorrowed.toLocaleString()}`}
          subtext="Across all positions"
          color="bitcoin"
        />
        <BalanceCard
          label="Active Positions"
          value={activePositions.length.toString()}
          subtext="Open borrow positions"
          color="teal"
        />
        <BalanceCard
          label="Interest Rate"
          value="1.00%"
          subtext="Fixed annual rate"
          color="green"
        />
        <BalanceCard
          label="Mezo Network"
          value="Live"
          subtext="All systems operational"
          color="purple"
        />
      </div>

      {/* Positions + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-space tracking-wide flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-bitcoin-500" />
              Active Positions
            </h2>
            <Link href="/dashboard/borrow" className="text-sm font-medium text-bitcoin-400 hover:text-bitcoin-300 transition-colors flex items-center gap-1">
              New Position
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {activePositions.length === 0 ? (
            <div
              className="card-premium p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-surface-800 border border-surface-600 flex items-center justify-center mx-auto mb-4">
                 <Bitcoin className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-white text-lg font-bold mb-2">No active positions yet</h3>
              <p className="text-zinc-400 mb-6 font-light max-w-sm mx-auto">Lock your Bitcoin and mint MUSD to start leveraging your assets.</p>
              <Link
                href="/dashboard/borrow"
                className="inline-flex items-center gap-2 px-6 py-3
                  rounded-xl bg-bitcoin-500 hover:bg-bitcoin-600 text-white
                  font-semibold text-sm transition-all shadow-bitcoin-sm hover:shadow-bitcoin hover:-translate-y-0.5"
              >
                Open Your First Position
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activePositions.map((pos) => (
                <PositionCard key={pos.id} position={pos} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white font-space tracking-wide">
            Recent Activity
          </h2>
          <div className="card-premium p-6">
            <ActivityFeed transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
