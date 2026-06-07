// app/Web3Provider.tsx
// Isolated Web3 provider — only loaded on dashboard routes
// This keeps wagmi/viem/WalletConnect OUT of the landing page bundle
"use client";

import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
