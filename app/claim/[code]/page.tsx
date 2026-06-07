// app/claim/[code]/page.tsx
"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Bitcoin, Gift, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import Link from "next/link";
import { toast } from "sonner";

interface ClaimPageProps {
  params: Promise<{ code: string }>;
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const { code } = use(params);
  const { isConnected } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  async function handleClaim() {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setIsClaiming(true);

    try {
      // In production, this calls the claimGiftCard server action
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimCode: code }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to claim gift card.");
        return;
      }

      setClaimed(true);
      toast.success("Gift card claimed! MUSD has been sent to your wallet.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  }

  // Format the claim code with dashes for display
  const formattedCode = code.match(/.{1,4}/g)?.join(" - ") ?? code;

  if (claimed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div
            className="w-20 h-20 rounded-full bg-green-500/15
              flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white font-space">
            Gift Card Claimed!
          </h1>
          <p className="text-zinc-400 max-w-sm mx-auto">
            The MUSD has been sent to your connected wallet. You can use it
            to earn yield, make payments, or hold it as a stablecoin.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
              bg-bitcoin-500 hover:bg-bitcoin-600 text-white font-semibold
              transition-all"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px]
            h-[500px] bg-bitcoin-500/5 blur-[120px] rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-xl bg-bitcoin-500
              flex items-center justify-center shadow-bitcoin-sm"
          >
            <Bitcoin className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <span className="text-2xl font-bold font-space text-white">
            Mezo<span className="text-bitcoin-500">Banq</span>
          </span>
        </div>

        {/* Gift card */}
        <div
          className="bg-gradient-to-br from-bitcoin-900/40 via-surface-800
            to-surface-800 border border-bitcoin-500/20 rounded-2xl
            p-8 shadow-2xl text-center space-y-6"
        >
          <div
            className="w-16 h-16 rounded-2xl bg-bitcoin-500/15
              flex items-center justify-center mx-auto"
          >
            <Gift className="w-8 h-8 text-bitcoin-400" aria-hidden="true" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles
                className="w-4 h-4 text-bitcoin-400"
                aria-hidden="true"
              />
              <span className="text-sm text-bitcoin-400 font-medium">
                MUSD Gift Card
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white font-space">
              You&apos;ve received a gift!
            </h1>
          </div>

          {/* Claim code */}
          <div
            className="bg-black/30 rounded-xl p-4 border border-white/5"
          >
            <p className="text-xs text-zinc-500 mb-1">Claim Code</p>
            <p
              className="font-mono text-lg text-white tracking-widest
                select-all"
            >
              {formattedCode}
            </p>
          </div>

          {/* Action */}
          {isConnected ? (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full flex items-center justify-center gap-2
                px-6 py-3.5 rounded-xl font-semibold text-base
                bg-bitcoin-500 hover:bg-bitcoin-600 text-white
                shadow-bitcoin-sm hover:shadow-bitcoin
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming ? "Claiming..." : "Claim Gift Card"}
              {!isClaiming && (
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm">
                Connect your wallet to claim this gift card
              </p>
              <ConnectButton fullWidth />
            </div>
          )}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Gift cards are powered by MUSD on the Mezo network.
          Connect MetaMask to claim.
        </p>
      </motion.div>
    </div>
  );
}
