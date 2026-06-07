// components/dashboard/ActivityFeed.tsx
"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  TrendingUp,
  Send,
} from "lucide-react";
import { clsx } from "clsx";

const TX_TYPE_CONFIG = {
  borrow: { icon: ArrowDownLeft, label: "Borrowed MUSD", color: "text-green-400" },
  repay: { icon: ArrowUpRight, label: "Repaid MUSD", color: "text-blue-400" },
  send: { icon: Send, label: "Sent MUSD", color: "text-purple-400" },
  receive: { icon: ArrowDownLeft, label: "Received MUSD", color: "text-green-400" },
  gift_create: { icon: CreditCard, label: "Created Gift Card", color: "text-bitcoin-400" },
  gift_claim: { icon: CreditCard, label: "Claimed Gift Card", color: "text-mezo-400" },
  yield_deposit: { icon: TrendingUp, label: "Deposited to Yield", color: "text-yellow-400" },
  yield_withdraw: { icon: TrendingUp, label: "Withdrew from Yield", color: "text-orange-400" },
} as const;

interface Transaction {
  id: string;
  type: keyof typeof TX_TYPE_CONFIG;
  amount: string | null;
  currency: string | null;
  createdAt: Date | null;
}

interface ActivityFeedProps {
  transactions: Transaction[];
}

export function ActivityFeed({ transactions }: ActivityFeedProps) {
  if (transactions.length === 0) {
    return (
      <div
        className="bg-surface-800 border border-surface-600 rounded-2xl
          p-8 text-center"
      >
        <p className="text-zinc-500 text-sm">No activity yet.</p>
      </div>
    );
  }

  return (
    <div
      className="bg-surface-800 border border-surface-600 rounded-2xl
        divide-y divide-surface-600 overflow-hidden"
    >
      {transactions.map((tx, i) => {
        const config = TX_TYPE_CONFIG[tx.type];
        const Icon = config.icon;

        return (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 px-4 py-3
              hover:bg-surface-700 transition-colors"
          >
            <div
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                config.color === "text-green-400" && "bg-green-500/10",
                config.color === "text-blue-400" && "bg-blue-500/10",
                config.color === "text-purple-400" && "bg-purple-500/10",
                config.color === "text-bitcoin-400" && "bg-bitcoin-500/10",
                config.color === "text-mezo-400" && "bg-mezo-500/10",
                config.color === "text-yellow-400" && "bg-yellow-500/10",
                config.color === "text-orange-400" && "bg-orange-500/10"
              )}
            >
              <Icon
                className={clsx("w-4 h-4", config.color)}
                aria-hidden="true"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {config.label}
              </p>
              <p className="text-xs text-zinc-500">
                {tx.createdAt
                  ? formatDistanceToNow(new Date(tx.createdAt), {
                      addSuffix: true,
                    })
                  : ""}
              </p>
            </div>

            <p className="text-sm font-mono text-zinc-300 flex-shrink-0">
              {tx.amount ? `${Number(tx.amount).toLocaleString()} ${tx.currency ?? "MUSD"}` : ""}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
