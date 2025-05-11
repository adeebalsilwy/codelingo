#!/usr/bin/env tsx

/**
 * Command-line tool to list all admin users in the database
 * أداة سطر الأوامر لعرض جميع المستخدمين المسؤولين في قاعدة البيانات
 * 
 * Usage/الاستخدام: npx tsx scripts/list-admins.ts
 */

import { config } from 'dotenv';
import db from "../db/client";
import { admins } from "../db/schema";

// Load environment variables
// تحميل متغيرات البيئة
config();

async function main() {
  try {
    // Fetch all admin users
    // جلب جميع المستخدمين المسؤولين
    const adminUsers = await db.query.admins.findMany();

    if (adminUsers.length === 0) {
      console.log("No admin users found in the database.");
      console.log("لم يتم العثور على مستخدمين مسؤولين في قاعدة البيانات.");
      process.exit(0);
    }

    console.log("\n=== Admin Users ===");
    console.log("=== المستخدمين المسؤولين ===\n");
    
    // Display admin users in a table format
    // عرض المستخدمين المسؤولين في تنسيق جدول
    console.log("ID".padEnd(40) + " | " + "User ID".padEnd(40) + " | " + "Created At");
    console.log("-".repeat(100));
    
   
    
    console.log(`\nTotal admins: ${adminUsers.length}`);
    console.log(`إجمالي المسؤولين: ${adminUsers.length}`);

  } catch (error) {
    console.error("Error occurred while fetching admin users:", error);
    console.error("حدث خطأ أثناء جلب المستخدمين المسؤولين:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main(); 