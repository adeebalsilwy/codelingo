import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log("🔧 Starting comprehensive database schema fix...");
    
    // Helper function to check if a column exists
    const columnExists = async (tableName: string, columnName: string) => {
      const query = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `;
      const result = await sql(query, [tableName, columnName]);
      return result.length > 0;
    };
    
    // Helper function to add a column to a table
    const addColumn = async (tableName: string, columnName: string, dataType: string, isNullable: boolean = true) => {
      if (!(await columnExists(tableName, columnName))) {
        console.log(`Adding '${columnName}' column to ${tableName}`);
        const nullableStr = isNullable ? '' : ' NOT NULL DEFAULT \'\'';
        await sql(`ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${dataType}${nullableStr}`);
        return true;
      }
      return false;
    };
    
    // Fix lessons table which is causing issues
    console.log("Fixing lessons table...");
    let changed = await addColumn('lessons', 'description', 'TEXT');
    if (changed) {
      console.log("✅ Added description column to lessons table");
    } else {
      console.log("Description column already exists in lessons table");
    }
    
    // Fix challenges table
    console.log("Fixing challenges table...");
    changed = await addColumn('challenges', 'explanation', 'TEXT');
    if (changed) {
      console.log("✅ Added explanation column to challenges table");
    } else {
      console.log("Explanation column already exists in challenges table");
    }
    
    // Add imageSrc and audioSrc to challenge_options
    console.log("Fixing challenge_options table...");
    changed = await addColumn('challenge_options', 'image_src', 'TEXT');
    if (changed) {
      console.log("✅ Added image_src column to challenge_options table");
    }
    
    changed = await addColumn('challenge_options', 'audio_src', 'TEXT');
    if (changed) {
      console.log("✅ Added audio_src column to challenge_options table");
    }
    
    changed = await addColumn('challenge_options', 'explanation', 'TEXT');
    if (changed) {
      console.log("✅ Added explanation column to challenge_options table");
    }
    
    // Fix user_progress table
    console.log("Fixing user_progress table...");
    changed = await addColumn('user_progress', 'last_active_unit_id', 'INTEGER REFERENCES units(id) ON DELETE SET NULL');
    if (changed) {
      console.log("✅ Added last_active_unit_id column to user_progress table");
    } else {
      console.log("last_active_unit_id column already exists in user_progress table");
    }
    
    changed = await addColumn('user_progress', 'last_lesson_id', 'INTEGER REFERENCES lessons(id) ON DELETE SET NULL');
    if (changed) {
      console.log("✅ Added last_lesson_id column to user_progress table");
    } else {
      console.log("last_lesson_id column already exists in user_progress table");
    }
    
    // Add timestamp columns to all tables
    const tables = [
      'courses',
      'units',
      'chapters',
      'lessons',
      'challenges',
      'challenge_options',
      'user_progress',
      'user_course_progress',
      'challenge_progress',
      'user_subscription',
      'admins'
    ];
    
    console.log("Adding timestamp columns to all tables...");
    for (const table of tables) {
      await addColumn(table, 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      await addColumn(table, 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    }
    
    // Check other required columns based on schema.ts
    console.log("Ensuring other required columns exist...");
    
    // Check the challenges table schema
    const challengesColumnsQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'challenges'
      ORDER BY ordinal_position
    `;
    
    const challengesColumns = await sql(challengesColumnsQuery);
    
    console.log("Challenges table columns after fixes:");
    console.table(challengesColumns);
    
    console.log("✅ All schema fixes completed!");
    
  } catch (error) {
    console.error("❌ Error fixing schema:", error);
    process.exit(1);
  }
}

main(); 