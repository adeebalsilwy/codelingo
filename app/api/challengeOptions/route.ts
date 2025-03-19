import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import db from "@/db/drizzle";
import { isAdmin } from "@/lib/admin-server";
import { challengeOptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
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
    const start = parseInt(searchParams.get("_start") || "0");
    const end = parseInt(searchParams.get("_end") || "10");
    const sort = searchParams.get("_sort") || "id";
    const order = searchParams.get("_order")?.toUpperCase() || "ASC";
    const filter = searchParams.get("filter") ? JSON.parse(searchParams.get("filter") || "{}") : {};

    // Build filter conditions
    const conditions = [];
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

    // Handle sorting based on available columns
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
      offset: start,
      limit: end - start,
      with: {
        challenge: true
      },
      orderBy: [orderByClause]
    });

    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(challengeOptions)
      .where(whereClause || sql`TRUE`);

    const totalCount = Number(totalCountQuery[0].count);

    const response = NextResponse.json(optionsList);
    
    // Set required headers for react-admin
    response.headers.set("Content-Range", `challengeOptions ${start}-${Math.min(end, totalCount)}/${totalCount}`);
    response.headers.set("Access-Control-Expose-Headers", "Content-Range");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Total-Count, Content-Range");

    return response;
  } catch (error) {
    console.error('Error fetching challenge options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge options' },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const data = await db.insert(challengeOptions).values({
    ...body,
  }).returning();

  return NextResponse.json(data[0]);
};
