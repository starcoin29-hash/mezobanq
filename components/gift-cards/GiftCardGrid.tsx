
// components/gift-cards/GiftCardGrid.tsx
"use client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { clsx } from "clsx";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, keccak256, toHex }                   from "viem";
import { CONTRACTS, GIFT_CARD_ABI, MUSD_ABI }             from "@/lib/mezo/contracts";
import {
CheckCircle2, XCircle, Clock, Share2,
} from "lucide-react";
// Theme configurations -- controls colors and decorative elements
const THEMES = {
bitcoin: {
gradient: "from-bitcoin-900/60 via-yellow-900/40 to-bitcoin-900/60",
border: "border-bitcoin-500/25",
accent: "text-bitcoin-400",
icon: "B", // Bitcoin B symbol
iconBg: "bg-bitcoin-500/15",
},
neon: {
gradient: "from-purple-900/60 via-blue-900/40 to-purple-900/60",
border: "border-purple-500/25",
accent: "text-purple-400",
icon: "N",
iconBg: "bg-purple-500/15",
},
gold: {
gradient: "from-yellow-900/60 via-amber-900/40 to-yellow-900/60",
border: "border-yellow-500/25",
accent: "text-yellow-400",
icon: "G",
iconBg: "bg-yellow-500/15",
},
minimal: {
gradient: "from-surface-700 via-surface-800 to-surface-700",
border: "border-surface-500",
accent: "text-zinc-300",
icon: "M",
iconBg: "bg-surface-600",
},
birthday: {
gradient: "from-pink-900/60 via-rose-900/40 to-pink-900/60",
border: "border-pink-500/25",
accent: "text-pink-400",
icon: "H",
},
} as const;
type Theme = keyof typeof THEMES;
type Status = "active" | "claimed" | "expired" | "cancelled";
interface GiftCardProps {
claimCode: string;
amountMusd: string;
message?: string | null;
theme: Theme;
status: Status;
expiresAt: string;
onShare?: (code: string) => void;
}
const STATUS_CONFIG: Record<Status, { icon: typeof CheckCircle2; label: string; color: string }> = {
active: { icon: Clock, label: "Active", color: "text-green-400 bg-green-500/10 bordergreen-500/20" },
claimed: { icon: CheckCircle2, label: "Claimed", color: "text-blue-400 bg-blue-500/10 borderblue-500/20" },
expired: { icon: XCircle, label: "Expired", color: "text-zinc-400 bg-surface-700 bordersurface-500" },
cancelled: { icon: XCircle, label: "Cancelled", color: "text-red-400 bg-red-500/10 borderred-500/20" },
};
export function GiftCard({
claimCode, amountMusd, message, theme,
status, expiresAt, onShare,
}: GiftCardProps) {
const t = THEMES[theme] ?? THEMES.bitcoin;
const s = STATUS_CONFIG[status];
const isActive = status === "active";
const StatusIcon = s.icon;
// Format the claim code with dashes for readability
// "MEZO1234ABCD5678" becomes "MEZO-1234-ABCD-5678"
const formattedCode = claimCode.match(/.{1,4}/g)?.join(" - ") ?? claimCode;
return (
<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
whileHover={{ scale: 1.02, y: -3 }}
transition={{ duration: 0.2 }}
className={clsx(
"relative overflow-hidden rounded-2xl border p-6",
"bg-gradient-to-br", t.gradient, t.border,
"shadow-card hover:shadow-card-hover transition-shadow"
)}
>
{/* Decorative watermark */}
<div
className="absolute -right-4 -bottom-4 text-[90px] font-bold
opacity-[0.06] select-none pointer-events-none leading-none"
aria-hidden="true"
>
{t.icon}
</div>
{/* Header row */}
<div className="relative flex justify-between items-start mb-5">
<div>
<p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
MUSD Gift Card
</p>
<p className={clsx(
"text-3xl font-bold font-mono",
t.accent
)}>
${Number(amountMusd).toLocaleString()} MUSD
</p>
</div>
{/* Status badge */}
<span className={clsx(
"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
"text-xs font-medium border",
s.color
)}>
<StatusIcon className="w-3 h-3" aria-hidden="true" />
{s.label}
</span>
</div>
{/* Message */}
{message && (
<p className="relative text-sm text-zinc-400 italic mb-4
line-clamp-2 bg-black/20 rounded-lg px-3 py-2">
"{message}"
</p>
)}
{/* Claim code */}
<div className="relative bg-black/30 rounded-xl p-3 mb-4
border border-white/5">
<p className="text-xs text-zinc-500 mb-1">Claim Code</p>
<p className="font-mono text-sm text-white tracking-widest
select-all">
{formattedCode}
</p>
</div>
{/* Footer */}
<div className="relative flex items-center justify-between">
<div className="flex items-center gap-1.5 text-xs text-zinc-600">
    <Clock className="w-3 h-3" aria-hidden="true" />
Expires {format(new Date(expiresAt), "MMM d, yyyy")}
</div>
{isActive && onShare && (
<button
onClick={() => onShare(claimCode)}
className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
bg-surface-700 hover:bg-surface-600 text-zinc-300
hover:text-white text-xs font-medium
border border-surface-500 transition-all"
aria-label="Share gift card"
>
<Share2 className="w-3 h-3" aria-hidden="true" />
Share
</button>
)}
</div>
</motion.div>
);
}
export function useCreateGiftCard() {
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });
  async function createOnChain(
    claimCode:  string,   // The 16-char code from our database
    amountMusd: string,   // e.g. "100"
    daysValid:  number    // e.g. 30
  ) {
    const amountWei  = parseEther(amountMusd);
    const expiresAt  = BigInt(Math.floor(Date.now() / 1000) + daysValid * 86400);
    // Hash the claim code -- we NEVER send plain text to the contract
    // keccak256(toUtf8Bytes(code)) produces the same hash as the Solidity
    // keccak256(abi.encodePacked(code))
    const codeHash = keccak256(toHex(claimCode));
    // Step 1: Approve the Gift Card contract to spend the MUSD
    writeContract({
      address:      CONTRACTS.MUSD_TOKEN,
      abi:          MUSD_ABI,
      functionName: "approve",
      args:         [CONTRACTS.GIFT_CARD, amountWei],
    });
    // Step 2: After approval confirms, call createCard
    // (In production, use useEffect to watch approval tx then call createCard)
    writeContract({
      address:      CONTRACTS.GIFT_CARD,
      abi:          GIFT_CARD_ABI,
      functionName: "createCard",
      args:         [amountWei, codeHash, expiresAt],
    });
  }
  return { createOnChain, isPending, isConfirming, isSuccess };
}
