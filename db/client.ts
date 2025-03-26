import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Validate environment variables
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create a singleton instance
let db: NeonHttpDatabase<typeof schema>;

try {
  // Initialize the database connection with type assertion
  const sql = neon(DATABASE_URL) as any;
  db = drizzle(sql as any, { schema });
} catch (error) {
  console.error("Failed to initialize database connection:", error);
  throw new Error("Database connection failed");
}

// Helper function to check database connection
export const checkDatabaseConnection = async () => {
  try {
    // Try a simple query to verify connection
    await db.query.courses.findFirst();
    return true;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
};

export { db };
export default db; 