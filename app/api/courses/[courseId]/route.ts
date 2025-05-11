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
    // Make sure params exist and are accessed properly
    const params = context.params;
    if (!params?.courseId) {
      return new NextResponse("Missing course ID", { status: 400 });
    }
    
    const courseId = parseInt(params.courseId);
    
    if (isNaN(courseId)) {
      return new NextResponse("Invalid course ID", { status: 400 });
    }

    // Fetch the course
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
    // Make sure params exist and are accessed properly
    const params = context.params;
    
    console.log("[COURSE_PUT] Starting update for courseId:", params?.courseId);
    
    // Validate courseId parameter exists
    if (!params?.courseId) {
      console.error("[COURSE_PUT] Missing courseId in URL parameters");
      return new NextResponse("Missing course ID in URL", { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
    
    // Skip admin checks - allow all operations
    
    // Parse courseId
    const courseId = parseInt(params.courseId);
    
    if (isNaN(courseId)) {
      console.log("[COURSE_PUT] Invalid course ID:", params.courseId);
      return new NextResponse("Invalid course ID", { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }

    // Find current course to ensure it exists
    console.log(`[COURSE_PUT] Finding course with ID ${courseId}`);
    const currentCourse = await db.query.courses.findFirst({
      where: eq(courses.id, courseId)
    });

    if (!currentCourse) {
      console.log("[COURSE_PUT] Course not found:", courseId);
      return new NextResponse("Course not found", { 
        status: 404,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }

    console.log(`[COURSE_PUT] Found existing course:`, currentCourse);

    // Parse request body
    let body;
    try {
      const text = await request.text();
      console.log("[COURSE_PUT] Raw request body:", text);
      
      body = JSON.parse(text);
      console.log("[COURSE_PUT] Parsed request body:", body);
    } catch (error) {
      console.error("[COURSE_PUT] Failed to parse request body:", error);
      return new NextResponse(`Invalid request body - ${error instanceof Error ? error.message : 'JSON parsing error'}`, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
    
    if (!body.title) {
      console.log("[COURSE_PUT] Validation failed: Title is required");
      return new NextResponse("Title is required", { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }

    // Handle image - use default if none provided
    let imageSrc = '/courses.svg'; // Default image - using existing SVG in public folder
    
    if (body.imageSrc) {
      // Check if imageSrc is a string or an object with src
      if (typeof body.imageSrc === 'string' && body.imageSrc.trim() !== '') {
        imageSrc = body.imageSrc;
        console.log("[COURSE_PUT] Using image from string:", imageSrc);
      } else if (typeof body.imageSrc === 'object') {
        // Try to extract src from object
        if (body.imageSrc.src && typeof body.imageSrc.src === 'string' && body.imageSrc.src.trim() !== '') {
          imageSrc = body.imageSrc.src;
          console.log("[COURSE_PUT] Using image from object.src:", imageSrc);
        } else if (body.imageSrc.url && typeof body.imageSrc.url === 'string' && body.imageSrc.url.trim() !== '') {
          imageSrc = body.imageSrc.url;
          console.log("[COURSE_PUT] Using image from object.url:", imageSrc);
        } else if (body.imageSrc.rawFile) {
          // For raw files, we should have processed these already, but just in case
          console.log("[COURSE_PUT] Received rawFile but these should be processed by dataProvider");
          // Keep default image in this case
          if (currentCourse.imageSrc && currentCourse.imageSrc.trim() !== '') {
            imageSrc = currentCourse.imageSrc;
            console.log("[COURSE_PUT] Keeping existing image when rawFile present:", imageSrc);
          }
        }
      }
    } else if (currentCourse.imageSrc && currentCourse.imageSrc.trim() !== '') {
      // Keep existing image if present
      imageSrc = currentCourse.imageSrc;
      console.log("[COURSE_PUT] Keeping existing image:", imageSrc);
    } else {
      console.log("[COURSE_PUT] Using default image:", imageSrc);
    }
    
    // Final check to ensure imageSrc is not empty
    if (!imageSrc || imageSrc.trim() === '') {
      imageSrc = '/courses.svg';
      console.log("[COURSE_PUT] Empty imageSrc, falling back to default image");
    }
    
    console.log("[COURSE_PUT] Final image source:", imageSrc);

    try {
      // Prepare update data
      const updateData = {
        title: body.title,
        description: body.description || '',
        imageSrc: imageSrc,
      };
      
      console.log("[COURSE_PUT] Updating course with data:", updateData);
      
      // Update course
      const updatedCourse = await db
        .update(courses)
        .set(updateData)
        .where(eq(courses.id, courseId))
        .returning();

      if (!updatedCourse || updatedCourse.length === 0) {
        console.error("[COURSE_PUT] Update returned no data");
        return new NextResponse("Update failed - no data returned", {
          status: 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      }

      console.log("[COURSE_PUT] Course updated successfully:", updatedCourse[0]);
      
      return NextResponse.json(updatedCourse[0], {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    } catch (dbError) {
      console.error("[COURSE_PUT] Database error updating course:", dbError);
      return new NextResponse(`Database Error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
  } catch (error) {
    console.error("[COURSE_PUT] Unhandled error updating course:", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    // Make sure params exist and are accessed properly
    const params = context.params;
    
    if (!params?.courseId) {
      return new NextResponse("Missing course ID", { status: 400 });
    }
    
    // Skip admin check
    const courseId = parseInt(params.courseId);
    
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
