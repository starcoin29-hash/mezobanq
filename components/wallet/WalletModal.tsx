// components/wallet/WalletModal.tsx
"use client";
import { useConnect, useAccount } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { AnimatePresence, motion } from "framer-motion";
import { X, Wallet, Smartphone } from "lucide-react";
import { wagmiConfig } from "@/lib/wagmi";
import { useEffect } from "react";
interface WalletModalProps {
open: boolean;
onClose: () => void;
}
export function WalletModal({ open, onClose }: WalletModalProps) {
const { connect, isPending } = useConnect();
const { isConnected } = useAccount();
// Close automatically when wallet connects successfully
useEffect(() => {
if (isConnected) onClose();
}, [isConnected, onClose]);
// Close on Escape key press
useEffect(() => {
if (!open) return;
const handleKey = (e: KeyboardEvent) => {
if (e.key === "Escape") onClose();
};
document.addEventListener("keydown", handleKey);
return () => document.removeEventListener("keydown", handleKey);
}, [open, onClose]);
const WALLET_OPTIONS = [
{
id: "metamask",
label: "MetaMask",
description: "Browser extension wallet",
Icon: Wallet,
action: () => connect({ connector: injected({ target: "metaMask" }) }),
},
{
id: "walletconnect",
label: "WalletConnect",
description: "Mobile wallets via QR code",
Icon: Smartphone,
action: () =>
connect({
connector: walletConnect({
projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
}),
}),
},
];
return (
<AnimatePresence>
{open && (
<>
{/* Backdrop */}
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={onClose}
className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
aria-hidden="true"
/>
{/* Modal */}
<motion.div
role="dialog"
aria-modal="true"
aria-label="Connect your wallet"
initial={{ opacity: 0, scale: 0.95, y: 10 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 10 }}
transition={{ duration: 0.2, ease: "easeOut" }}
className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
z-[70] w-full max-w-sm mx-4"
>
<div className="bg-surface-800 border border-surface-500
rounded-2xl p-6 shadow-2xl">
{/* Header */}
<div className="flex items-center justify-between mb-6">
<h2 className="text-lg font-semibold text-white font-space">
Connect Wallet
</h2>
<button
onClick={onClose}
className="p-1.5 rounded-lg text-zinc-400 hover:text-white
hover:bg-surface-600 transition-colors"
aria-label="Close dialog"
>
<X className="w-5 h-5" aria-hidden="true" />
</button>
</div>
{/* Wallet options */}
<div className="space-y-3">
{WALLET_OPTIONS.map((wallet) => (
<button
key={wallet.id}
onClick={wallet.action}
disabled={isPending}
className="w-full flex items-center gap-4 p-4 rounded-xl
bg-surface-700 hover:bg-surface-600
border border-surface-500 hover:border-bitcoin-500/40
transition-all duration-150
disabled:opacity-50 disabled:cursor-not-allowed
text-left"
>
<div className="w-10 h-10 rounded-lg bg-bitcoin-500/10
flex items-center justify-center flex-shrink-0">
<wallet.Icon
className="w-5 h-5 text-bitcoin-400"
aria-hidden="true"
/>
</div>
<div>
<p className="text-white font-medium text-sm">
    {wallet.label}
</p>
<p className="text-zinc-500 text-xs mt-0.5">
{wallet.description}
</p>
</div>
</button>
))}
</div>
{isPending && (
<p className="text-center text-sm text-zinc-500 mt-4 animate-pulse">
Connecting to wallet...
</p>
)}
<p className="text-xs text-zinc-600 text-center mt-5">
By connecting, you agree to our Terms of Service
</p>
</div>
</motion.div>
</>
)}
</AnimatePresence>
);
}
