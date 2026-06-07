// lib/wagmi.ts
// Wagmi is the standard React library for Ethereum wallet connections
// It provides hooks like useAccount, useBalance, useConnect, etc.

import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";

// ■■ Define the Mezo Network ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// Mezo is not in Viem's default chain list, so we define it manually
// Get the actual Chain ID from https://docs.mezo.org/network/rpc

export const mezoTestnet = defineChain({
  id: 31611, // Mezo testnet Chain ID -- verify at docs.mezo.org
  name: "Mezo Testnet",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18, // Mezo uses 18 decimals (standard EVM)
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MEZO_RPC_URL ?? "https://rpc.test.mezo.org",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Mezo Explorer",
      url: "https://explorer.test.mezo.org",
    },
  },
  testnet: true,
});

// This config is created ONCE and shared across the entire app
// It defines: which chains to support, which connectors (wallets), and
// which RPC transports (how we talk to the blockchain)
export const wagmiConfig = createConfig({
  chains: [mezoTestnet, sepolia, mainnet],
  connectors: [
    // injected() handles MetaMask and any browser-injected wallet
    // When user has MetaMask installed, this connector finds it automatically
    injected({
      target: "metaMask", // Specifically target MetaMask (not other injected wallets)
    }),

    // walletConnect() handles mobile wallets via QR code scanning
    // WalletConnect v2 protocol -- supports 300+ mobile wallets
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      metadata: {
        name: "MezoBanq",
        description: "Bitcoin-native banking powered by Mezo Protocol",
        url: process.env.NEXT_PUBLIC_APP_URL ?? "https://mezobanq.xyz",
        icons: [`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`],
      },
      // Show QR code modal only when WalletConnect is specifically chosen
      showQrModal: true,
    }),
  ],

  // Transports define HOW we connect to each chain's RPC node
  // http() uses a simple HTTP connection (works in all environments)
  transports: {
    [mezoTestnet.id]: http(process.env.NEXT_PUBLIC_MEZO_RPC_URL),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [mainnet.id]: http(), // Uses Wagmi's built-in public RPC for mainnet
  },

  // Enable SSR to prevent hydration mismatches in Next.js
  ssr: true,
});

// Export the Mezo chain for use in other files
export { mezoTestnet as mezoChain };