import { auth } from "@clerk/nextjs"
import db from "@/db/client"
import { eq } from "drizzle-orm"
import { admins } from "@/db/schema"
import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

const adminIds = [
  "user_2VQyZKqgGBpBhOtT9Z9gHSL8jYd",
  "user_2kn7I81EfQGcQEN1w1PFxUJfJtX",
  "user_2tvJrXV1H8SBQg4VUxhnIF9jwtW",
];

// Function to ensure default admins exist in the database
export async function ensureDefaultAdmins() {
  for (const adminId of adminIds) {
    const existingAdmin = await db.query.admins.findFirst({
      where: eq(admins.userId, adminId),
    });

    if (!existingAdmin) {
      await db.insert(admins).values({
        id: randomUUID(),
        userId: adminId,
      });
    }
  }
}

// Server-side admin check
export async function checkIsAdmin(userId: string | null) {
  if (!userId) return false;

  try {
    const admin = await db.query.admins.findFirst({
      where: eq(admins.userId, userId),
    });

    return !!admin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Server-side admin check wrapper
export async function isAdmin() {
  try {
    console.log("[isAdmin] Checking admin status");
    console.log(`[isAdmin] Current NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Auto-approve in development mode regardless of how the application was started
    if (process.env.NODE_ENV === 'development') {
      console.log("[isAdmin] Development mode detected, auto-approving admin access");
      return true;
    }
    
    // Check for admin access override from environment config
    if (process.env.ADMIN_ACCESS_ENABLED === 'true') {
      console.log("[isAdmin] Admin access enabled via environment config");
      return true;
    }
    
    // Special check for local environment that might be running in production mode after build
    const isLocalEnvironment = !process.env.VERCEL_URL && !process.env.PRODUCTION;
    if (isLocalEnvironment) {
      console.log("[isAdmin] Local environment detected (not on Vercel), auto-approving admin access");
      return true;
    }
    
    // Make sure we're properly awaiting auth() to avoid race conditions
    const authResult = await auth();
    const userId = authResult.userId;
    
    console.log(`[isAdmin] User ID from auth: ${userId || 'not available'}`);
    
    if (!userId) {
      console.log("[isAdmin] No user ID, admin check failed");
      return false;
    }
    
    // Check if user is admin with retry logic
    let attempts = 0;
    const maxAttempts = 3;
    let isAdminResult = false;
    
    while (attempts < maxAttempts) {
      try {
        isAdminResult = await checkIsAdmin(userId);
        break; // Exit the loop if successful
      } catch (retryError) {
        attempts++;
        console.error(`[isAdmin] Error on attempt ${attempts}/${maxAttempts}:`, retryError);
        
        if (attempts < maxAttempts) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 500 * attempts));
        }
      }
    }
    
    console.log(`[isAdmin] Admin check result for user ${userId}: ${isAdminResult}`);
    return isAdminResult;
  } catch (error) {
    console.error("[isAdmin] Error checking admin status:", error);
    return false;
  }
}

// وظيفة مساعدة للتحقق من صلاحيات المدير في API
export async function checkAdminAccess(req: Request) {
  // تحقق من صلاحية المدير
  let adminAccess = false;
  
  // في وضع التطوير أو عند تفعيل وصول المدير، نتجاوز فحص الإدارة
  if (process.env.NODE_ENV === 'development' || process.env.ADMIN_ACCESS_ENABLED === 'true') {
    console.log("[API] Development mode or admin access enabled, auto-approving admin access");
    adminAccess = true;
  } else {
    // تحقق من صلاحية المدير في وضع الإنتاج
    adminAccess = await isAdmin();
  }
  
  if (!adminAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return null; // لا يوجد خطأ، المستخدم مصرح له
} 