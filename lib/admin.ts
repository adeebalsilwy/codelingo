import { auth } from "@clerk/nextjs"

const adminIds = [
  "user_2kn7I81EfQGcQEN1w1PFxUJfJtX",
];

export const isAdmin = async () => {
  try {
    const { userId } = auth();

    if (!userId) {
      return false;
    }

    return adminIds.includes(userId);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
