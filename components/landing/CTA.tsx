// components/landing/CTA.tsx
"use client";

import { useInView } from "@/hooks/useInView";
import Link from "next/link";
import { ArrowRight, Zap, Sparkles } from "lucide-react";

export function CTA() {
  const { ref, isInView } = useInView<HTMLDivElement>({ margin: "-80px" });

  return (
    <section ref={ref} className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div
        className={`animate-on-scroll ${isInView ? "in-view" : ""}
          max-w-4xl mx-auto text-center relative overflow-hidden
          rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16
          gradient-border noise-overlay`}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 bg-linear-to-br
            from-bitcoin-900/30 via-surface-800 to-surface-800"
          aria-hidden="true"
        />
        <div
          className="glow-orb absolute top-0 left-1/2 -translate-x-1/2
            w-[300px] sm:w-[500px] h-[200px] sm:h-[300px]
            bg-bitcoin-500/[0.08] blur-[80px] rounded-full"
          aria-hidden="true"
        />
        {/* Bottom secondary glow */}
        <div
          className="glow-orb absolute bottom-0 right-0
            w-[200px] h-[200px]
            bg-mezo-500/[0.04] blur-[60px] rounded-full"
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10">
          <div
            className={`flex justify-center mb-5 sm:mb-6 animate-scale-in ${isInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.2s" }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2
                rounded-full border border-bitcoin-500/25 bg-bitcoin-500/[0.08]
                text-bitcoin-400 text-xs sm:text-sm font-medium"
            >
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Start in under 2 minutes
              <Sparkles className="w-3 h-3 text-bitcoin-500/60" aria-hidden="true" />
            </span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold font-space text-white
              mb-4 leading-tight animate-on-scroll ${isInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.3s" }}
          >
            Ready to{" "}
            <span className="gradient-text">Bank on Bitcoin</span>?
          </h2>

          <p
            className={`text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mb-8
              px-2 sm:px-0 animate-on-scroll ${isInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.4s" }}
          >
            Join thousands of users who borrow, save, and send with their
            Bitcoin — without ever selling a single satoshi.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center
              items-center px-2 sm:px-0 animate-on-scroll ${isInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.5s" }}
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2
                w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4
                bg-gradient-bitcoin text-white font-bold
                text-base rounded-xl sm:rounded-2xl transition-all duration-300
                shadow-bitcoin hover:shadow-bitcoin-lg
                hover:scale-[1.02] hover:-translate-y-0.5
                overflow-hidden relative"
            >
              {/* Shine */}
              <div className="absolute inset-0 -translate-x-full bg-white/15 skew-x-30 group-hover:animate-[shimmer_1.5s_ease-out] pointer-events-none" />
              Launch App
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/#how-it-works"
              className="inline-flex items-center justify-center gap-2
                w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4
                bg-white/4 hover:bg-white/8 text-zinc-300
                hover:text-white font-semibold text-base rounded-xl sm:rounded-2xl
                border border-white/8 hover:border-white/15
                transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
