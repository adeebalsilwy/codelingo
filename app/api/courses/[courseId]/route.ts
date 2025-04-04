import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin-server";
import db from "@/db/client";
import { courses } from "@/db/schema";

// Set dynamic to force dynamic rendering
export const dynamic = 'force-dynamic';

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Total-Count, Content-Range, Range',
      'Access-Control-Expose-Headers': 'Content-Range, X-Total-Count',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
  }

    const courseId = parseInt(context.params.courseId);
    
    if (isNaN(courseId)) {
      return new NextResponse("Invalid course ID", { status: 400 });
  }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        units: {
          orderBy: (units, { asc }) => [asc(units.order)]
        }
      }
  });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_GET]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    console.log("[COURSE_PUT] Starting update for courseId:", context.params.courseId);
    
    // Verify admin status - must use await
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      console.log("[COURSE_PUT] Unauthorized - Not admin");
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const courseId = parseInt(context.params.courseId);
    
    if (isNaN(courseId)) {
      console.log("[COURSE_PUT] Invalid course ID:", context.params.courseId);
      return new NextResponse("Invalid course ID", { status: 400 });
    }

    // Find current course to ensure it exists
    const currentCourse = await db.query.courses.findFirst({
      where: eq(courses.id, courseId)
    });

    if (!currentCourse) {
      console.log("[COURSE_PUT] Course not found:", courseId);
      return new NextResponse("Course not found", { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    console.log("[COURSE_PUT] Request body:", JSON.stringify(body));
    
    if (!body.title) {
      console.log("[COURSE_PUT] Title is required");
      return new NextResponse("Title is required", { status: 400 });
    }

    // Handle image - preserve existing if no new one provided
    let imageSrc = currentCourse.imageSrc || '';
    if (body.imageSrc) {
      // Check if imageSrc is a string or an object with src
      if (typeof body.imageSrc === 'string') {
        imageSrc = body.imageSrc;
      } else if (body.imageSrc.src) {
        imageSrc = body.imageSrc.src;
      }
    }
    
    console.log("[COURSE_PUT] Processing update with imageSrc:", imageSrc);

    // Update course
    const updatedCourse = await db
      .update(courses)
      .set({
        title: body.title,
        description: body.description || '',
        imageSrc: imageSrc,
      })
      .where(eq(courses.id, courseId))
      .returning();

    console.log("[COURSE_PUT] Course updated successfully:", updatedCourse[0]);
    
    return NextResponse.json(updatedCourse[0]);
  } catch (error) {
    console.error("[COURSE_PUT] Error updating course:", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    // Verify admin status - must use await
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const courseId = parseInt(context.params.courseId);
    
    if (isNaN(courseId)) {
      return new NextResponse("Invalid course ID", { status: 400 });
    }

    // Find current course to ensure it exists
    const currentCourse = await db.query.courses.findFirst({
      where: eq(courses.id, courseId)
    });

    if (!currentCourse) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Delete course
    await db
      .delete(courses)
      .where(eq(courses.id, courseId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
