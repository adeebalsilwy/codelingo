import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { userCourseProgress, userProgress } from "@/db/schema";

// Simulated user course progress data store (replace with your database)
const userCourseProgressStore = new Map();

// الحصول على تقدم المستخدم في جميع الكورسات
export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all course progress for the user
    const progress = await db.query.userCourseProgress.findMany({
      where: eq(userCourseProgress.userId, userId),
      with: {
        course: true,
        lastActiveUnit: {
          with: {
            lessons: true
          }
        },
        lastLesson: true
      }
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[USER_COURSE_PROGRESS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// الحصول على تقدم المستخدم في كورس محدد
export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return new NextResponse("Course ID required", { status: 400 });
    }

    // Check if progress exists
    const existingProgress = await db.query.userCourseProgress.findFirst({
      where: and(
        eq(userCourseProgress.userId, userId),
        eq(userCourseProgress.courseId, courseId)
      ),
      with: {
        course: true,
        lastActiveUnit: {
          with: {
            lessons: true
          }
        },
        lastLesson: true
      }
    });

    if (existingProgress) {
      return NextResponse.json(existingProgress);
    }

    // Create new progress and update active course
    const [newProgress] = await Promise.all([
      db.insert(userCourseProgress).values({
        userId,
        courseId,
        progress: 0,
        completed: false,
        points: 0
      }).returning(),
      db.update(userProgress)
        .set({ activeCourseId: courseId })
        .where(eq(userProgress.userId, userId))
    ]);

    return NextResponse.json(newProgress[0]);
  } catch (error) {
    console.error("[USER_COURSE_PROGRESS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { courseId, progress, completed, lastActiveUnitId, lastLessonId, points } = body;

    if (!courseId) {
      return new NextResponse("Course ID required", { status: 400 });
    }

    // Find existing progress
    const existingProgress = await db.query.userCourseProgress.findFirst({
      where: and(
        eq(userCourseProgress.userId, userId),
        eq(userCourseProgress.courseId, courseId)
      )
    });

    if (existingProgress) {
      // Update existing progress
      const updateData: any = {};
      
      if (progress !== undefined) updateData.progress = progress;
      if (completed !== undefined) updateData.completed = completed;
      if (lastActiveUnitId !== undefined) updateData.lastActiveUnitId = lastActiveUnitId;
      if (lastLessonId !== undefined) updateData.lastLessonId = lastLessonId;
      if (points !== undefined) updateData.points = points;
      
      const updatedProgress = await db
        .update(userCourseProgress)
        .set(updateData)
        .where(and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.courseId, courseId)
        ))
        .returning();

      return NextResponse.json(updatedProgress[0]);
    } else {
      // Create new progress
      const newProgress = await db.insert(userCourseProgress).values({
        userId,
        courseId,
        progress: progress || 0,
        completed: completed || false,
        lastActiveUnitId: lastActiveUnitId || null,
        lastLessonId: lastLessonId || null,
        points: points || 0
      }).returning();

      return NextResponse.json(newProgress[0]);
    }
  } catch (error) {
    console.error("[USER_COURSE_PROGRESS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 