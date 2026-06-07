// lib/mezo/passport.ts
import { createPublicClient, http } from "viem";
import { mezoChain } from "@/lib/wagmi";
import { CONTRACTS, PASSPORT_ABI } from "./contracts";

// Check if contract addresses are real (not placeholder zeros)
const isValidContractAddress = (address: string): boolean => {
  if (!address) return false;
  // Reject placeholder addresses like 0x000...0001 through 0x000...0009
  const stripped = address.replace(/^0x0*/i, "");
  return stripped.length > 4; // Real addresses have many hex chars
};

// Public client: reads from blockchain without needing a wallet connection
// It can call 'view' functions (free reads) on any smart contract
const publicClient = createPublicClient({
  chain: mezoChain,
  transport: http(process.env.NEXT_PUBLIC_MEZO_RPC_URL),
});

// Passport level definitions
// Higher levels = better LTV limits and interest rate discounts
export const PASSPORT_LEVELS = {
  1: {
    name: "Satoshi",
    minBorrowed: 0,
    maxLtv: 0.65,
    rateDiscount: 0,
    color: "text-zinc-400",
  },
  2: {
    name: "Miner",
    minBorrowed: 1_000,
    maxLtv: 0.67,
    rateDiscount: 0.05,
    color: "text-blue-400",
  },
  3: {
    name: "Holder",
    minBorrowed: 10_000,
    maxLtv: 0.70,
    rateDiscount: 0.10,
    color: "text-green-400",
  },
  4: {
    name: "Whale",
    minBorrowed: 100_000,
    maxLtv: 0.75,
    rateDiscount: 0.15,
    color: "text-purple-400",
  },
  5: {
    name: "Nakamoto",
    minBorrowed: 1_000_000,
    maxLtv: 0.80,
    rateDiscount: 0.20,
    color: "text-bitcoin-400",
  },
} as const;

export type PassportLevel = keyof typeof PASSPORT_LEVELS;

export interface PassportData {
  tokenId: string;
  level: PassportLevel;
  totalBorrowed: string;
  totalRepaid: string;
  activePositions: number;
  createdAt: Date;
}

// Fetch passport data for a wallet address
// Returns null if the address has no passport
export async function getPassportData(
  walletAddress: `0x${string}`
): Promise<PassportData | null> {
  try {
    // Guard: skip if contract address is a placeholder
    if (!isValidContractAddress(CONTRACTS.PASSPORT)) {
      console.warn(
        "[Passport] Skipping — PASSPORT contract address is a placeholder:",
        CONTRACTS.PASSPORT
      );
      return null;
    }

    // Step 1: Get the token ID for this wallet
    const tokenId = (await publicClient.readContract({
      address: CONTRACTS.PASSPORT,
      abi: PASSPORT_ABI,
      functionName: "passportOf",
      args: [walletAddress],
    })) as bigint;

    // Token ID of 0 means no passport
    if (!tokenId || tokenId === 0n) return null;

    // Step 2: Get the passport data for this token ID
    const data = (await publicClient.readContract({
      address: CONTRACTS.PASSPORT,
      abi: PASSPORT_ABI,
      functionName: "getPassportData",
      args: [tokenId],
    })) as [number, bigint, bigint, number, bigint];

    return {
      tokenId: tokenId.toString(),
      level: data[0] as PassportLevel,
      // Use BigInt division to avoid safe-integer overflow
      totalBorrowed: formatWei(data[1]),
      totalRepaid: formatWei(data[2]),
      activePositions: data[3],
      createdAt: new Date(Number(data[4]) * 1000),
    };
  } catch (error) {
    // Network errors, RPC failures, invalid contracts, etc.
    console.error("[Passport] Failed to fetch passport data:", error);
    return null;
  }
}

// Safely convert a bigint wei value to a human-readable decimal string
// without hitting JavaScript's Number.MAX_SAFE_INTEGER limit
function formatWei(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const fraction = wei % 10n ** 18n;
  // Take first 2 decimal places
  const fractionStr = fraction.toString().padStart(18, "0").slice(0, 2);
  return `${whole}.${fractionStr}`;
}