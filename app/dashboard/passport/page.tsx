// app/(dashboard)/passport/page.tsx
import { PassportCard } from "@/components/mezo/PassportCard";
import { Shield } from "lucide-react";

export const metadata = { title: "Mezo Passport" };

export default function PassportPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-mezo-500/10 border border-mezo-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-mezo-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-space tracking-tight">
            Mezo Passport
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base mt-1 font-light">
          Your on-chain identity and reputation — higher levels unlock better
          rates and higher LTV limits
        </p>
      </div>

      {/* Passport card (client component handles wallet state) */}
      <PassportCard />

      {/* Info section */}
      <div className="card-premium p-6 space-y-5 relative overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mezo-500/30 via-bitcoin-500/20 to-transparent" />

        <h2 className="text-white font-semibold text-lg font-space">
          How Passport Levels Work
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              level: "1 — Satoshi",
              req: "Mint passport (free)",
              ltv: "65%",
              discount: "0%",
            },
            {
              level: "2 — Miner",
              req: "Borrow $1,000+ MUSD",
              ltv: "67%",
              discount: "5%",
            },
            {
              level: "3 — Holder",
              req: "Borrow $10,000+ MUSD",
              ltv: "70%",
              discount: "10%",
            },
            {
              level: "4 — Whale",
              req: "Borrow $100,000+ MUSD",
              ltv: "75%",
              discount: "15%",
            },
            {
              level: "5 — Nakamoto",
              req: "Borrow $1,000,000+ MUSD",
              ltv: "80%",
              discount: "20%",
            },
          ].map((l) => (
            <div
              key={l.level}
              className="bg-surface-800/60 rounded-xl p-4 border border-white/[0.05]
                hover:border-bitcoin-500/20 transition-all duration-300"
            >
              <p className="text-white font-semibold text-sm mb-2">
                Level {l.level}
              </p>
              <div className="space-y-1 text-xs text-zinc-400">
                <p>
                  <span className="text-zinc-500">Requirement:</span> {l.req}
                </p>
                <p>
                  <span className="text-zinc-500">Max LTV:</span>{" "}
                  <span className="text-bitcoin-400 font-mono">{l.ltv}</span>
                </p>
                <p>
                  <span className="text-zinc-500">Rate Discount:</span>{" "}
                  <span className="text-green-400 font-mono">{l.discount}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
