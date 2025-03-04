import { auth } from "@clerk/nextjs"

const adminIds = [
  "user_2kn7I81EfQGcQEN1w1PFxUJfJtX",
];

export const isAdmin = () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  return adminIds.indexOf(userId) !== -1;
};
