// components/landing/HowItWorks.tsx
"use client";

import { useInView } from "@/hooks/useInView";
import { Wallet, Lock, Banknote, TrendingUp } from "lucide-react";

const STEPS = [
  {
    step: 1,
    icon: Wallet,
    title: "Connect Your Wallet",
    description:
      "Link your MetaMask or WalletConnect-compatible wallet to MezoBanq. " +
      "Your keys, your coins — always non-custodial.",
    color: "text-bitcoin-400",
    glow: "rgba(247,147,26,0.1)",
  },
  {
    step: 2,
    icon: Lock,
    title: "Lock BTC as Collateral",
    description:
      "Deposit Bitcoin into the Mezo borrowing contract. " +
      "Your BTC is securely locked on-chain and verifiable by anyone.",
    color: "text-mezo-400",
    glow: "rgba(30,168,248,0.1)",
  },
  {
    step: 3,
    icon: Banknote,
    title: "Receive MUSD Instantly",
    description:
      "Get MUSD stablecoin minted directly to your wallet at a fixed 1% annual rate. " +
      "Use it for payments, gift cards, or yield farming.",
    color: "text-green-400",
    glow: "rgba(74,222,128,0.1)",
  },
  {
    step: 4,
    icon: TrendingUp,
    title: "Repay & Unlock Anytime",
    description:
      "Repay your MUSD whenever you're ready. Your Bitcoin is returned immediately — " +
      "no lock-up periods, no hidden fees.",
    color: "text-yellow-400",
    glow: "rgba(250,204,21,0.1)",
  },
];

export function HowItWorks() {
  const { ref, isInView } = useInView<HTMLDivElement>({ margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative"
    >
      {/* Background ambient glow */}
      <div
        className="glow-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[80%] h-[400px] bg-mezo-500/[0.04] blur-[100px]
          pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Section header */}
      <div
        className={`text-center mb-16 sm:mb-24 relative z-10 animate-on-scroll ${isInView ? "in-view" : ""}`}
      >
        <span
          className="inline-block py-1.5 px-4 rounded-full glass
            border border-bitcoin-500/20 text-bitcoin-500 text-[11px] sm:text-xs
            font-bold tracking-[0.2em] uppercase mb-6 shadow-bitcoin-sm"
        >
          How It Works
        </span>
        <h2
          className="text-3xl sm:text-5xl md:text-6xl font-bold font-space text-white
            mb-5 sm:mb-6 tracking-tight drop-shadow-xl"
        >
          Four Steps to{" "}
          <span className="gradient-text block mt-2">Financial Freedom</span>
        </h2>
        <p className="text-zinc-400 text-base sm:text-xl max-w-2xl mx-auto font-light px-2 sm:px-0">
          From wallet connection to MUSD in your hands — the entire process
          takes less than two minutes.
        </p>
      </div>

      {/* Steps — stacked on mobile, row on desktop */}
      <div className="relative z-10">
        {/* Desktop connector line (hidden on mobile) */}
        <div
          className="hidden lg:block absolute top-[56px] left-[12.5%] right-[12.5%]
            h-[2px] z-0"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-surface-600/40 rounded-full" />
          <div
            className={`absolute inset-0 bg-linear-to-r from-bitcoin-500/50
              via-mezo-500/30 to-bitcoin-500/50 rounded-full
              animate-line-grow ${isInView ? "in-view" : ""}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {STEPS.map((step, i) => (
            <div
              key={step.step}
              className={`animate-on-scroll ${isInView ? "in-view" : ""}
                relative text-center group`}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              {/* Mobile connector line (visible only on mobile, between items) */}
              {i < STEPS.length - 1 && (
                <div
                  className="block md:hidden absolute left-1/2 -translate-x-1/2
                    -bottom-6 w-[2px] h-6"
                  aria-hidden="true"
                >
                  <div className="w-full h-full bg-linear-to-b from-surface-600/40 to-transparent rounded-full" />
                </div>
              )}

              {/* Step Icon Container */}
              <div className="relative inline-flex z-10">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl
                    glass border border-white/6 hover:border-bitcoin-500/30
                    flex items-center justify-center mx-auto mb-6 sm:mb-8
                    transition-all duration-400
                    group-hover:scale-105 group-hover:shadow-bitcoin-sm
                    bg-surface-900 relative overflow-hidden"
                >
                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100
                      transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at center, ${step.glow} 0%, transparent 70%)`,
                    }}
                    aria-hidden="true"
                  />

                  <step.icon
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${step.color} drop-shadow-lg
                      transition-all duration-300 group-hover:scale-110 relative z-10`}
                    aria-hidden="true"
                  />
                </div>

                {/* Floating step number badge */}
                <div
                  className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3
                    w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-bitcoin
                    text-white text-xs sm:text-sm font-bold flex items-center
                    justify-center shadow-lg border-2 border-surface-900
                    group-hover:scale-110 transition-transform duration-300"
                >
                  {step.step}
                </div>
              </div>

              <h3 className="text-white font-bold text-lg sm:text-xl mb-3 sm:mb-4
                font-space tracking-wide">
                {step.title}
              </h3>

              <p className="text-zinc-400/90 text-sm sm:text-base leading-relaxed
                font-light max-w-xs mx-auto px-2 sm:px-0">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
