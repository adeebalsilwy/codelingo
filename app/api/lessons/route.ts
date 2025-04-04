import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import db from "@/db/client";
import { isAdmin } from "@/lib/admin-server";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";

// Set dynamic to force dynamic rendering
export const dynamic = 'force-dynamic';

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Total-Count, Content-Range, Range',
      'Access-Control-Expose-Headers': 'Content-Range, X-Total-Count',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export const GET = async (req: Request) => {
  try {
    // Must await isAdmin() call
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, parseInt(id)),
        with: {
          unit: true,
          chapter: true,
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],
          }
        }
      });

      if (!lesson) {
        return new NextResponse("Lesson not found", { status: 404 });
      }

      return NextResponse.json(lesson);
    }

    const { searchParams } = new URL(req.url);
    const start = parseInt(searchParams.get("_start") || "0");
    const end = parseInt(searchParams.get("_end") || "10");
    const sort = searchParams.get("_sort") || "id";
    const order = searchParams.get("_order")?.toUpperCase() || "ASC";
    const filter = searchParams.get("filter") ? JSON.parse(searchParams.get("filter") || "{}") : {};

    // Build filter conditions
    const conditions = [];
    if (filter.title) {
      conditions.push(like(lessons.title, `%${filter.title}%`));
    }
    if (filter.id) {
      conditions.push(eq(lessons.id, parseInt(filter.id)));
    }
    if (filter.unitId) {
      conditions.push(eq(lessons.unitId, parseInt(filter.unitId)));
    }
    if (filter.chapterId) {
      conditions.push(eq(lessons.chapterId, parseInt(filter.chapterId)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const lessonsList = await db.query.lessons.findMany({
      where: whereClause,
      offset: start,
      limit: end - start,
      with: {
        unit: true,
        chapter: true,
        challenges: {
          orderBy: (challenges, { asc }) => [asc(challenges.order)],
        }
      },
      orderBy: (lessons, { asc: ascFn, desc: descFn }) => [
        order === "ASC" 
          ? ascFn(lessons[sort as keyof typeof lessons]) 
          : descFn(lessons[sort as keyof typeof lessons])
      ],
    });

    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(lessons)
      .where(whereClause || sql`TRUE`);

    const totalCount = Number(totalCountQuery[0].count);

    return NextResponse.json(lessonsList, {
      headers: {
        "Content-Range": `lessons ${start}-${end}/${totalCount}`,
        "X-Total-Count": totalCount.toString(),
        "Access-Control-Expose-Headers": "Content-Range, X-Total-Count"
      }
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: `Failed to fetch lessons: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    // Must await isAdmin() call
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const data = await db.insert(lessons).values({
      ...body,
    }).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: `Failed to create lesson: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
};
