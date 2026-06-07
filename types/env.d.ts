// types/env.d.ts
// This file tells TypeScript what shape process.env has
// so you get autocomplete and type checking on env variable names

declare namespace NodeJS {
  interface ProcessEnv {
    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: string;
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string;
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string;

    // Neon PostgreSQL
    DATABASE_URL: string;

    // Upstash Redis
    UPSTASH_REDIS_REST_URL: string;
    UPSTASH_REDIS_REST_TOKEN: string;

    // WalletConnect
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;

    // RPC URLs
    NEXT_PUBLIC_MEZO_RPC_URL: string;
    NEXT_PUBLIC_SEPOLIA_RPC_URL: string;

    // Contract Addresses
    NEXT_PUBLIC_MUSD_TOKEN_ADDRESS: string;
    NEXT_PUBLIC_BTC_VAULT_ADDRESS: string;
    NEXT_PUBLIC_BORROWING_ADDRESS: string;
    NEXT_PUBLIC_PASSPORT_ADDRESS: string;
    NEXT_PUBLIC_GIFT_CARD_ADDRESS: string;

    // App
    NEXT_PUBLIC_APP_URL: string;
    NODE_ENV: "development" | "production" | "test";
    DEV_BYPASS_AUTH?: string;
  }
}