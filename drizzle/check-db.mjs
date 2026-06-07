// Quick test to check if tables exist and verify the FK constraint
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function test() {
  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log("Tables:", tables.map(t => t.table_name));

    // Check gift_cards table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'gift_cards'
      ORDER BY ordinal_position
    `;
    console.log("\ngift_cards columns:");
    columns.forEach(c => {
      console.log(`  ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable}, default: ${c.column_default || "none"})`);
    });

    // Check users table
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log("\nUsers count:", users[0].count);

    // Check gift cards
    const cards = await sql`SELECT COUNT(*) as count FROM gift_cards`;
    console.log("Gift cards count:", cards[0].count);

    // Check FK constraints
    const fks = await sql`
      SELECT 
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'gift_cards'
    `;
    console.log("\ngift_cards FK constraints:");
    fks.forEach(fk => {
      console.log(`  ${fk.column_name} -> ${fk.referenced_table}.${fk.referenced_column} (${fk.constraint_name})`);
    });

  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
