#!/usr/bin/env tsx

/**
 * Command-line tool to remove admin privileges from a user
 * أداة سطر الأوامر لإزالة امتيازات المسؤول من مستخدم
 * 
 * Usage/الاستخدام: npx tsx scripts/remove-admin.ts <user_id>
 */

import { config } from 'dotenv';
import db from "../db/client";
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
      console.error("Example: npx tsx scripts/remove-admin.ts user_123456789");
      console.error("يرجى تقديم معرف المستخدم كمعلمة.");
      console.error("مثال: npx tsx scripts/remove-admin.ts user_123456789");
      process.exit(1);
    }

    // Check if user exists as admin
    // التحقق مما إذا كان المستخدم موجودًا كمسؤول
    const existingAdmin = await db.query.admins.findFirst({
      where: eq(admins.userId, userId),
    });

    if (!existingAdmin) {
      console.log(`User ${userId} is not an admin.`);
      console.log(`المستخدم ${userId} ليس مسؤولاً.`);
      process.exit(0);
    }

    // Remove admin privileges
    // إزالة امتيازات المسؤول
    const deletedAdmin = await db.delete(admins)
      .where(eq(admins.userId, userId))
      .returning();

    console.log(`Successfully removed admin privileges from user ${userId}.`);
    console.log(`تمت إزالة امتيازات المسؤول من المستخدم ${userId} بنجاح.`);
    console.log("Removed admin details/تفاصيل المسؤول المحذوف:", deletedAdmin[0]);

  } catch (error) {
    console.error("Error occurred while removing admin privileges:", error);
    console.error("حدث خطأ أثناء إزالة امتيازات المسؤول:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main(); 