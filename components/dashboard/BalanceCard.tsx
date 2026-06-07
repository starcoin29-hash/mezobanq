// components/dashboard/BalanceCard.tsx
"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

const COLOR_MAP = {
  bitcoin: {
    bg: "bg-bitcoin-500/10",
    border: "border-bitcoin-500/20",
    text: "text-bitcoin-400",
    glow: "shadow-[0_0_20px_rgba(247,147,26,0.1)]",
  },
  teal: {
    bg: "bg-mezo-500/10",
    border: "border-mezo-500/20",
    text: "text-mezo-400",
    glow: "shadow-[0_0_20px_rgba(78,205,196,0.1)]",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-400",
    glow: "shadow-[0_0_20px_rgba(74,222,128,0.1)]",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
    glow: "shadow-[0_0_20px_rgba(192,132,252,0.1)]",
  },
} as const;

interface BalanceCardProps {
  label: string;
  value: string;
  subtext: string;
  color: keyof typeof COLOR_MAP;
}

export function BalanceCard({ label, value, subtext, color }: BalanceCardProps) {
  const c = COLOR_MAP[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        "rounded-3xl p-6 glass relative overflow-hidden group transition-all duration-300",
        "hover:-translate-y-1",
        c.glow
      )}
    >
      {/* Background colored accent gradient */}
      <div className={clsx("absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-50 rounded-full pointer-events-none transition-opacity duration-300 group-hover:opacity-80", c.bg)} />

      <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-2">
        {label}
      </p>
      <p className={clsx("text-3xl sm:text-4xl font-bold font-space drop-shadow-sm", c.text)}>
        {value}
      </p>
      <p className="text-sm text-zinc-500 mt-2 font-light">{subtext}</p>
    </motion.div>
  );
}
