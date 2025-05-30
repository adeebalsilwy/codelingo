import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc, SQL } from "drizzle-orm";
import db from "@/db/client";
import { isAdmin } from "@/lib/admin-server";
import { challenges } from "@/db/schema";
import { eq } from "drizzle-orm";

// إضافة إعدادات runtime وdynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// إضافة معالج OPTIONS لطلبات CORS preflight
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
    // Parse search parameters if any
    const url = new URL(req.url);
    const filterParam = url.searchParams.get('filter');
    const rangeParam = url.searchParams.get('range');
    const sortParam = url.searchParams.get('sort');
    const fetchAllParam = url.searchParams.get('fetchAll'); 
    
    console.log(`[API] GET /challenges - Filter: ${filterParam}, Range: ${rangeParam}, Sort: ${sortParam}, FetchAll: ${fetchAllParam}`);
    
    // Default values
    let filter: Record<string, any> = {};
    let start = 0;
    let end = 10;
    let sort = "id";
    let order = "ASC";
    const fetchAll = true; // Always fetch all challenges

    // Parse filter
    if (filterParam) {
      try {
        filter = JSON.parse(filterParam);
        console.log(`[API] Parsed filter:`, filter);
      } catch (e) {
        console.error('Invalid filter parameter:', filterParam, e);
      }
    }
    
    // Parse range
    if (rangeParam) {
      try {
        const range = JSON.parse(rangeParam);
        start = range[0] || 0;
        end = range[1] || 9;
        console.log(`[API] Using range: ${start}-${end}`);
      } catch (e) {
        console.error('Invalid range parameter:', rangeParam, e);
      }
    }
    
    // Parse sort
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

    // Build filter conditions
    const conditions: SQL<unknown>[] = [];
    if (filter.question) {
      conditions.push(like(challenges.question, `%${filter.question}%`));
    }
    if (filter.id) {
      conditions.push(eq(challenges.id, parseInt(filter.id)));
    }
    if (filter.lessonId) {
      conditions.push(eq(challenges.lessonId, parseInt(filter.lessonId)));
    }
    if (filter.type) {
      conditions.push(eq(challenges.type, filter.type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Prepare query options
    const queryOptions: any = {
      where: whereClause,
      with: {
        lesson: true,
        challengeOptions: true
      },
      orderBy: (challenges: any, { asc: ascFn, desc: descFn }: { asc: any; desc: any }) => [
        order === "ASC" 
          ? ascFn(challenges[sort as keyof typeof challenges]) 
          : descFn(challenges[sort as keyof typeof challenges])
      ],
    };
    
    // Add pagination only if not fetching all
    if (!fetchAll) {
      queryOptions.offset = start;
      queryOptions.limit = (end - start) + 1;
    }
    
    console.log(`[API] Executing query with ${fetchAll ? 'NO PAGINATION' : `pagination: offset=${start}, limit=${end - start + 1}`}`);

    const challengesList = await db.query.challenges.findMany(queryOptions);

    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(challenges)
      .where(whereClause || sql`TRUE`);

    const totalCount = Number(totalCountQuery[0].count);
    
    console.log(`[API] Found ${challengesList.length} challenges, Total: ${totalCount}`);

    const effectiveEnd = fetchAll ? (totalCount - 1) : Math.min(end, totalCount - 1);
    const contentRange = `challenges ${start}-${effectiveEnd}/${totalCount}`;

    return NextResponse.json(challengesList, {
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
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: `Failed to fetch challenges: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    // تصحيح استدعاء isAdmin ليكون متزامنًا
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const data = await db.insert(challenges).values({
      ...body,
    }).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: `Failed to create challenge: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
};
