// drizzle.config.ts
import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// Load .env.local so drizzle-kit can read DATABASE_URL
config({ path: ".env.local" });

export default {
  // Where your table definitions live
  schema: "./lib/db/schema.ts",
  // Where generated SQL migration files will be stored
  out: "./drizzle/migrations",
  // We are using PostgreSQL (Neon)
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // verbose: prints each SQL statement -- helpful for debugging
  verbose: true,
  // strict: prompts before running destructive changes
  strict: true,
} satisfies Config;
