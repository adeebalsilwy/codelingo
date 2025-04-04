import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/db/client";
import { userProgress, userCourseProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// For proper handling of headers in Next.js 15+
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

// Simulated user progress data store (replace with your database)
const userProgressStore = new Map();

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

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user progress from database
    const progress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      with: {
        activeCourse: true,
        lastActiveUnit: true,
        lastLesson: true
      }
    });

    if (!progress) {
      // Create default progress if none exists
      const defaultProgress = await db.insert(userProgress).values({
        userId,
        userName: "User",
        hearts: 5,
        points: 0
      }).returning();

      return NextResponse.json(defaultProgress[0]);
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error("[USER_PROGRESS_GET]", error);
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
    const { activeCourseId, lastActiveUnitId, lastLessonId, hearts, points } = body;

    // Find existing progress
    const existingProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId)
    });

    if (existingProgress) {
      // Update existing progress
      const updateData: any = {};
      
      if (activeCourseId !== undefined) updateData.activeCourseId = activeCourseId;
      if (lastActiveUnitId !== undefined) updateData.lastActiveUnitId = lastActiveUnitId;
      if (lastLessonId !== undefined) updateData.lastLessonId = lastLessonId;
      if (hearts !== undefined) updateData.hearts = hearts;
      if (points !== undefined) updateData.points = points;
      
      const updatedProgress = await db
        .update(userProgress)
        .set(updateData)
        .where(eq(userProgress.userId, userId))
        .returning();

      return NextResponse.json(updatedProgress[0]);
    } else {
      // Create new progress
      const newProgress = await db.insert(userProgress).values({
        userId,
        userName: "User",
        activeCourseId: activeCourseId || null,
        lastActiveUnitId: lastActiveUnitId || null,
        lastLessonId: lastLessonId || null,
        hearts: hearts || 5,
        points: points || 0
      }).returning();

      return NextResponse.json(newProgress[0]);
    }
  } catch (error) {
    console.error("[USER_PROGRESS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId, unitId, lessonId, hearts, points, completed, progress } = await req.json();

    // تحديث تقدم المستخدم العام
    // First, try to find existing user progress
    const existingProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    });

    if (existingProgress) {
      // Update existing progress
      const updateData: any = {};
      
      if (hearts !== undefined) {
        updateData.hearts = hearts;
      }
      
      if (points !== undefined) {
        updateData.points = points;
      }
      
      if (courseId) {
        updateData.activeCourseId = courseId;
      }
      
      if (unitId) {
        updateData.lastActiveUnitId = unitId;
      }
      
      if (lessonId) {
        updateData.lastLessonId = lessonId;
      }
      
      if (Object.keys(updateData).length > 0) {
        await db
          .update(userProgress)
          .set(updateData)
          .where(eq(userProgress.userId, userId));
      }
    } else {
      // Create new progress
      const insertData: any = {
        userId,
        userName: "", // This can be updated later if needed
      };
      
      if (hearts !== undefined) {
        insertData.hearts = hearts;
      }
      
      if (points !== undefined) {
        insertData.points = points;
      }
      
      if (courseId) {
        insertData.activeCourseId = courseId;
      }
      
      if (unitId) {
        insertData.lastActiveUnitId = unitId;
      }
      
      if (lessonId) {
        insertData.lastLessonId = lessonId;
      }
      
      await db
        .insert(userProgress)
        .values(insertData);
    }
    
    // تحديث تقدم المستخدم في الكورس المحدد (إذا تم تحديد كورس)
    if (courseId) {
      // تحقق مما إذا كان للمستخدم تقدم مسجل في هذا الكورس
      const existingCourseProgress = await db.query.userCourseProgress.findFirst({
        where: and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.courseId, courseId)
        ),
      });
      
      const courseProgressData: any = {};
      
      if (unitId) {
        courseProgressData.lastActiveUnitId = unitId;
      }
      
      if (lessonId) {
        courseProgressData.lastLessonId = lessonId;
      }
      
      if (progress !== undefined) {
        courseProgressData.progress = progress;
      }
      
      if (points !== undefined) {
        courseProgressData.points = points;
      }
      
      if (completed !== undefined) {
        courseProgressData.completed = completed;
      }
      
      if (existingCourseProgress) {
        // تحديث السجل الموجود
        if (Object.keys(courseProgressData).length > 0) {
          courseProgressData.updatedAt = new Date();
          
          await db
            .update(userCourseProgress)
            .set(courseProgressData)
            .where(and(
              eq(userCourseProgress.userId, userId),
              eq(userCourseProgress.courseId, courseId)
            ));
        }
      } else {
        // إنشاء سجل جديد
        await db
          .insert(userCourseProgress)
          .values({
            userId,
            courseId,
            lastActiveUnitId: unitId || null,
            lastLessonId: lessonId || null,
            progress: progress || 0,
            points: points || 0,
            completed: completed || false,
            ...courseProgressData,
          });
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[USER_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 