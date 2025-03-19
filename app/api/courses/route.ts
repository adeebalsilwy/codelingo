import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import db from "@/db/drizzle";
import { isAdmin } from "@/lib/admin-server";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs";

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

export const GET = async (req: Request) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse("Unauthorized", { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const course = await db.query.courses.findFirst({
        where: eq(courses.id, parseInt(id)),
        with: {
          units: {
            orderBy: (units, { asc }) => [asc(units.order)]
          }
        }
      });

      if (!course) {
        return new NextResponse("Course not found", { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }

      const response = NextResponse.json(course);
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return response;
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
      conditions.push(like(courses.title, `%${filter.title}%`));
    }
    if (filter.id) {
      conditions.push(eq(courses.id, parseInt(filter.id)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(whereClause);
    const totalCount = Number(totalCountResult[0].count);

    // Get paginated and sorted results
    const results = await db.query.courses.findMany({
      where: whereClause,
      orderBy: sort === "id" 
        ? order === "DESC" ? desc(courses.id) : asc(courses.id)
        : sort === "title"
        ? order === "DESC" ? desc(courses.title) : asc(courses.title)
        : asc(courses.id),
      limit: end - start,
      offset: start,
      with: {
        units: {
          orderBy: (units, { asc }) => [asc(units.order)]
        }
      }
    });

    const response = NextResponse.json(results);
    response.headers.set('Content-Range', `courses ${start}-${Math.min(end, totalCount)}/${totalCount}`);
    response.headers.set('Access-Control-Expose-Headers', 'Content-Range');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse("Unauthorized", { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
  }

  const body = await req.json();

  const data = await db.insert(courses).values({
    ...body,
  }).returning();

    const response = NextResponse.json(data[0]);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
};
