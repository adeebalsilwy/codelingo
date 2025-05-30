import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc, SQL } from "drizzle-orm";
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
            orderBy: (lessons: any, { asc }: { asc: any }) => [asc(lessons.order)]
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
            orderBy: (lessons: any, { asc }: { asc: any }) => [asc(lessons.order)]
          }
        }
      });

      return NextResponse.json(courseUnits);
    }

    // للمسؤولين فقط - الوصول المتقدم مع فلترة وترتيب
    if (await isAdmin()) {
      const { searchParams } = new URL(req.url);
      
      // Parse range parameter from query string (format: JSON string like '[0, 9]')
      const rangeParam = searchParams.get("range");
      const fetchAllParam = searchParams.get("fetchAll");
      const fetchAll = fetchAllParam === 'true';
      let start = 0, end = 10;

      if (rangeParam) {
        try {
          const range = JSON.parse(rangeParam);
          start = range[0] || 0;
          end = range[1] || 10;
          console.log(`[API] Using range: ${start}-${end}, fetchAll: ${fetchAll}`);
        } catch (e) {
          console.error('Invalid range parameter:', rangeParam, e);
        }
      }
      
      // Parse sort parameter (format: JSON string like '["id", "DESC"]')
      const sortParam = searchParams.get("sort");
      let sort = "order";
      let order = "ASC";
      
      if (sortParam) {
        try {
          const sortValues = JSON.parse(sortParam);
          if (Array.isArray(sortValues) && sortValues.length === 2) {
            sort = sortValues[0] || "order";
            order = sortValues[1] || "ASC";
          }
        } catch (e) {
          console.error('Invalid sort parameter:', sortParam, e);
        }
      }
      
      // Parse filter parameter (format: JSON object)
      const filterParam = searchParams.get("filter");
      let filter: Record<string, any> = {};
      
      if (filterParam) {
        try {
          filter = JSON.parse(filterParam);
        } catch (e) {
          console.error('Invalid filter parameter:', filterParam, e);
        }
      }

      // Build filter conditions
      const conditions: SQL<unknown>[] = [];
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

      // Prepare query options
      const queryOptions: any = {
        where: whereClause,
        with: {
          course: true,
          lessons: {
            orderBy: (lessons: any, { asc }: { asc: any }) => [asc(lessons.order)]
          }
        },
        orderBy: [orderByClause]
      };
      
      // Add pagination only if not fetching all
      if (!fetchAll) {
        queryOptions.offset = start;
        queryOptions.limit = (end - start) + 1;
      }
      
      console.log(`[API] Executing units query with ${fetchAll ? 'NO PAGINATION' : `pagination: offset=${start}, limit=${end - start + 1}`}`);

      const unitsList = await db.query.units.findMany(queryOptions);

      const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
        .from(units)
        .where(whereClause || sql`TRUE`);

      const totalCount = Number(totalCountQuery[0].count);
      
      console.log(`[API] Found ${unitsList.length} units, Total: ${totalCount}`);
      
      // Calculate effective end based on whether we're fetching all
      const effectiveEnd = fetchAll ? (totalCount - 1) : Math.min(end, totalCount - 1);
      const contentRange = `units ${start}-${effectiveEnd}/${totalCount}`;

      // Return with proper headers for react-admin
      return NextResponse.json(unitsList, {
        headers: {
          "Content-Range": contentRange,
          "X-Total-Count": totalCount.toString(),
          "Access-Control-Expose-Headers": "Content-Range, X-Total-Count",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Total-Count, Content-Range"
        }
      });
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
            orderBy: (lessons: any, { asc }: { asc: any }) => [asc(lessons.order)]
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

