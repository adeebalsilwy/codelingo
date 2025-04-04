import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin-server";
import db from "@/db/client";
import { courses } from "@/db/schema";

export async function GET(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, parseInt(context.params.courseId)),
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { title, description, imageSrc } = await request.json();

    const course = await db
      .update(courses)
      .set({
        title,
        description,
        imageSrc,
      })
      .where(eq(courses.id, parseInt(context.params.courseId)))
      .returning();

    return NextResponse.json(course[0]);
  } catch (error) {
    console.error("[COURSE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { courseId: string } }
) {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    await db
      .delete(courses)
      .where(eq(courses.id, parseInt(context.params.courseId)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COURSE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
