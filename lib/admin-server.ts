import { auth } from "@clerk/nextjs"
import db from "@/db/drizzle"
import { eq } from "drizzle-orm"
import { admins } from "@/db/schema"
import { randomUUID } from "crypto"

const adminIds = [
  "user_2kn7I81EfQGcQEN1w1PFxUJfJtX",
  "user_2tvJrXV1H8SBQg4VUxhnIF9jwtW",
];

// Function to ensure default admins exist in the database
export const ensureDefaultAdmins = async () => {
  try {
    for (const userId of adminIds) {
      // Check if admin already exists
      const existingAdmin = await db.query.admins.findFirst({
        where: eq(admins.userId, userId),
      });

      // If admin doesn't exist, add them
      if (!existingAdmin) {
        await db.insert(admins).values({
          id: randomUUID(),
          userId: userId,
        });
      }
    }
  } catch (error) {
    console.error("Error ensuring default admins:", error);
  }
};

// Server-side admin check
export const checkIsAdmin = async (userId: string | null) => {
  if (!userId) return false;

  try {
    // Ensure default admins exist before checking
    await ensureDefaultAdmins();

    const adminRecord = await db.query.admins.findFirst({
      where: eq(admins.userId, userId),
    });

    return adminRecord ? true : adminIds.includes(userId);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return adminIds.includes(userId || '');
  }
};

// Server-side admin check wrapper
export const isAdmin = async () => {
  const { userId } = auth();
  return checkIsAdmin(userId);
}; 