import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { userCourseProgress, userProgress } from "@/db/schema";
import { calculateCourseProgress } from "@/db/queries";

// Runtime configuration for Next.js 15+
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

// Simulated user course progress data store (replace with your database)
const userCourseProgressStore = new Map();

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Total-Count, Content-Range',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// الحصول على تقدم المستخدم في جميع الكورسات
export async function GET() {
  try {
    const { userId } = await auth();

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
    const { userId } = await auth();

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
      // Calculate current progress
      const calculatedProgress = await calculateCourseProgress(userId, courseId);
      
      // Update progress if it's different
      if (existingProgress.progress !== calculatedProgress) {
        await db.update(userCourseProgress)
          .set({
            progress: calculatedProgress,
            completed: calculatedProgress === 100,
            updatedAt: new Date()
          })
          .where(and(
            eq(userCourseProgress.userId, userId),
            eq(userCourseProgress.courseId, courseId)
          ));
          
        return NextResponse.json({
          ...existingProgress,
          progress: calculatedProgress,
          completed: calculatedProgress === 100
        });
      }
      
      return NextResponse.json(existingProgress);
    }

    // Calculate initial progress
    const calculatedProgress = await calculateCourseProgress(userId, courseId);

    // Create new progress and update active course
    const [newProgress] = await Promise.all([
      db.insert(userCourseProgress).values({
        userId,
        courseId,
        progress: calculatedProgress,
        completed: calculatedProgress === 100,
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
    const { userId } = await auth();

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

    // Calculate current progress if not provided
    let progressToUpdate = progress;
    let completedToUpdate = completed;
    
    if (progressToUpdate === undefined) {
      const calculatedProgress = await calculateCourseProgress(userId, courseId);
      progressToUpdate = calculatedProgress;
      completedToUpdate = calculatedProgress === 100;
    }

    if (existingProgress) {
      // Update existing progress
      const updateData: any = {
        updatedAt: new Date()
      };
      
      if (progressToUpdate !== undefined) updateData.progress = progressToUpdate;
      if (completedToUpdate !== undefined) updateData.completed = completedToUpdate;
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
        progress: progressToUpdate || 0,
        completed: completedToUpdate || false,
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