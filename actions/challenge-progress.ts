"use server";

import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/client";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";

export const upsertChallengeProgress = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized"); 
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
    with: {
      challengeOptions: true // Fetch challenge options to validate
    }
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  // Validate challenge has proper options if it's a SELECT type
  if (challenge.type === "SELECT" && 
      (!challenge.challengeOptions || challenge.challengeOptions.length === 0)) {
    console.error(`Challenge ${challengeId} has no options but is of type SELECT`);
    return { error: "invalid_challenge" };
  }

  const lessonId = challenge.lessonId;

  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId),
    ),
  });

  const isPractice = !!existingChallengeProgress;

  if (
    currentUserProgress.hearts === 0 && 
    !isPractice && 
    !userSubscription?.isActive
  ) {
    return { error: "hearts" };
  }

  if (isPractice) {
    await db.update(challengeProgress).set({
      completed: true,
      updatedAt: new Date() // Ensure updatedAt is refreshed
    })
    .where(
      eq(challengeProgress.id, existingChallengeProgress.id)
    );

    await db.update(userProgress).set({
      hearts: Math.min(currentUserProgress.hearts + 1, 5),
      points: currentUserProgress.points + 10,
      updatedAt: new Date() // Ensure updatedAt is refreshed
    }).where(eq(userProgress.userId, userId));

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return { success: true, practice: true };
  }

  // Store the challenge progress
  const insertResult = await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  if (!insertResult || insertResult.length === 0) {
    throw new Error("Failed to insert challenge progress");
  }

  // Update user points
  await db.update(userProgress).set({
    points: currentUserProgress.points + 10,
    updatedAt: new Date() // Ensure updatedAt is refreshed
  }).where(eq(userProgress.userId, userId));

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
  
  return { success: true };
};
