import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin-server";
import db from "@/db/drizzle";
import { courses } from "@/db/schema";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, parseInt(params.courseId)),
      with: {
        units: {
          orderBy: (units, { asc }) => [asc(units.order)]
        }
      }
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export const PUT = async (
  req: Request,
  { params }: { params: { courseId: number } },
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();
  const data = await db.update(courses).set({
    ...body,
  }).where(eq(courses.id, params.courseId)).returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: { courseId: number } },
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const data = await db.delete(courses)
    .where(eq(courses.id, params.courseId)).returning();

  return NextResponse.json(data[0]);
};
