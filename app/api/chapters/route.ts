import { NextResponse } from "next/server";
import { chapters } from "@/db/schema";
import { eq, sql, asc, desc, and, like } from "drizzle-orm";
import db from "@/db/client";
import { parseApiParams, createApiResponse } from "@/app/lib/api-helpers";

export async function GET(
  req: Request,
) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const chapter = await db.query.chapters.findFirst({
        where: eq(chapters.id, parseInt(id)),
      });

      return createApiResponse(chapter);
    }

    const { searchParams } = new URL(req.url);
    
    // Use the helper function to parse all common API parameters
    const { fetchAll, start, end, sort, order, filter } = parseApiParams(searchParams);
    
    console.log(`[API] Chapters request with params: fetchAll=${fetchAll}, start=${start}, end=${end}, sort=${sort}, order=${order}`);

    // Build filter conditions
    const conditions = [];
    if (filter.title) {
      conditions.push(like(chapters.title, `%${filter.title}%`));
    }
    if (filter.id) {
      conditions.push(eq(chapters.id, parseInt(filter.id)));
    }
    if (filter.unitId) {
      conditions.push(eq(chapters.unitId, parseInt(filter.unitId)));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Prepare query options
    const queryOptions: any = {
      with: {
        unit: true
      },
      orderBy: sort === "id" 
        ? (order === "ASC" ? [asc(chapters.id)] : [desc(chapters.id)])
        : (order === "ASC" ? [asc(chapters[sort as keyof typeof chapters] as any)] : [desc(chapters[sort as keyof typeof chapters] as any)])
    };
    
    // Add pagination only if not fetching all
    if (!fetchAll) {
      queryOptions.offset = start;
      queryOptions.limit = (end - start) + 1;
    }
    
    // Add where clause if it exists
    if (whereClause) {
      queryOptions.where = whereClause;
    }
    
    console.log(`[API] Executing chapters query with ${fetchAll ? 'NO PAGINATION (fetching all)' : `pagination: offset=${start}, limit=${end - start + 1}`}`);

    const chaptersList = await db.query.chapters.findMany(queryOptions);

    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(chapters)
      .where(whereClause || sql`TRUE`);

    const totalCount = Number(totalCountQuery[0].count);
    
    console.log(`[API] Found ${chaptersList.length} chapters, Total: ${totalCount}`);

    const formattedChapters = chaptersList.map(chapter => ({
      ...chapter,
      unitId: chapter.unitId
    }));
    
    // Calculate effective end for Content-Range header
    const effectiveEnd = fetchAll ? (totalCount - 1) : Math.min(end, totalCount - 1);
    const contentRange = `chapters ${start}-${effectiveEnd}/${totalCount}`;

    // Use the helper function to create a consistent response
    return createApiResponse(formattedChapters, {
      contentRange,
      totalCount
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const chapter = await db.insert(chapters).values(body).returning();
    return NextResponse.json(chapter[0]);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
) {
  try {
    const body = await req.json();
    const { id, ...values } = body;

    const chapter = await db.update(chapters)
      .set(values)
      .where(eq(chapters.id, id))
      .returning();

    return NextResponse.json(chapter[0]);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    await db.delete(chapters)
      .where(eq(chapters.id, parseInt(id)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}