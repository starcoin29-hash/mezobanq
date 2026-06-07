// components/dashboard/DemoDashboard.tsx
// Client component that renders the dashboard with demo data
// Uses the exact same child components (BalanceCard, PositionCard, ActivityFeed)
// so the UI is visually identical to the real dashboard.
"use client";

import { useDemo } from "@/lib/demo/DemoContext";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import Link from "next/link";
import { Bitcoin, ArrowRight, Sparkles, Wallet, Coins } from "lucide-react";
import { motion } from "framer-motion";

export function DemoDashboard() {
  const {
    isDemoMode,
    isConnected,
    btcBalance,
    musdBalance,
    positions,
    transactions,
  } = useDemo();

  // Only render when demo mode is active
  if (!isDemoMode) return null;

  const activePositions = positions.filter((p) => p.status === "active");
  const totalBorrowed = activePositions.reduce(
    (sum, p) => sum + Number(p.borrowedMusd ?? 0),
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

      {/* Wallet balance hero — only visible when connected in demo */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative rounded-3xl p-6 sm:p-8 overflow-hidden
            bg-gradient-to-br from-surface-800 via-surface-800 to-bitcoin-500/[0.08]
            border border-surface-600"
        >
          {/* Glow accent */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-bitcoin-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-mezo-500/8 rounded-full blur-3xl pointer-events-none" />

          <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-4">
            Wallet Holdings
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-bitcoin-500/15 border border-bitcoin-500/25 flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-bitcoin-400" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold font-space text-bitcoin-400 tracking-tight">
                  {btcBalance.toFixed(4)}
                </p>
                <p className="text-sm text-zinc-500 font-light">
                  BTC · ≈ ${(btcBalance * 65_000).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-mezo-500/15 border border-mezo-500/25 flex items-center justify-center">
                <Coins className="w-6 h-6 text-mezo-400" />
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold font-space text-mezo-400 tracking-tight">
                  {musdBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm text-zinc-500 font-light">
                  MUSD · Stablecoin
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
            <Link
              href="/dashboard/borrow"
              className="text-sm font-medium text-bitcoin-400 hover:text-bitcoin-300 transition-colors flex items-center gap-1"
            >
              New Position
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {activePositions.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-800 border border-surface-600 flex items-center justify-center mx-auto mb-4">
                <Bitcoin className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-white text-lg font-bold mb-2">
                No active positions yet
              </h3>
              <p className="text-zinc-400 mb-6 font-light max-w-sm mx-auto">
                Lock your Bitcoin and mint MUSD to start leveraging your assets.
              </p>
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
