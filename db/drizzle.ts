import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// التحقق من وجود متغير بيئة DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("WARNING: No DATABASE_URL environment variable provided. Using memory mode or fallback.");
}

// استخدام القيمة الفعلية أو رابط محلي للتطوير
const sql = neon(DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/edupro_db');

// @ts-ignore
const db = drizzle(sql, { schema });

export default db;
