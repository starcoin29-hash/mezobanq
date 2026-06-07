import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const statements = [
  // 1. Drop all foreign key constraints that reference users.id
  `ALTER TABLE "gift_cards" DROP CONSTRAINT IF EXISTS "gift_cards_creator_id_users_id_fk"`,
  `ALTER TABLE "gift_cards" DROP CONSTRAINT IF EXISTS "gift_cards_claimer_id_users_id_fk"`,
  `ALTER TABLE "positions" DROP CONSTRAINT IF EXISTS "positions_user_id_users_id_fk"`,
  `ALTER TABLE "transactions" DROP CONSTRAINT IF EXISTS "transactions_user_id_users_id_fk"`,
  `ALTER TABLE "yield_positions" DROP CONSTRAINT IF EXISTS "yield_positions_user_id_users_id_fk"`,

  // 2. Truncate old data (uuid-format IDs won't match Clerk string IDs)
  `TRUNCATE "gift_cards", "positions", "transactions", "yield_positions", "users" CASCADE`,

  // 3. Alter the primary key column type
  `ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text`,

  // 4. Alter all foreign key columns to text
  `ALTER TABLE "gift_cards" ALTER COLUMN "creator_id" SET DATA TYPE text USING "creator_id"::text`,
  `ALTER TABLE "gift_cards" ALTER COLUMN "claimer_id" SET DATA TYPE text USING "claimer_id"::text`,
  `ALTER TABLE "positions" ALTER COLUMN "user_id" SET DATA TYPE text USING "user_id"::text`,
  `ALTER TABLE "transactions" ALTER COLUMN "user_id" SET DATA TYPE text USING "user_id"::text`,
  `ALTER TABLE "yield_positions" ALTER COLUMN "user_id" SET DATA TYPE text USING "user_id"::text`,

  // 5. Re-add foreign key constraints
  `ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "users"("id")`,
  `ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_claimer_id_users_id_fk" FOREIGN KEY ("claimer_id") REFERENCES "users"("id")`,
  `ALTER TABLE "positions" ADD CONSTRAINT "positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
  `ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`,
  `ALTER TABLE "yield_positions" ADD CONSTRAINT "yield_positions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")`,
];

async function run() {
  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      console.log(`✓ ${stmt.substring(0, 80)}...`);
    } catch (e) {
      console.error(`✗ ${stmt.substring(0, 80)}...`);
      console.error(`  Error: ${e.message}`);
      process.exit(1);
    }
  }
  console.log("\n✅ Migration completed successfully!");
}

run();
