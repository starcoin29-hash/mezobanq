// components/mezo/BorrowForm.tsx
"use client";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useWriteContract,
useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS, BORROWING_ABI } from "@/lib/mezo/contracts";
import {
calculateMusd, calculateMonthlyInterest,
calculateLiquidationPrice, getRiskLevel,
} from "@/lib/mezo/borrow";
import { toast } from "sonner";
import { Bitcoin, ArrowRight, Info } from "lucide-react";
import { useDemo } from "@/lib/demo/DemoContext";

// Zod schema validates the form before it reaches the blockchain
const borrowSchema = z.object({
collateralBtc: z
.string()
.min(1, "Enter a BTC amount")
.refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive")
.refine((v) => Number(v) >= 0.001, "Minimum is 0.001 BTC"),
});
type BorrowFormData = z.infer<typeof borrowSchema>;
const BTC_PRICE = 65_000; // In production, fetch from /api/btc-price

export function BorrowForm() {
const { isConnected: wagmiConnected } = useAccount();
const demo = useDemo();
const isConnected = demo.isDemoMode ? demo.isConnected : wagmiConnected;

const [ltvPercent, setLtvPercent] = useState(50);
const {
register,
watch,
handleSubmit,
reset,
formState: { errors },
} = useForm<BorrowFormData>({ resolver: zodResolver(borrowSchema) });
const collateralStr = watch("collateralBtc") ?? "0";
const collateralBtc = parseFloat(collateralStr) || 0;
const musdAmount = calculateMusd(collateralStr, ltvPercent / 100, BTC_PRICE);
const monthly = calculateMonthlyInterest(musdAmount);
const liqPrice = calculateLiquidationPrice(collateralBtc, musdAmount);
const risk = getRiskLevel(ltvPercent / 100);

// Write contract hook: sends the openPosition transaction
const { writeContract, data: txHash, isPending } = useWriteContract();
// Wait for the transaction to be confirmed on-chain
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
hash: txHash,
});

// Show success toast when transaction confirms
if (isSuccess) {
toast.success("Position opened! MUSD is now in your wallet.", {
id: "borrow-success",
});
}

const onSubmit = useCallback(
async (data: BorrowFormData) => {
if (!isConnected) {
toast.error("Please connect your wallet first.");
return;
}
if (musdAmount < 1) {
toast.error("MUSD amount too small.");
return;
}

// ── Demo mode: simulate in-memory ──
if (demo.isDemoMode) {
const btcAmt = parseFloat(data.collateralBtc);
if (btcAmt > demo.btcBalance) {
  toast.error(`Insufficient BTC. You have ${demo.btcBalance.toFixed(4)} BTC.`);
  return;
}
toast.loading("Opening position...", { id: "borrow" });
// Brief delay to simulate on-chain confirmation
await new Promise((r) => setTimeout(r, 1200));
demo.simulateBorrow(btcAmt, musdAmount, ltvPercent / 100);
toast.dismiss("borrow");
toast.success("Position opened! MUSD is now in your wallet.", {
  id: "borrow-success-demo",
});
reset();
return;
}

// ── Real mode: send on-chain transaction ──
try {
toast.loading("Opening position...", { id: "borrow" });
writeContract({
address: CONTRACTS.BORROWING,
abi: BORROWING_ABI,
functionName: "openPosition",
args: [
parseEther(data.collateralBtc), // BTC amount in wei
parseEther(musdAmount.toFixed(2)), // MUSD to mint in wei
],
value: parseEther(data.collateralBtc), // BTC sent with transaction
});
toast.dismiss("borrow");
} catch (err) {
toast.dismiss("borrow");
toast.error("Transaction failed. Please try again.");
console.error(err);
}
},
[isConnected, musdAmount, writeContract, demo, ltvPercent, reset]
);

const isLoading = demo.isDemoMode ? false : (isPending || isConfirming);

return (
<div className="bg-surface-800 border border-surface-600 rounded-2xl
p-6 shadow-card max-w-lg w-full">
{/* Header */}
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-xl bg-bitcoin-500/15
flex items-center justify-center">
<Bitcoin className="w-5 h-5 text-bitcoin-400" aria-hidden="true" />
</div>
<div>
<h2 className="text-white font-semibold text-lg font-space">
Borrow MUSD
</h2>
<p className="text-zinc-500 text-sm">
Lock BTC -- Receive MUSD at 1% APR
</p>
</div>
</div>

{/* Show available BTC in demo mode */}
{demo.isDemoMode && isConnected && (
<div className="mb-5 px-3 py-2 rounded-lg bg-bitcoin-500/5 border border-bitcoin-500/10">
<p className="text-xs text-zinc-400">
Available: <span className="text-bitcoin-400 font-mono font-medium">{demo.btcBalance.toFixed(4)} BTC</span>
{" · "}
<span className="text-mezo-400 font-mono font-medium">{demo.musdBalance.toLocaleString()} MUSD</span>
</p>
</div>
)}

<form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
{/* BTC amount input */}
<div>
<label
htmlFor="collateralBtc"
className="block text-sm font-medium text-zinc-300 mb-2"
>
Bitcoin Collateral
</label>
<div className="relative">
    <input
id="collateralBtc"
{...register("collateralBtc")}
type="number"
step="0.001"
min="0.001"
placeholder="0.00"
autoComplete="off"
className="w-full bg-surface-700 border border-surface-500
text-white text-lg font-mono rounded-xl px-4 py-3 pr-16
placeholder-zinc-600
focus:outline-none focus:border-bitcoin-500/60
focus:ring-1 focus:ring-bitcoin-500/40
transition-colors"
/>
<span className="absolute right-4 top-1/2 -translate-y-1/2
text-bitcoin-400 font-bold text-sm font-mono">
BTC
</span>
</div>
{collateralBtc > 0 && (
<p className="text-xs text-zinc-500 mt-1.5">
Approx. value: ${(collateralBtc * BTC_PRICE).toLocaleString()} USD
</p>
)}
{errors.collateralBtc && (
<p className="text-xs text-red-400 mt-1.5" role="alert">
{errors.collateralBtc.message}
</p>
)}
</div>
{/* LTV Slider */}
<div>
<div className="flex justify-between items-center mb-2">
<label className="text-sm font-medium text-zinc-300">
Loan-to-Value Ratio
</label>
<span className="text-bitcoin-400 font-bold font-mono">
{ltvPercent}%
</span>
</div>
<input
type="range"
min={10}
max={70}
step={5}
value={ltvPercent}
onChange={(e) => setLtvPercent(Number(e.target.value))}
className="w-full h-2 rounded-full appearance-none cursor-pointer
bg-surface-600 accent-bitcoin-500"
aria-label="Loan to value ratio"
/>
<div className="flex justify-between text-xs text-zinc-600 mt-1">
<span>10% Safe</span>
<span>40% Moderate</span>
<span>70% Max</span>
</div>
{/* Risk indicator */}
<div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium
${risk.level === "safe" ? "bg-green-500/10 text-green-400" : ""}
${risk.level === "moderate" ? "bg-yellow-500/10 text-yellow-400" : ""}
${risk.level === "high" ? "bg-orange-500/10 text-orange-400" : ""}
${risk.level === "critical" ? "bg-red-500/10 text-red-400" : ""}
`}>
Risk Level: {risk.label}
</div>
</div>
{/* Summary box -- animated, only shows when amount is entered */}
<AnimatePresence>
{collateralBtc > 0 && musdAmount > 0 && (
<motion.div
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: "auto" }}
exit={{ opacity: 0, height: 0 }}
transition={{ duration: 0.2 }}
className="bg-surface-700 rounded-xl p-4 border border-surface-500
space-y-2.5"
>
<p className="text-xs text-zinc-500 uppercase tracking-wider
font-semibold">
Position Summary
</p>
{[
["You deposit", `${collateralBtc} BTC`],
["You receive", `${musdAmount.toFixed(2)} MUSD`],
["Interest rate", "1.00% per year (fixed)"],
["Monthly cost", `$${monthly.toFixed(2)} MUSD`],
["Liquidation", `BTC below $${liqPrice.toFixed(0)}`],
].map(([label, value]) => (
<div key={label}
className="flex justify-between items-center text-sm">
<span className="text-zinc-500">{label}</span>
<span className="text-white font-medium font-mono">{value}</span>
</div>
))}
</motion.div>
)}
</AnimatePresence>
{/* Submit button */}
<button
type="submit"
disabled={!isConnected || isLoading}
className="w-full flex items-center justify-center gap-2
px-6 py-3.5 rounded-xl font-semibold text-base
bg-bitcoin-500 hover:bg-bitcoin-600 text-white
shadow-bitcoin-sm hover:shadow-bitcoin
transition-all duration-200
disabled:opacity-50 disabled:cursor-not-allowed
disabled:shadow-none"
>
{!isConnected ? "Connect Wallet First" : ""}
{isConfirming ? "Confirming on chain..." : ""}
{isPending ? "Approve in MetaMask..." : ""}
{!isConnected || isLoading ? "" : (
<>
Open Position &amp; Mint MUSD
<ArrowRight className="w-4 h-4" aria-hidden="true" />
</>
)}
</button>
</form>
</div>
);
}