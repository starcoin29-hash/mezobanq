// components/landing/Stats.tsx
"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { TrendingUp, Users, Percent, Shield } from "lucide-react";

// Count-up animation hook
function useCountUp(
  target: number,
  duration: number = 1500,
  started: boolean = false
) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16); // 60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, started]);

  return count;
}

const STATS = [
  {
    label: "Total MUSD Minted",
    value: 12_500_000,
    prefix: "$",
    suffix: "+",
    icon: TrendingUp,
    color: "text-bitcoin-400",
    glow: "rgba(247,147,26,0.1)",
  },
  {
    label: "Active Positions",
    value: 4_280,
    prefix: "",
    suffix: "+",
    icon: Users,
    color: "text-mezo-400",
    glow: "rgba(30,168,248,0.1)",
  },
  {
    label: "Interest Rate",
    value: 1,
    prefix: "",
    suffix: "%",
    icon: Percent,
    color: "text-green-400",
    glow: "rgba(74,222,128,0.1)",
  },
  {
    label: "Bitcoin Secured",
    value: 189,
    prefix: "",
    suffix: " BTC",
    icon: Shield,
    color: "text-yellow-400",
    glow: "rgba(250,204,21,0.1)",
  },
];

export function Stats() {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className="relative py-12 sm:py-16 border-y border-white/4"
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,7,10,0.5) 0%, rgba(13,13,20,0.8) 50%, rgba(7,7,10,0.5) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {STATS.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Extracted to its own component so useCountUp hook is called at top level
function StatItem({
  stat,
  index,
  isInView,
}: {
  stat: (typeof STATS)[number];
  index: number;
  isInView: boolean;
}) {
  const count = useCountUp(stat.value, 1200, isInView);

  return (
    <div
      className={`animate-scale-in ${isInView ? "in-view" : ""}
        group relative text-center px-4 py-5 sm:py-6 rounded-2xl
        border border-transparent hover:border-white/6
        hover:bg-white/2 transition-all duration-300`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0
          group-hover:opacity-100 transition-opacity duration-500
          pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${stat.glow} 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div className="flex justify-center mb-3 relative z-10">
        <stat.icon
          className={`w-5 h-5 ${stat.color} opacity-60 group-hover:opacity-100
            transition-opacity duration-300`}
          aria-hidden="true"
        />
      </div>

      {/* Value */}
      <div
        className={`text-2xl sm:text-3xl md:text-4xl font-bold font-space
          ${stat.color} tabular-nums relative z-10 transition-all duration-300
          group-hover:scale-105`}
      >
        {stat.prefix}
        {count.toLocaleString()}
        {stat.suffix}
      </div>

      {/* Label */}
      <div className="text-zinc-500 text-xs sm:text-sm mt-2 relative z-10
        font-medium tracking-wide">
        {stat.label}
      </div>
    </div>
  );
}