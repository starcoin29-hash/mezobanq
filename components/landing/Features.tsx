// components/landing/Features.tsx
"use client";

import { useInView } from "@/hooks/useInView";
import {
  Bitcoin, CreditCard, TrendingUp,
  Send, Shield, Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Bitcoin,
    title: "Borrow Against Bitcoin",
    description:
      "Lock your BTC as collateral and instantly receive MUSD " +
      "stablecoin. 1% fixed annual rate — the cheapest Bitcoin loan in DeFi.",
    color: "text-bitcoin-400",
    bg: "bg-bitcoin-500/15",
    border: "border-bitcoin-500/30",
    glowColor: "rgba(247,147,26,0.12)",
    shadow: "group-hover:shadow-[0_0_40px_rgba(247,147,26,0.12)]",
  },
  {
    icon: CreditCard,
    title: "MUSD Gift Cards",
    description:
      "Send Bitcoin-backed gift cards to anyone. Fully on-chain, " +
      "claimable with a simple code. Five beautiful themes to choose from.",
    color: "text-mezo-400",
    bg: "bg-mezo-500/15",
    border: "border-mezo-500/30",
    glowColor: "rgba(30,168,248,0.12)",
    shadow: "group-hover:shadow-[0_0_40px_rgba(30,168,248,0.12)]",
  },
  {
    icon: TrendingUp,
    title: "Earn Yield on MUSD",
    description:
      "Put your idle MUSD to work. Deposit into yield vaults " +
      "earning 4-8% APY — more than enough to cover your 1% borrow cost.",
    color: "text-green-400",
    bg: "bg-green-500/15",
    border: "border-green-500/30",
    glowColor: "rgba(74,222,128,0.12)",
    shadow: "group-hover:shadow-[0_0_40px_rgba(74,222,128,0.12)]",
  },
  {
    icon: Send,
    title: "Instant P2P Payments",
    description:
      "Send MUSD to any wallet instantly. No bank transfer delays. " +
      "No SWIFT fees. Works globally, 24/7.",
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    glowColor: "rgba(192,132,252,0.12)",
    shadow: "group-hover:shadow-[0_0_40px_rgba(192,132,252,0.12)]",
  },
  {
    icon: Shield,
    title: "Mezo Passport",
    description:
      "Build your on-chain identity and reputation. Higher " +
      "passport levels unlock better rates and higher LTV limits.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/15",
    border: "border-yellow-500/30",
    glowColor: "rgba(250,204,21,0.12)",
    shadow: "group-hover:shadow-[0_0_40px_rgba(250,204,21,0.12)]",
  },
  {
    icon: Zap,
    title: "Always Non-Custodial",
    description:
      "You hold your keys. We never touch your Bitcoin. " +
      "Every position is verifiable on-chain. No trust required.",
    color: "text-rose-400",
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    glowColor: "rgba(251,113,133,0.12)",
    shadow: "group-hover:shadow-[0_0_40px_rgba(251,113,133,0.12)]",
  },
];

export function Features() {
  const { ref, isInView } = useInView<HTMLDivElement>({ margin: "-80px" });

  return (
    <section
      id="features"
      ref={ref}
      className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative"
    >
      {/* Background ambient glow */}
      <div
        className="glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[80%] h-[500px] bg-bitcoin-500/[0.04] blur-[100px]
          pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Section header */}
      <div
        className={`text-center mb-14 sm:mb-20 relative z-10 animate-on-scroll ${isInView ? "in-view" : ""}`}
      >
        <span
          className="inline-block py-1.5 px-4 rounded-full glass
            border border-bitcoin-500/20 text-bitcoin-500 text-[11px] sm:text-xs
            font-bold tracking-[0.2em] uppercase mb-6 shadow-bitcoin-sm"
        >
          Features
        </span>
        <h2
          className="text-3xl sm:text-5xl md:text-6xl font-bold font-space text-white
            mb-5 sm:mb-6 tracking-tight drop-shadow-xl"
        >
          Everything You Need to{" "}
          <span className="gradient-text block mt-2">Bank on Bitcoin</span>
        </h2>
        <p className="text-zinc-400 text-base sm:text-xl max-w-2xl mx-auto font-light px-2 sm:px-0">
          MezoBanq combines the security of Bitcoin with the utility of
          modern financial tools — no compromises.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative z-10">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.title}
            className={`animate-on-scroll ${isInView ? "in-view" : ""}
              group relative rounded-2xl sm:rounded-3xl p-6 sm:p-8
              glass hover:bg-white/3
              transition-all duration-400 ease-out
              shadow-glass hover:-translate-y-2
              ${feature.shadow}
            `}
            style={{ transitionDelay: `${i * 0.08}s` }}
          >
            {/* Hover border effect */}
            <div
              className={`absolute inset-0 rounded-2xl sm:rounded-3xl border
                border-transparent transition-all duration-400
                ${feature.border} opacity-0 group-hover:opacity-100
                pointer-events-none`}
            />

            {/* Hover glow */}
            <div
              className="absolute inset-0 rounded-2xl sm:rounded-3xl
                opacity-0 group-hover:opacity-100 transition-opacity duration-500
                pointer-events-none"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${feature.glowColor} 0%, transparent 70%)`,
              }}
              aria-hidden="true"
            />

            {/* Icon */}
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl
                ${feature.bg} border border-white/5
                flex items-center justify-center mb-5 sm:mb-6 shadow-inner
                transition-all duration-300 group-hover:scale-110
                group-hover:border-white/10 relative z-10`}
            >
              <feature.icon
                className={`w-6 h-6 sm:w-7 sm:h-7 ${feature.color} drop-shadow-lg`}
                aria-hidden="true"
              />
            </div>

            <h3 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-3
              font-space tracking-wide relative z-10">
              {feature.title}
            </h3>
            <p className="text-zinc-400/90 text-sm sm:text-base leading-relaxed
              font-light relative z-10">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
