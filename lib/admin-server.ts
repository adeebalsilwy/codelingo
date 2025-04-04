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

  const admin = await db.query.admins.findFirst({
    where: eq(admins.userId, userId),
  });

  return !!admin;
}

// Server-side admin check wrapper
export async function isAdmin() {
  const { userId } = await auth();
  return checkIsAdmin(userId);
} 