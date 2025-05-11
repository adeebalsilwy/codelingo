import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log("🔧 Fixing user_progress table...");
    
    // Check if last_active_unit_id column exists
    const checkLastActiveUnitColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_progress' AND column_name = 'last_active_unit_id'
    `;
    
    const lastActiveUnitColumnExists = await sql(checkLastActiveUnitColumnQuery);
    
    if (lastActiveUnitColumnExists.length === 0) {
      console.log("Adding missing 'last_active_unit_id' column to user_progress table");
      await sql`ALTER TABLE user_progress ADD COLUMN last_active_unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL`;
      console.log("✅ last_active_unit_id column added successfully!");
    } else {
      console.log("✅ last_active_unit_id column already exists. No changes needed.");
    }
    
    // Check if last_lesson_id column exists
    const checkLastLessonColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_progress' AND column_name = 'last_lesson_id'
    `;
    
    const lastLessonColumnExists = await sql(checkLastLessonColumnQuery);
    
    if (lastLessonColumnExists.length === 0) {
      console.log("Adding missing 'last_lesson_id' column to user_progress table");
      await sql`ALTER TABLE user_progress ADD COLUMN last_lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL`;
      console.log("✅ last_lesson_id column added successfully!");
    } else {
      console.log("✅ last_lesson_id column already exists. No changes needed.");
    }
    
    console.log("🔧 User progress table fix completed successfully!");
  } catch (error) {
    console.error("❌ Error fixing user_progress table:", error);
    process.exit(1);
  }
}

main(); 