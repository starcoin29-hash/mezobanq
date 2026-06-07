// app/(dashboard)/yield/page.tsx
"use client";

import { TrendingUp, ArrowUpRight, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useDemo } from "@/lib/demo/DemoContext";

const VAULTS = [
  {
    id: "stable",
    name: "Stable Yield Vault",
    apy: "4.2%",
    tvl: "$2.4M",
    risk: "Low",
    riskColor: "text-green-400 bg-green-500/10",
    description: "Conservative lending strategy. MUSD is lent to vetted borrowers.",
    accentColor: "from-green-500/20 to-green-500/5",
  },
  {
    id: "balanced",
    name: "Balanced Growth Vault",
    apy: "6.8%",
    tvl: "$1.1M",
    risk: "Medium",
    riskColor: "text-yellow-400 bg-yellow-500/10",
    description: "Mix of lending and liquidity provision across Mezo DEXs.",
    accentColor: "from-yellow-500/20 to-yellow-500/5",
  },
  {
    id: "aggressive",
    name: "Max Yield Vault",
    apy: "9.5%",
    tvl: "$480K",
    risk: "Higher",
    riskColor: "text-orange-400 bg-orange-500/10",
    description: "Leveraged yield strategies. Higher returns, higher volatility.",
    accentColor: "from-bitcoin-500/20 to-bitcoin-500/5",
  },
];

export default function YieldPage() {
  const { isConnected: wagmiConnected } = useAccount();
  const demo = useDemo();
  const isConnected = demo.isDemoMode ? demo.isConnected : wagmiConnected;

  const [depositAmount, setDepositAmount] = useState("");
  const [selectedVault, setSelectedVault] = useState<string | null>(null);

  async function handleDeposit(vaultId: string) {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast.error("Enter a valid MUSD amount.");
      return;
    }

    // Demo mode: simulate the deposit
    if (demo.isDemoMode) {
      const amt = Number(depositAmount);
      if (amt > demo.musdBalance) {
        toast.error(`Insufficient MUSD. You have ${demo.musdBalance.toLocaleString()} MUSD.`);
        return;
      }
      toast.loading("Depositing MUSD...", { id: "yield" });
      await new Promise((r) => setTimeout(r, 1000));
      // Use simulateGiftCard internally — it deducts MUSD and logs a transaction
      // We'll actually log it as a yield_deposit by using the same mechanism
      demo.simulateGiftCard(amt);
      toast.dismiss("yield");
      toast.success(`Deposited ${amt.toLocaleString()} MUSD into vault.`);
      setDepositAmount("");
      setSelectedVault(null);
      return;
    }

    toast.success(
      `Depositing ${depositAmount} MUSD into vault. Transaction pending...`
    );
    setDepositAmount("");
    setSelectedVault(null);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-space tracking-tight">
            Earn Yield
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base mt-1 font-light">
          Deposit your MUSD into yield vaults and earn passive income — enough
          to cover your 1% borrow cost
        </p>
      </div>

      {/* Vault cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VAULTS.map((vault, i) => (
          <div
            key={vault.id}
            className="card-premium p-6 flex flex-col relative overflow-hidden"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Accent gradient at top */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${vault.accentColor}`}
            />

            <div className="flex items-center justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl bg-bitcoin-500/10
                  flex items-center justify-center"
              >
                <TrendingUp
                  className="w-5 h-5 text-bitcoin-400"
                  aria-hidden="true"
                />
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${vault.riskColor}`}
              >
                {vault.risk}
              </span>
            </div>

            <h3 className="text-white font-semibold text-lg mb-1">
              {vault.name}
            </h3>
            <p className="text-zinc-500 text-sm mb-4 flex-1 font-light">
              {vault.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-surface-800/80 rounded-xl p-3 text-center border border-white/[0.04]">
                <p className="text-xl font-bold text-green-400 font-mono">
                  {vault.apy}
                </p>
                <p className="text-xs text-zinc-500">APY</p>
              </div>
              <div className="bg-surface-800/80 rounded-xl p-3 text-center border border-white/[0.04]">
                <p className="text-xl font-bold text-bitcoin-400 font-mono">
                  {vault.tvl}
                </p>
                <p className="text-xs text-zinc-500">TVL</p>
              </div>
            </div>

            {selectedVault === vault.id ? (
              <div className="space-y-3">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="MUSD amount"
                  className="w-full bg-surface-800 border border-surface-500
                    text-white rounded-xl px-4 py-2.5 text-sm font-mono
                    placeholder-zinc-600 focus:outline-none
                    focus:border-bitcoin-500/60 focus:ring-1 focus:ring-bitcoin-500/40
                    transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeposit(vault.id)}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-bitcoin-500
                      hover:bg-bitcoin-600 text-white text-sm font-semibold
                      transition-all shadow-bitcoin-sm hover:shadow-bitcoin"
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setSelectedVault(null)}
                    className="px-3 py-2.5 rounded-xl bg-surface-700
                      hover:bg-surface-600 text-zinc-300 text-sm
                      transition-colors border border-white/[0.06]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSelectedVault(vault.id)}
                className="w-full flex items-center justify-center gap-2
                  px-4 py-2.5 rounded-xl bg-surface-800/80 hover:bg-surface-700
                  border border-white/[0.06] text-zinc-300 hover:text-white
                  text-sm font-medium transition-all hover:border-bitcoin-500/30"
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                Deposit MUSD
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="card-premium p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-bitcoin-500/10 flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-bitcoin-400" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">
            How yield covers your borrow costs
          </p>
          <p className="text-zinc-500 text-sm mt-1 font-light">
            Borrow MUSD at 1% fixed rate, then deposit into a vault earning
            4-9% APY. The yield more than covers your interest cost, meaning
            your Bitcoin effectively earns you money while you hold it.
          </p>
        </div>
      </div>
    </div>
  );
}
