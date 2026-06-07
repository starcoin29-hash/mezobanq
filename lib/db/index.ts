// lib/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Neon's HTTP driver is optimized for serverless environments (Vercel Edge)
// Each request opens a stateless HTTP connection -- no pool management needed
const sql = neon(process.env.DATABASE_URL!);

// Create the Drizzle ORM instance
// Passing schema enables us to use db.query with full type safety
export const db = drizzle(sql, { schema });

// Re-export schema so we can use it in queries without extra imports
export { schema };