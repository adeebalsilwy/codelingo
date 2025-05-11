import { auth } from "@clerk/nextjs"
import db from "@/db/client"
import { eq } from "drizzle-orm"
import { admins } from "@/db/schema"
import { randomUUID } from "crypto"

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