// lib/demo/DemoContext.tsx
// Central demo state — provides simulated wallet, balances, positions,
// and transactions to the entire app when NEXT_PUBLIC_DEMO_MODE is "true".
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  DEMO_WALLET_ADDRESS,
  DEMO_CHAIN,
  INITIAL_BTC_BALANCE,
  INITIAL_MUSD_BALANCE,
  createSeedPositions,
  createSeedTransactions,
  type DemoPosition,
  type DemoTransaction,
} from "./demoData";

// ── Demo gift card ───────────────────────────────────────────────
export interface DemoGiftCard {
  id: string;
  claimCode: string;
  amountMusd: string;
  message: string | null;
  theme: "bitcoin" | "birthday" | "minimal" | "neon" | "gold";
  status: "active" | "claimed" | "expired" | "cancelled";
  expiresAt: string; // ISO string
  createdAt: Date;
}

// ── Context shape ────────────────────────────────────────────────
interface DemoContextValue {
  /** Is the app running in demo mode? */
  isDemoMode: boolean;
  /** Is the simulated wallet currently "connected"? */
  isConnected: boolean;
  /** Simulated wallet address */
  address: `0x${string}`;
  /** Simulated chain info */
  chain: { id: number; name: string };
  /** BTC balance */
  btcBalance: number;
  /** MUSD balance */
  musdBalance: number;
  /** Active borrow positions */
  positions: DemoPosition[];
  /** Transaction history */
  transactions: DemoTransaction[];
  /** Created gift cards */
  giftCards: DemoGiftCard[];

  // ── Actions ──
  connect: () => void;
  disconnect: () => void;
  simulateBorrow: (collateralBtc: number, musdAmount: number, ltv: number) => void;
  simulateSend: (amount: number, recipient: string) => void;
  simulateGiftCard: (
    amount: number,
    claimCode: string,
    theme?: DemoGiftCard["theme"],
    message?: string
  ) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

// ── Hook ─────────────────────────────────────────────────────────
export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    // If outside provider, return a no-op default (demo off)
    return {
      isDemoMode: false,
      isConnected: false,
      address: "0x0" as `0x${string}`,
      chain: DEMO_CHAIN,
      btcBalance: 0,
      musdBalance: 0,
      positions: [],
      transactions: [],
      giftCards: [],
      connect: () => {},
      disconnect: () => {},
      simulateBorrow: () => {},
      simulateSend: () => {},
      simulateGiftCard: () => {},
    };
  }
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────
export function DemoProvider({ children }: { children: ReactNode }) {
  const isDemoMode =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const [isConnected, setIsConnected] = useState(false);
  const [btcBalance, setBtcBalance] = useState(INITIAL_BTC_BALANCE);
  const [musdBalance, setMusdBalance] = useState(INITIAL_MUSD_BALANCE);
  const [positions, setPositions] = useState<DemoPosition[]>([]);
  const [transactions, setTransactions] = useState<DemoTransaction[]>([]);
  const [giftCards, setGiftCards] = useState<DemoGiftCard[]>([]);

  // Populate seed data on the client only (avoids Next.js prerender Date error)
  useEffect(() => {
    const now = Date.now();
    setPositions(createSeedPositions(now));
    setTransactions(createSeedTransactions(now));
  }, []);

  // Auto-incrementing id
  const [nextId, setNextId] = useState(100);
  const genId = useCallback(
    (prefix: string) => {
      setNextId((n) => n + 1);
      return `${prefix}-${nextId}`;
    },
    [nextId]
  );

  // ── Connect / Disconnect ──
  const connect = useCallback(() => setIsConnected(true), []);
  const disconnect = useCallback(() => {
    setIsConnected(false);
    // Reset to fresh state on disconnect
    const now = Date.now();
    setBtcBalance(INITIAL_BTC_BALANCE);
    setMusdBalance(INITIAL_MUSD_BALANCE);
    setPositions(createSeedPositions(now));
    setTransactions(createSeedTransactions(now));
    setGiftCards([]);
  }, []);

  // ── Simulate: Borrow ──
  const simulateBorrow = useCallback(
    (collateralBtc: number, musdAmount: number, ltv: number) => {
      setBtcBalance((b) => Math.max(0, b - collateralBtc));
      setMusdBalance((b) => b + musdAmount);

      const newPos: DemoPosition = {
        id: genId("demo-pos"),
        collateralBtc: collateralBtc.toFixed(4),
        borrowedMusd: musdAmount.toFixed(2),
        ltvRatio: ltv.toFixed(2),
        interestRate: "0.01",
        status: "active",
        openedAt: new Date(),
      };
      setPositions((prev) => [newPos, ...prev]);

      const newTx: DemoTransaction = {
        id: genId("demo-tx"),
        type: "borrow",
        amount: musdAmount.toFixed(2),
        currency: "MUSD",
        createdAt: new Date(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    },
    [genId]
  );

  // ── Simulate: Send MUSD ──
  const simulateSend = useCallback(
    (amount: number, _recipient: string) => {
      setMusdBalance((b) => Math.max(0, b - amount));

      const newTx: DemoTransaction = {
        id: genId("demo-tx"),
        type: "send",
        amount: amount.toFixed(2),
        currency: "MUSD",
        createdAt: new Date(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    },
    [genId]
  );

  // ── Simulate: Gift Card ──
  const simulateGiftCard = useCallback(
    (
      amount: number,
      claimCode: string,
      theme: DemoGiftCard["theme"] = "bitcoin",
      message?: string
    ) => {
      setMusdBalance((b) => Math.max(0, b - amount));

      const newTx: DemoTransaction = {
        id: genId("demo-tx"),
        type: "gift_create",
        amount: amount.toFixed(2),
        currency: "MUSD",
        createdAt: new Date(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      // Store the full gift card so the dashboard can display it
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const newCard: DemoGiftCard = {
        id: genId("demo-gc"),
        claimCode,
        amountMusd: amount.toFixed(2),
        message: message || null,
        theme,
        status: "active",
        expiresAt,
        createdAt: new Date(),
      };
      setGiftCards((prev) => [newCard, ...prev]);
    },
    [genId]
  );

  const value: DemoContextValue = {
    isDemoMode,
    isConnected: isDemoMode && isConnected,
    address: DEMO_WALLET_ADDRESS,
    chain: DEMO_CHAIN,
    btcBalance,
    musdBalance,
    positions,
    transactions,
    giftCards,
    connect,
    disconnect,
    simulateBorrow,
    simulateSend,
    simulateGiftCard,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
