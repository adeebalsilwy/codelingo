import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log("🔧 Fixing courses table...");
    
    // Check if description column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses' AND column_name = 'description'
    `;
    
    const columnExists = await sql(checkColumnQuery);
    
    if (columnExists.length === 0) {
      console.log("Adding missing 'description' column to courses table");
      await sql`ALTER TABLE courses ADD COLUMN description TEXT`;
      console.log("✅ Column added successfully!");
    } else {
      console.log("✅ Description column already exists. No changes needed.");
    }
    
    console.log("🔧 Database fix completed successfully!");
  } catch (error) {
    console.error("❌ Error fixing database:", error);
    process.exit(1);
  }
}

main(); 