import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc, SQL } from "drizzle-orm";
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
    const { searchParams } = new URL(req.url);
    
    // Add fetchAll parameter support
    const fetchAllParam = searchParams.get("fetchAll");
    const fetchAll = true; // Always fetch all lessons to ensure proper selection in forms
    
    // Parse range parameter from query string (format: JSON string like '[0, 9]')
    const rangeParam = searchParams.get("range");
    let start = 0, end = 10;

    if (rangeParam) {
      try {
        const range = JSON.parse(rangeParam);
        start = range[0] || 0;
        end = range[1] || 10;
        console.log(`[API] Lessons using range: ${start}-${end}, fetchAll: ${fetchAll}`);
      } catch (e) {
        console.error('Invalid range parameter:', rangeParam, e);
      }
    }
    
    // Parse sort parameter (format: JSON string like '["id", "DESC"]')
    const sortParam = searchParams.get("sort");
    let sort = "id";
    let order = "ASC";
    
    if (sortParam) {
      try {
        const sortValues = JSON.parse(sortParam);
        if (Array.isArray(sortValues) && sortValues.length === 2) {
          sort = sortValues[0] || "id";
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

    // Prepare query options
    const queryOptions: any = {
      where: whereClause,
      with: {
        unit: {
          columns: {
            id: true,
            title: true,
            courseId: true,
          },
          with: {
            course: {
              columns: {
                id: true,
                title: true,
              }
            }
          }
        },
        chapter: {
          columns: {
            id: true,
            title: true,
            unitId: true,
          }
        },
        challenges: {
          orderBy: (challenges: any, { asc }: { asc: any }) => [asc(challenges.order)],
        }
      },
      orderBy: (lessons: any, { asc: ascFn, desc: descFn }: { asc: any; desc: any }) => [
        order === "ASC" 
          ? ascFn(lessons[sort as keyof typeof lessons]) 
          : descFn(lessons[sort as keyof typeof lessons])
      ],
    };
    
    // Add pagination only if not fetching all
    if (!fetchAll) {
      queryOptions.offset = start;
      queryOptions.limit = (end - start) + 1;
    }
    
    console.log(`[API] Executing lessons query with ${fetchAll ? 'NO PAGINATION' : `pagination: offset=${start}, limit=${end - start + 1}`}`);

    const lessonsList = await db.query.lessons.findMany(queryOptions);

    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(lessons)
      .where(whereClause || sql`TRUE`);

    const totalCount = Number(totalCountQuery[0].count);
    
    console.log(`[API] Found ${lessonsList.length} lessons, Total: ${totalCount}`);
    
    // Calculate effective end based on whether we're fetching all
    const effectiveEnd = fetchAll ? (totalCount - 1) : Math.min(end, totalCount - 1);
    const contentRange = `lessons ${start}-${effectiveEnd}/${totalCount}`;

    return NextResponse.json(lessonsList, {
      headers: {
        "Content-Range": contentRange,
        "X-Total-Count": totalCount.toString(),
        "Access-Control-Expose-Headers": "Content-Range, X-Total-Count",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
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
