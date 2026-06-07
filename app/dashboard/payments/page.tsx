// app/(dashboard)/payments/page.tsx
"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther, isAddress } from "viem";
import { CONTRACTS, MUSD_ABI } from "@/lib/mezo/contracts";
import { Send, ArrowRight, Info, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useDemo } from "@/lib/demo/DemoContext";

export default function PaymentsPage() {
  const { isConnected: wagmiConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  const demo = useDemo();
  const isConnected = demo.isDemoMode ? demo.isConnected : wagmiConnected;

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSend() {
    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (!recipient || !isAddress(recipient)) {
      toast.error("Enter a valid wallet address.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid MUSD amount.");
      return;
    }

    // ── Demo mode: simulate send ──
    if (demo.isDemoMode) {
      const sendAmt = Number(amount);
      if (sendAmt > demo.musdBalance) {
        toast.error(`Insufficient MUSD. You have ${demo.musdBalance.toLocaleString()} MUSD.`);
        return;
      }
      toast.loading("Sending MUSD...", { id: "send" });
      await new Promise((r) => setTimeout(r, 1000));
      demo.simulateSend(sendAmt, recipient);
      toast.dismiss("send");
      toast.success(`Sent ${sendAmt.toLocaleString()} MUSD successfully!`);
      setRecipient("");
      setAmount("");
      return;
    }

    // ── Real mode ──
    writeContract({
      address: CONTRACTS.MUSD_TOKEN,
      abi: MUSD_ABI,
      functionName: "transfer",
      args: [recipient as `0x${string}`, parseEther(amount)],
    });

    toast.success("Transfer submitted. Confirming on-chain...");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Send className="w-5 h-5 text-purple-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-space tracking-tight">
            Send &amp; Receive MUSD
          </h1>
        </div>
        <p className="text-zinc-400 text-sm sm:text-base mt-1 font-light">
          Instant P2P payments. No bank delays. No SWIFT fees.
          Works globally, 24/7.
        </p>
      </div>

      {/* Send form */}
      <div className="card-premium p-6 sm:p-8 relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/30 via-bitcoin-500/20 to-transparent" />

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl bg-purple-500/10
              flex items-center justify-center"
          >
            <Wallet
              className="w-5 h-5 text-purple-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg font-space">
              Send MUSD
            </h2>
            <p className="text-zinc-500 text-sm font-light">
              Transfer MUSD to any wallet address
            </p>
          </div>
        </div>

        {/* Show available balance in demo mode */}
        {demo.isDemoMode && isConnected && (
          <div className="mb-5 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <p className="text-xs text-zinc-400">
              Available: <span className="text-mezo-400 font-mono font-medium">{demo.musdBalance.toLocaleString()} MUSD</span>
            </p>
          </div>
        )}

        <div className="space-y-5">
          {/* Recipient */}
          <div>
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full bg-surface-800 border border-white/[0.06]
                text-white font-mono text-sm rounded-xl px-4 py-3
                placeholder-zinc-600 focus:outline-none
                focus:border-bitcoin-500/60 focus:ring-1
                focus:ring-bitcoin-500/40 transition-colors"
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Amount
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full bg-surface-800 border border-white/[0.06]
                  text-white text-lg font-mono rounded-xl px-4 py-3 pr-16
                  placeholder-zinc-600 focus:outline-none
                  focus:border-bitcoin-500/60 focus:ring-1
                  focus:ring-bitcoin-500/40 transition-colors"
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2
                  text-bitcoin-400 font-bold text-sm font-mono"
              >
                MUSD
              </span>
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!isConnected || isPending}
            className="w-full flex items-center justify-center gap-2
              px-6 py-3.5 rounded-xl font-semibold text-base
              bg-bitcoin-500 hover:bg-bitcoin-600 text-white
              shadow-bitcoin-sm hover:shadow-bitcoin
              transition-all duration-200 hover:scale-[1.01]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Sending..." : "Send MUSD"}
            {!isPending && (
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card-premium p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-bitcoin-500/10 flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-bitcoin-400" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">
            How MUSD payments work
          </p>
          <p className="text-zinc-500 text-sm mt-1 font-light">
            MUSD is a stablecoin on the Mezo network. Transfers are processed
            on-chain and settle in seconds. The recipient needs a Mezo-compatible
            wallet (MetaMask configured for Mezo Testnet) to receive funds.
          </p>
        </div>
      </div>
    </div>
  );
}
