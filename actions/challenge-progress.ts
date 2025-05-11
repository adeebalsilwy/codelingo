"use server";

import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/client";
import { getUserProgress, getUserSubscription, calculateCourseProgress } from "@/db/queries";
import { challengeProgress, challenges, userProgress, userCourseProgress } from "@/db/schema";

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

  // Get active course ID
  const activeCourseId = currentUserProgress.activeCourseId;
  if (!activeCourseId) {
    console.error("No active course found for user");
  }

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
    with: {
      challengeOptions: true, // Fetch challenge options to validate
      lesson: {
        with: {
          unit: {
            with: {
              course: true
            }
          }
        }
      }
    }
  });

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  // Get course ID from challenge
  const courseId = challenge.lesson?.unit?.course?.id || activeCourseId;
  
  if (!courseId) {
    console.error(`Could not determine course ID for challenge ${challengeId}`);
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
    revalidatePath("/courses");
    
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

  // Update course progress if we have a valid course ID
  if (courseId) {
    try {
      // Calculate updated progress for the course
      const newProgress = await calculateCourseProgress(userId, courseId);
      
      // Check if progress exists for this course
      const existingCourseProgress = await db.query.userCourseProgress.findFirst({
        where: and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.courseId, courseId)
        )
      });
      
      if (existingCourseProgress) {
        // Update existing progress
        await db.update(userCourseProgress)
          .set({
            progress: newProgress,
            completed: newProgress === 100,
            updatedAt: new Date(),
            lastLessonId: lessonId
          })
          .where(and(
            eq(userCourseProgress.userId, userId),
            eq(userCourseProgress.courseId, courseId)
          ));
      } else {
        // Create new progress
        await db.insert(userCourseProgress)
          .values({
            userId,
            courseId,
            progress: newProgress,
            completed: newProgress === 100,
            lastLessonId: lessonId,
            updatedAt: new Date()
          });
      }
      
      console.log(`Updated course progress for course ${courseId} to ${newProgress}%`);
    } catch (error) {
      console.error(`Error updating course progress for course ${courseId}:`, error);
    }
  }

  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
  revalidatePath("/courses");
  
  return { success: true };
};
