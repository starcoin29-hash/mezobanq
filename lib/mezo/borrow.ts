// lib/mezo/borrow.ts
// Utility functions for the borrow/repay flow

import { parseEther, formatEther, formatUnits } from "viem";

// BTC to MUSD calculation helpers
// These run locally in the browser -- no blockchain call needed

// Calculate how much MUSD you can get for a given BTC amount and LTV
// btcAmount: string like "0.1"
// ltv: number between 0 and 1 (e.g., 0.7 for 70%)
// btcPriceUsd: current BTC price in USD
export function calculateMusd(
  btcAmount: string,
  ltv: number,
  btcPriceUsd: number
): number {
  const btcValue = parseFloat(btcAmount) * btcPriceUsd;
  return btcValue * ltv;
}

// Calculate the annual interest cost in MUSD
export function calculateAnnualInterest(musdAmount: number): number {
  return musdAmount * 0.01; // 1% fixed rate
}

// Calculate the monthly interest cost
export function calculateMonthlyInterest(musdAmount: number): number {
  return calculateAnnualInterest(musdAmount) / 12;
}

// Calculate the liquidation price for a position
// If BTC drops below this price, the position gets liquidated
// liquidationLtv: the threshold at which Mezo auto-liquidates (usually 85%)
export function calculateLiquidationPrice(
  btcAmount: number,
  musdBorrowed: number,
  liquidationLtv: number = 0.85
): number {
  // liquidation happens when: (debt / collateral value) > liquidationLtv
  // collateral value = musdBorrowed / liquidationLtv
  // btcPrice at liquidation = collateralValue / btcAmount
  return musdBorrowed / (btcAmount * liquidationLtv);
}

// Risk level based on current LTV
export function getRiskLevel(currentLtv: number): {
  level: "safe" | "moderate" | "high" | "critical";
  color: string;
  label: string;
} {
  if (currentLtv < 0.4)
    return { level: "safe", color: "green", label: "Safe" };
  if (currentLtv < 0.6)
    return { level: "moderate", color: "yellow", label: "Moderate" };
  if (currentLtv < 0.7)
    return { level: "high", color: "orange", label: "High Risk" };
  return { level: "critical", color: "red", label: "Critical" };
}

// Format a BigInt value (from blockchain) to a human-readable string
// value: BigInt from contract call (e.g., 100000000000000000000n)
// decimals: number of decimal places (usually 18 for EVM tokens)
// displayDecimals: how many decimals to show in the UI
export function formatTokenAmount(
  value: bigint,
  decimals: number = 18,
  displayDecimals: number = 2
): string {
  const formatted = formatUnits(value, decimals);
  return parseFloat(formatted).toFixed(displayDecimals);
}

// Convert a human-readable string to BigInt for contract calls
// amount: string like "100.50"
// This converts to 100500000000000000000n (18 decimals)
export function toContractAmount(amount: string): bigint {
  return parseEther(amount);
}