// components/landing/Hero.tsx
// Landing page hero — pure CSS animations, zero framer-motion
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";

export function Hero() {
  // Trigger entrance animations after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section
      className="relative min-h-svh flex items-center justify-center
        overflow-hidden bg-surface-950"
    >
      {/* Background — static, GPU-optimized */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Main gradient */}
        <div
          className="absolute inset-0 bg-linear-to-b
            from-bitcoin-900/20 via-surface-950 to-surface-950"
        />

        {/* Grid overlay pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: [
              "linear-gradient(rgba(247,147,26,0.4) 1px, transparent 1px)",
              "linear-gradient(90deg, rgba(247,147,26,0.4) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "80px 80px",
          }}
        />

        {/* Glow orb 1 — GPU layer promoted, reduced blur */}
        <div
          className="glow-orb absolute top-[15%] left-[20%] w-[500px] h-[500px]
            sm:w-[700px] sm:h-[700px]
            rounded-full bg-bitcoin-500/[0.07] blur-[80px] animate-pulse-slow
            mix-blend-screen"
        />

        {/* Glow orb 2 — GPU layer promoted, reduced blur */}
        <div
          className="glow-orb absolute bottom-[15%] right-[15%] w-[400px] h-[400px]
            sm:w-[600px] sm:h-[600px]
            rounded-full bg-mezo-500/[0.06] blur-[80px] animate-float-slow
            mix-blend-screen"
        />

        {/* Subtle top-center radial glow — reduced blur */}
        <div
          className="glow-orb absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
            bg-bitcoin-500/[0.04] blur-[100px] rounded-full"
        />
      </div>

      {/* ■■ Main content ■■ */}
      <div
        className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8
          py-28 sm:py-32 text-center"
      >
        <div className="space-y-8 sm:space-y-10">
          {/* Badge */}
          <div
            className={`flex justify-center animate-on-scroll ${mounted ? "in-view" : ""}`}
            data-delay="1"
          >
            <span
              className="inline-flex items-center gap-2.5 px-5 py-2.5
                rounded-full border border-bitcoin-500/25 glass
                text-bitcoin-400 text-[11px] sm:text-xs font-bold
                tracking-[0.2em] uppercase shadow-bitcoin-sm"
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-bitcoin-500" aria-hidden="true" />
              Powered by Mezo Protocol
              <span
                className="w-2 h-2 rounded-full bg-bitcoin-400
                  animate-pulse shadow-[0_0_6px_rgba(247,147,26,0.6)]"
              />
            </span>
          </div>

          {/* Main heading */}
          <h1
            className={`text-[2.5rem] leading-[1.05] sm:text-7xl md:text-8xl
              lg:text-[7rem] font-bold font-space tracking-tighter
              drop-shadow-2xl animate-on-scroll ${mounted ? "in-view" : ""}`}
            data-delay="2"
          >
            <span className="text-white block pb-1 sm:pb-2">The Future of</span>
            <span className="gradient-text block py-1">
              Bitcoin Banking
            </span>
          </h1>

          {/* Subheading */}
          <p
            className={`text-base sm:text-xl md:text-2xl text-zinc-400
              max-w-3xl mx-auto leading-relaxed font-light tracking-wide
              px-2 sm:px-0 animate-on-scroll ${mounted ? "in-view" : ""}`}
            data-delay="3"
          >
            Unlock the full potential of your Bitcoin.{" "}
            Borrow{" "}
            <span className="text-bitcoin-400 font-semibold text-glow-sm">MUSD</span>
            {" "}at a{" "}
            <span className="text-bitcoin-400 font-semibold text-glow-sm">
              1% fixed rate
            </span>
            , send instant gift cards, earn sustainable yield
            — all without ever selling a single satoshi.
          </p>

          {/* CTA Buttons — no ConnectButton dependency, just Links */}
          <div
            className={`flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center
              items-center pt-2 sm:pt-4 px-4 sm:px-0 animate-on-scroll ${mounted ? "in-view" : ""}`}
            data-delay="4"
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-3
                w-full sm:w-auto justify-center
                px-7 sm:px-8 py-4
                bg-gradient-bitcoin text-white font-bold
                text-base sm:text-lg rounded-2xl transition-all duration-300
                shadow-bitcoin-lg hover:shadow-bitcoin
                hover:scale-[1.02] hover:-translate-y-1
                focus-visible:outline-2 focus-visible:outline-offset-4
                focus-visible:outline-bitcoin-400 overflow-hidden"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full bg-white/20 skew-x-30 group-hover:animate-[shimmer_1.5s_ease-out] pointer-events-none" />
              Start Banking on Bitcoin
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2
                w-full sm:w-auto
                px-5 sm:px-6 py-3 sm:py-3.5
                bg-white/4 hover:bg-white/8 text-zinc-300
                hover:text-white font-semibold text-sm sm:text-base
                rounded-xl sm:rounded-2xl border border-white/8
                hover:border-bitcoin-500/30
                transition-all duration-300"
            >
              Connect Wallet
            </Link>
          </div>

          {/* Trust badges */}
          <div
            className={`flex flex-wrap justify-center gap-3 sm:gap-6 pt-6 sm:pt-8
              text-[11px] sm:text-sm font-medium tracking-wide text-zinc-500 uppercase
              animate-on-scroll ${mounted ? "in-view" : ""}`}
            data-delay="5"
          >
            {[
              [Shield, "Non-custodial"],
              [Lock, "Self-sovereign"],
              [Zap, "1% Fixed Rate"],
            ].map(([Icon, label]) => (
              <div
                key={label as string}
                className="flex items-center gap-2 sm:gap-2.5 glass
                  px-3 sm:px-4 py-2 rounded-full
                  border border-white/4 hover:border-bitcoin-500/20
                  transition-colors duration-300"
              >
                <Icon
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-mezo-500"
                  aria-hidden="true"
                />
                <span>{label as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator — pure CSS animation */}
      <div
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2
          flex flex-col items-center gap-3 text-zinc-600
          animate-scroll-indicator"
        aria-hidden="true"
      >
        <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase">
          Scroll
        </span>
        <div
          className="w-px h-8 sm:h-12 bg-linear-to-b from-zinc-600
            to-transparent"
        />
      </div>
    </section>
  );
}
