// components/mezo/PassportCard.tsx
"use client";
import { useAccount, useWriteContract,
useWaitForTransactionReceipt } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getPassportData,
PASSPORT_LEVELS } from "@/lib/mezo/passport";
import { CONTRACTS, PASSPORT_ABI } from "@/lib/mezo/contracts";
import { Shield, Star, Lock, Zap } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { useDemo } from "@/lib/demo/DemoContext";

export function PassportCard() {
const { address, isConnected: wagmiConnected } = useAccount();
const demo = useDemo();
const isConnected = demo.isDemoMode ? demo.isConnected : wagmiConnected;
const effectiveAddress = demo.isDemoMode ? demo.address : address;

// useQuery fetches passport data with automatic caching and retries
const { data: passport, isLoading, refetch } = useQuery({
queryKey: ["passport", effectiveAddress],
queryFn: () => getPassportData(effectiveAddress!),
enabled: !!effectiveAddress && !demo.isDemoMode, // Skip query in demo mode
staleTime: 60_000, // Cache for 1 minute (passport level rarely changes)
});

// In demo mode, use mock passport data
const effectivePassport = demo.isDemoMode
  ? { level: 2, activePositions: demo.positions.filter(p => p.status === "active").length, totalBorrowed: 16900, totalRepaid: 1200 }
  : passport;
const effectiveLoading = demo.isDemoMode ? false : isLoading;

const {
writeContract,
data: mintTxHash,
isPending: isMinting,
} = useWriteContract();
const { isLoading: isConfirmingMint, isSuccess: mintSuccess } =
useWaitForTransactionReceipt({ hash: mintTxHash });
if (mintSuccess) {
toast.success("Mezo Passport minted! Welcome to the ecosystem.");
refetch();
}
function handleMint() {
if (demo.isDemoMode) {
  toast.success("Mezo Passport minted! Welcome to the ecosystem.");
  return;
}
writeContract({
address: CONTRACTS.PASSPORT,
abi: PASSPORT_ABI,
functionName: "mint",
});
}
if (!isConnected) {
return (
<div className="bg-surface-800 border border-surface-600 rounded-2xl
p-8 text-center">
<Shield className="w-12 h-12 text-zinc-600 mx-auto mb-3"
aria-hidden="true" />
<p className="text-zinc-400">
Connect your wallet to view your Mezo Passport
</p>
</div>
);
}
if (effectiveLoading) {
return (
<div className="bg-surface-800 border border-surface-600 rounded-2xl
h-56 animate-pulse" aria-label="Loading passport..." />
);
}
// No passport yet -- show mint button
if (!effectivePassport) {
return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
className="bg-surface-800 border border-surface-600 rounded-2xl
p-8 text-center space-y-4"
>
<div className="w-16 h-16 rounded-2xl bg-surface-700
flex items-center justify-center mx-auto">
<Shield className="w-8 h-8 text-zinc-500" aria-hidden="true" />
</div>
<div>
<h3 className="text-white font-semibold text-lg font-space">
No Passport Yet
</h3>
<p className="text-zinc-400 text-sm mt-2 max-w-xs mx-auto">
Mint your free Mezo Passport to unlock better rates, higher
LTV limits, and exclusive features.
</p>
</div>
{/* Level preview */}
<div className="grid grid-cols-5 gap-2 my-4">
{Object.entries(PASSPORT_LEVELS).map(([level, info]) => (
<div key={level}
className="text-center opacity-40">
<div className="text-xs text-zinc-500">{info.name}</div>
<div className="text-xs text-zinc-600">LTV {(info.maxLtv * 100).toFixed(0)}%</div>
</div>
))}
</div>
<button
onClick={handleMint}
disabled={isMinting || isConfirmingMint}
className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
bg-bitcoin-500 hover:bg-bitcoin-600 text-white font-semibold
transition-all duration-200 disabled:opacity-50
disabled:cursor-not-allowed shadow-bitcoin-sm"
>
{isMinting || isConfirmingMint ? "Minting..." : "Mint Passport (Free)"}
</button>
</motion.div>
);
}
const levelInfo = PASSPORT_LEVELS[effectivePassport.level];
// Has passport -- show details
return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
className="relative overflow-hidden bg-surface-800
border border-bitcoin-500/20 rounded-2xl p-6
shadow-card"
>
{/* Background glow */}
<div className="absolute inset-0 bg-gradient-to-br
from-bitcoin-500/5 to-transparent pointer-events-none"
aria-hidden="true" />
<div className="relative">
{/* Header */}
<div className="flex items-center gap-3 mb-6">
<div className="w-12 h-12 rounded-xl bg-bitcoin-500/15
flex items-center justify-center">
<Shield className="w-6 h-6 text-bitcoin-400" aria-hidden="true" />
</div>
<div className="flex-1">
    <p className="text-xs text-zinc-500 uppercase tracking-wider">
Mezo Passport
</p>
<p className="text-white font-bold text-lg font-space">
Level {effectivePassport.level} -- {levelInfo.name}
</p>
</div>
{/* Star rating */}
<div className="flex gap-0.5" aria-label={`Level ${effectivePassport.level}`}>
{Array.from({ length: 5 }).map((_, i) => (
<Star
key={i}
className={clsx("w-4 h-4", i < effectivePassport.level
? "text-bitcoin-400 fill-bitcoin-400"
: "text-surface-500"
)}
aria-hidden="true"
/>
))}
</div>
</div>
{/* Stats grid */}
<div className="grid grid-cols-3 gap-3">
{[
{ label: "Max LTV", value: `${(levelInfo.maxLtv * 100).toFixed(0)}%` },
{ label: "Rate Discount", value: `${(levelInfo.rateDiscount * 100).toFixed(0)}%` },
{ label: "Positions", value: effectivePassport.activePositions.toString() },
].map(({ label, value }) => (
<div key={label}
className="bg-surface-700 rounded-xl p-3 text-center
border border-surface-500">
<p className="text-2xl font-bold text-bitcoin-400 font-mono">
{value}
</p>
<p className="text-xs text-zinc-500 mt-1">{label}</p>
</div>
))}
</div>
</div>
</motion.div>
);
}
