import { auth } from "@clerk/nextjs";
import { db } from "@/db/client";
import { userProgress, userCourseProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// Runtime configurations for Next.js 15+
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return new NextResponse("Course ID is required", { status: 400 });
    }

    // Get the course to verify it exists
    const course = await db.query.courses.findFirst({
      where: (courses, { eq }) => eq(courses.id, courseId)
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Get existing course progress first to preserve last active unit/lesson
    const existingCourseProgress = await db.query.userCourseProgress.findFirst({
      where: (ucp, { eq }) => and(
        eq(ucp.userId, userId),
        eq(ucp.courseId, courseId)
      )
    });

    // Get or create user progress
    const existingProgress = await db.query.userProgress.findFirst({
      where: (up, { eq }) => eq(up.userId, userId)
    });

    if (!existingProgress) {
      // Create new user progress with last active unit/lesson from course progress
      await db.insert(userProgress).values({
        userId,
        activeCourseId: courseId,
        hearts: 5,
        points: 0,
        lastActiveUnitId: existingCourseProgress?.lastActiveUnitId || null,
        lastLessonId: existingCourseProgress?.lastLessonId || null
      });
    } else {
      // Update existing user progress with last active unit/lesson from course progress
      await db.update(userProgress)
        .set({ 
          activeCourseId: courseId,
          lastActiveUnitId: existingCourseProgress?.lastActiveUnitId || null,
          lastLessonId: existingCourseProgress?.lastLessonId || null
        })
        .where(eq(userProgress.userId, userId));
    }

    if (!existingCourseProgress) {
      // If no course progress exists, create it
      await db.insert(userCourseProgress).values({
        userId,
        courseId,
        progress: 0,
        points: 0,
        completed: false,
        lastActiveUnitId: null,
        lastLessonId: null
      });
    }

    // Return the updated progress data
    const updatedProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      with: {
        activeCourse: true,
        lastActiveUnit: true,
        lastLesson: true
      }
    });

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error("[COURSES_SET_ACTIVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 