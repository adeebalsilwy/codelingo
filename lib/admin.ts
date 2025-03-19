import { auth, useAuth } from "@clerk/nextjs"
import db from "@/db/drizzle"
import { eq } from "drizzle-orm"
import { admins } from "@/db/schema"
import { useEffect, useState } from "react"
import { randomUUID } from "crypto"

const adminIds = [
  "user_2kn7I81EfQGcQEN1w1PFxUJfJtX",
  "user_2tvJrXV1H8SBQg4VUxhnIF9jwtW",
];

// Function to ensure default admins exist in the database
const ensureDefaultAdmins = async () => {
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
        console.log(`Added default admin: ${userId}`);
      }
    }
  } catch (error) {
    console.error("Error ensuring default admins:", error);
  }
};

// Server-side admin check
export const isAdmin = async () => {
  try {
    const { userId } = auth();

    if (!userId) {
      return false;
    }

    // Ensure default admins exist before checking
    await ensureDefaultAdmins();

    try {
      const adminRecord = await db.query.admins.findFirst({
        where: eq(admins.userId, userId),
      });

      if (adminRecord) {
        return true;
      }

      return adminIds.includes(userId);
    } catch (dbError) {
      console.error("Database error checking admin status:", dbError);
      return adminIds.includes(userId);
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Client-side admin check hook
export const useIsAdmin = () => {
  const { userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!userId) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [userId]);

  return isAdmin;
};
