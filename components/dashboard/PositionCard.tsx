// components/dashboard/PositionCard.tsx
"use client";

import { motion } from "framer-motion";
import { Bitcoin, TrendingUp, AlertTriangle } from "lucide-react";
import { getRiskLevel } from "@/lib/mezo/borrow";
import { clsx } from "clsx";

interface Position {
  id: string;
  collateralBtc: string | null;
  borrowedMusd: string | null;
  ltvRatio: string | null;
  interestRate: string | null;
  status: string | null;
  openedAt: Date | null;
}

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const collateral = Number(position.collateralBtc ?? 0);
  const borrowed = Number(position.borrowedMusd ?? 0);
  const ltv = Number(position.ltvRatio ?? 0);
  const risk = getRiskLevel(ltv);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-800 border border-surface-600 rounded-2xl p-5
        hover:border-surface-500 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-bitcoin-500/10
              flex items-center justify-center"
          >
            <Bitcoin
              className="w-5 h-5 text-bitcoin-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              BTC → MUSD Position
            </p>
            <p className="text-xs text-zinc-500">
              {position.openedAt
                ? new Date(position.openedAt).toLocaleDateString()
                : ""}
            </p>
          </div>
        </div>

        {/* Risk badge */}
        <span
          className={clsx(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            risk.level === "safe" && "bg-green-500/10 text-green-400",
            risk.level === "moderate" && "bg-yellow-500/10 text-yellow-400",
            risk.level === "high" && "bg-orange-500/10 text-orange-400",
            risk.level === "critical" && "bg-red-500/10 text-red-400"
          )}
        >
          {risk.label}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-zinc-500">Collateral</p>
          <p className="text-sm font-mono text-white">
            {collateral.toFixed(4)} BTC
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Borrowed</p>
          <p className="text-sm font-mono text-bitcoin-400">
            ${borrowed.toLocaleString()} MUSD
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">LTV</p>
          <p className="text-sm font-mono text-white">
            {(ltv * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}
