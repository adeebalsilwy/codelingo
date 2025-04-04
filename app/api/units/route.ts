import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs";
import { db } from "@/db/client";
import { isAdmin } from "@/lib/admin-server";
import { units, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

// إضافة إعدادات runtime وdynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// إضافة معالج OPTIONS لطلبات CORS prefligh
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
  const { userId } = await auth();
  
  if (!userId) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const courseId = url.searchParams.get("courseId");

    // للحصول على وحدة محددة بواسطة المعرف
    if (id) {
      const unit = await db.query.units.findFirst({
        where: eq(units.id, parseInt(id)),
        with: {
          course: true,
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)]
          }
        }
      });

      if (!unit) {
        return new NextResponse(
          JSON.stringify({ error: "Unit not found" }),
          { status: 404 }
        );
      }

      return NextResponse.json(unit);
    }

    // إذا كان هناك معرف كورس محدد، نسترجع وحدات هذا الكورس فقط
    if (courseId) {
      const courseUnits = await db.query.units.findMany({
        where: eq(units.courseId, parseInt(courseId)),
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          course: true,
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)]
          }
        }
      });

      return NextResponse.json(courseUnits);
    }

    // للمسؤولين فقط - الوصول المتقدم مع فلترة وترتيب
    if (await isAdmin()) {
      const { searchParams } = new URL(req.url);
      const start = parseInt(searchParams.get("_start") || "0");
      const end = parseInt(searchParams.get("_end") || "10");
      const sort = searchParams.get("_sort") || "order";
      const order = searchParams.get("_order")?.toUpperCase() || "ASC";
      const filter = searchParams.get("filter") ? JSON.parse(searchParams.get("filter") || "{}") : {};

      // Build filter conditions
      const conditions = [];
      if (filter.title) {
        conditions.push(like(units.title, `%${filter.title}%`));
      }
      if (filter.id) {
        conditions.push(eq(units.id, parseInt(filter.id)));
      }
      if (filter.courseId) {
        conditions.push(eq(units.courseId, parseInt(filter.courseId)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Handle sorting based on available columns
      let orderByClause;
      switch (sort) {
        case "id":
          orderByClause = order === "ASC" ? asc(units.id) : desc(units.id);
          break;
        case "title":
          orderByClause = order === "ASC" ? asc(units.title) : desc(units.title);
          break;
        case "order":
          orderByClause = order === "ASC" ? asc(units.order) : desc(units.order);
          break;
        case "courseId":
          orderByClause = order === "ASC" ? asc(units.courseId) : desc(units.courseId);
          break;
        default:
          orderByClause = asc(units.order);
      }

      const unitsList = await db.query.units.findMany({
        where: whereClause,
        offset: start,
        limit: end - start,
        with: {
          course: true,
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)]
          }
        },
        orderBy: [orderByClause]
      });

      const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
        .from(units)
        .where(whereClause || sql`TRUE`);

      const totalCount = Number(totalCountQuery[0].count);

      const response = NextResponse.json(unitsList);
      
      // Set required headers for react-admin
      response.headers.set("Content-Range", `units ${start}-${Math.min(end, totalCount)}/${totalCount}`);
      response.headers.set("Access-Control-Expose-Headers", "Content-Range");
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Total-Count, Content-Range");

      return response;
    } else {
      // للمستخدمين العاديين - جلب جميع الوحدات المرتبة حسب الترتيب
      // الوصول العادي للمستخدمين: جلب جميع الوحدات للكورس النشط
      const userProgressData = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
      });

      if (!userProgressData?.activeCourseId) {
        return NextResponse.json([]);
      }

      const courseUnits = await db.query.units.findMany({
        where: eq(units.courseId, userProgressData.activeCourseId),
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          course: true,
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)]
          }
        }
      });

      return NextResponse.json(courseUnits);
    }
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  if (!await isAdmin()) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401 }
    );
  }

  const body = await req.json();

  const data = await db.insert(units).values({
    ...body,
  }).returning();

  return NextResponse.json(data[0]);
};

