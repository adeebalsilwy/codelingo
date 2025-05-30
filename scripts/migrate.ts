import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log("🗄️ Running database migration...");
    
    const migrationFile = readFileSync(join(__dirname, "..", "db", "migrate.sql"), "utf-8");
    const statements = migrationFile
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      await sql`${statement}`;
    }
    
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Error running migration:", error);
    process.exit(1);
  }
}

main(); 