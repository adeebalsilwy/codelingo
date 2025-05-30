import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc, SQL } from "drizzle-orm";
import db from "@/db/client";
import { isAdmin } from "@/lib/admin-server";
import { challengeOptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET = async (req: Request) => {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const option = await db.query.challengeOptions.findFirst({
        where: eq(challengeOptions.id, parseInt(id)),
        with: {
          challenge: true
        }
      });

      if (!option) {
        return new NextResponse("Challenge option not found", { status: 404 });
      }

      return NextResponse.json(option);
    }

    const { searchParams } = new URL(req.url);
    
    // Parse additional parameters
    const fetchAllParam = searchParams.get("fetchAll");
    // const fetchAll = fetchAllParam === 'true';
    const fetchAll = true;

    
    // Parse range parameter from query string (format: JSON string like '[0, 9]')
    const rangeParam = searchParams.get("range");
    let start = 0, end = 500;

    if (rangeParam) {
      try {
        const range = JSON.parse(rangeParam);
        start = range[0] || 0;
        end = range[1] || 10;
        console.log(`[API] ChallengeOptions using range: ${start}-${end}, fetchAll: ${fetchAll}`);
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
    if (filter.text) {
      conditions.push(like(challengeOptions.text, `%${filter.text}%`));
    }
    if (filter.id) {
      conditions.push(eq(challengeOptions.id, parseInt(filter.id)));
    }
    if (filter.challengeId) {
      conditions.push(eq(challengeOptions.challengeId, parseInt(filter.challengeId)));
    }
    if (filter.correct !== undefined) {
      conditions.push(eq(challengeOptions.correct, filter.correct));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderByClause;
    switch (sort) {
      case "id":
        orderByClause = order === "ASC" ? asc(challengeOptions.id) : desc(challengeOptions.id);
        break;
      case "text":
        orderByClause = order === "ASC" ? asc(challengeOptions.text) : desc(challengeOptions.text);
        break;
      case "correct":
        orderByClause = order === "ASC" ? asc(challengeOptions.correct) : desc(challengeOptions.correct);
        break;
      case "challengeId":
        orderByClause = order === "ASC" ? asc(challengeOptions.challengeId) : desc(challengeOptions.challengeId);
        break;
      default:
        orderByClause = asc(challengeOptions.id);
    }

    const optionsList = await db.query.challengeOptions.findMany({
      where: whereClause,
      offset: fetchAll ? undefined : start,
      limit: fetchAll ? undefined : (end - start) + 1,
      with: {
        challenge: true
      },
      orderBy: [orderByClause]
    });

    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(challengeOptions)
      .where(whereClause || sql`TRUE`);

    const totalCount = Number(totalCountQuery[0].count);
    console.log(`[API] Found ${optionsList.length} options, Total: ${totalCount}`);
    
    const effectiveEnd = fetchAll ? (totalCount - 1) : Math.min(end, totalCount - 1);
    const contentRange = `challengeOptions ${start}-${effectiveEnd}/${totalCount}`;

    return NextResponse.json(optionsList, {
      headers: {
        "Content-Range": contentRange,
        "X-Total-Count": totalCount.toString(),
        "Access-Control-Expose-Headers": "Content-Range, X-Total-Count",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Total-Count, Content-Range",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error('Error fetching challenge options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge options' },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const data = await db.insert(challengeOptions).values({
      ...body,
    }).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creating challenge option:', error);
    return NextResponse.json(
      { error: `Failed to create challenge option: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
};
