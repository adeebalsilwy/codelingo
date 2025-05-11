import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log("🔧 Fixing database schema...");
    
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
    
    // Helper function to add timestamp columns to a table
    const addTimestampColumns = async (tableName: string) => {
      if (!(await columnExists(tableName, 'created_at'))) {
        console.log(`Adding 'created_at' column to ${tableName}`);
        await sql(`ALTER TABLE "${tableName}" ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      }
      
      if (!(await columnExists(tableName, 'updated_at'))) {
        console.log(`Adding 'updated_at' column to ${tableName}`);
        await sql(`ALTER TABLE "${tableName}" ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      }
    };
    
    // List of tables to check and fix
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
    
    // Add timestamp columns to all tables
    for (const table of tables) {
      await addTimestampColumns(table);
    }
    
    console.log("✅ Schema fixes completed!");
    
    // Show current schema for courses table as an example
    const courseColumnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses'
      ORDER BY ordinal_position
    `;
    
    const courseColumns = await sql(courseColumnsQuery);
    
    console.log("Example - courses table columns:");
    console.table(courseColumns);
    
  } catch (error) {
    console.error("❌ Error fixing schema:", error);
    process.exit(1);
  }
}

main(); 