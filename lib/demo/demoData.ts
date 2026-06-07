// lib/demo/demoData.ts
// Generates realistic seed data for demo/sandbox mode.
// All data is ephemeral — lives only in React state, never touches the DB.

// ── Demo wallet address ──────────────────────────────────────────
// A realistic-looking Ethereum address (not a real wallet)
export const DEMO_WALLET_ADDRESS =
  "0x7a3B8c6D91e2F054aA9C12d3bE56f78901234f2E" as `0x${string}`;

export const DEMO_CHAIN = {
  id: 31611,
  name: "Mezo Testnet",
};

// ── Starting balances ────────────────────────────────────────────
export const INITIAL_BTC_BALANCE = 2.45;
export const INITIAL_MUSD_BALANCE = 12_500;

const BTC_PRICE = 65_000;

// ── Seed positions ───────────────────────────────────────────────
function daysAgo(now: number, n: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  d.setHours(10, 30, 0, 0);
  return d;
}

export interface DemoPosition {
  id: string;
  collateralBtc: string;
  borrowedMusd: string;
  ltvRatio: string;
  interestRate: string;
  status: string;
  openedAt: Date;
}

export function createSeedPositions(now: number = Date.now()): DemoPosition[] {
  return [
    {
      id: "demo-pos-1",
      collateralBtc: "0.5000",
      borrowedMusd: "8125",
      ltvRatio: "0.25",
      interestRate: "0.01",
      status: "active",
      openedAt: daysAgo(now, 12),
    },
    {
      id: "demo-pos-2",
      collateralBtc: "0.3000",
      borrowedMusd: "8775",
      ltvRatio: "0.45",
      interestRate: "0.01",
      status: "active",
      openedAt: daysAgo(now, 5),
    },
  ];
}

// ── Seed transactions ────────────────────────────────────────────
export interface DemoTransaction {
  id: string;
  type:
    | "borrow"
    | "repay"
    | "send"
    | "receive"
    | "gift_create"
    | "gift_claim"
    | "yield_deposit"
    | "yield_withdraw";
  amount: string;
  currency: string;
  createdAt: Date;
}

function hoursAgo(now: number, h: number): Date {
  return new Date(now - h * 3600_000);
}

export function createSeedTransactions(now: number = Date.now()): DemoTransaction[] {
  return [
    {
      id: "demo-tx-1",
      type: "borrow",
      amount: "8775",
      currency: "MUSD",
      createdAt: hoursAgo(now, 2),
    },
    {
      id: "demo-tx-2",
      type: "send",
      amount: "250",
      currency: "MUSD",
      createdAt: hoursAgo(now, 8),
    },
    {
      id: "demo-tx-3",
      type: "gift_create",
      amount: "100",
      currency: "MUSD",
      createdAt: hoursAgo(now, 26),
    },
    {
      id: "demo-tx-4",
      type: "yield_deposit",
      amount: "2000",
      currency: "MUSD",
      createdAt: hoursAgo(now, 50),
    },
    {
      id: "demo-tx-5",
      type: "receive",
      amount: "500",
      currency: "MUSD",
      createdAt: hoursAgo(now, 96),
    },
    {
      id: "demo-tx-6",
      type: "repay",
      amount: "1200",
      currency: "MUSD",
      createdAt: hoursAgo(now, 144),
    },
  ];
}
