import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId, hearts, points } = await req.json();

    // First, try to find existing user progress
    const existingProgress = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
    });

    if (existingProgress) {
      // Update existing progress
      await db
        .update(userProgress)
        .set({ 
          activeCourseId: courseId,
          hearts,
          points
        })
        .where(eq(userProgress.userId, userId));
    } else {
      // Create new progress
      await db
        .insert(userProgress)
        .values({
         
          userId,
          userName: "", // This can be updated later if needed
          activeCourseId: courseId,
          hearts,
          points,
        });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[USER_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 