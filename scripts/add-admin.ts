#!/usr/bin/env tsx

/**
 * Command-line tool to add a user as an admin to the database
 * أداة سطر الأوامر لإضافة مستخدم كمسؤول في قاعدة البيانات
 * 
 * Usage/الاستخدام: npx tsx scripts/add-admin.ts <user_id>
 */

import { randomUUID } from "crypto";
import { config } from 'dotenv';
import db from "../db/drizzle";
import { admins } from "../db/schema";
import { eq } from "drizzle-orm";

// Load environment variables
// تحميل متغيرات البيئة
config();

async function main() {
  try {
    const userId = process.argv[2];

    if (!userId) {
      console.error("Please provide a user ID as a parameter.");
      console.error("Example: npx tsx scripts/add-admin.ts user_123456789");
      console.error("يرجى تقديم معرف المستخدم كمعلمة.");
      console.error("مثال: npx tsx scripts/add-admin.ts user_123456789");
      process.exit(1);
    }

    // Check if user already exists as admin
    // التحقق مما إذا كان المستخدم موجودًا بالفعل
    const existingAdmin = await db.query.admins.findFirst({
      where: eq(admins.userId, userId),
    });

    if (existingAdmin) {
      console.log(`User ${userId} is already an admin.`);
      console.log(`المستخدم ${userId} هو بالفعل مسؤول.`);
      process.exit(0);
    }

    // Add user as admin
    // إضافة المستخدم كمسؤول
    const newAdmin = await db.insert(admins).values({
      id: randomUUID(),
      userId: userId,
    }).returning();

    console.log(`Successfully added user ${userId} as an admin.`);
    console.log(`تمت إضافة المستخدم ${userId} كمسؤول بنجاح.`);
    console.log("Admin details/تفاصيل المسؤول:", newAdmin[0]);

  } catch (error) {
    console.error("Error occurred while adding admin:", error);
    console.error("حدث خطأ أثناء إضافة المسؤول:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main(); 