import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import db from "@/db/drizzle";
import { isAdmin } from "@/lib/admin-server";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs";

export const runtime = 'nodejs';

// Add OPTIONS method for CORS
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

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const allCourses = await db.query.courses.findMany({
      orderBy: (courses, { asc }) => [asc(courses.id)]
    });

    return NextResponse.json(allCourses);
  } catch (error) {
    console.error("[COURSES]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const data = await db.insert(courses).values({
      ...body,
    }).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error creating course:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
