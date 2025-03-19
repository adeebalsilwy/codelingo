import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import db from "@/db/drizzle";
import { isAdmin } from "@/lib/admin";
import { units } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

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
        return new NextResponse("Unit not found", { status: 404 });
      }

      return NextResponse.json(unit);
    }

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
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const data = await db.insert(units).values({
    ...body,
  }).returning();

  return NextResponse.json(data[0]);
};
