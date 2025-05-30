import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log("🔍 Checking database schema...");
    
    // Check courses table columns
    const courseColumnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses'
      ORDER BY ordinal_position
    `;
    
    const courseColumns = await sql(courseColumnsQuery);
    
    console.log("Courses table columns:");
    console.table(courseColumns);
    
    console.log("✅ Schema check completed!");
  } catch (error) {
    console.error("❌ Error checking schema:", error);
    process.exit(1);
  }
}

main(); 