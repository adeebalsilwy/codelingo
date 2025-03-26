import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import db from "@/db/client";
import { isAdmin } from "@/lib/admin-server";
import { challenges } from "@/db/schema";
import { eq } from "drizzle-orm";

export const GET = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, parseInt(id)),
        with: {
          lesson: true,
          challengeOptions: true
        }
      });

      if (!challenge) {
        return new NextResponse("Challenge not found", { status: 404 });
      }

      return NextResponse.json(challenge);
    }

    const { searchParams } = new URL(req.url);
    const start = parseInt(searchParams.get("_start") || "0");
    const end = parseInt(searchParams.get("_end") || "10");
    const sort = searchParams.get("_sort") || "id";
    const order = searchParams.get("_order")?.toUpperCase() || "ASC";
    const filter = searchParams.get("filter") ? JSON.parse(searchParams.get("filter") || "{}") : {};

    // Build filter conditions
    const conditions = [];
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

    const challengesList = await db.query.challenges.findMany({
      where: whereClause,
      offset: start,
      limit: end - start,
      with: {
        lesson: true,
        challengeOptions: true
      },
      orderBy: (challenges, { asc: ascFn, desc: descFn }) => [
        order === "ASC" 
          ? ascFn(challenges[sort as keyof typeof challenges]) 
          : descFn(challenges[sort as keyof typeof challenges])
      ],
    });

    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(challenges)
      .where(whereClause || sql`TRUE`);

    const totalCount = Number(totalCountQuery[0].count);

    return NextResponse.json(challengesList, {
      headers: {
        "Content-Range": `challenges ${start}-${end}/${totalCount}`,
        "X-Total-Count": totalCount.toString(),
        "Access-Control-Expose-Headers": "Content-Range, X-Total-Count"
      }
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();

  const data = await db.insert(challenges).values({
    ...body,
  }).returning();

  return NextResponse.json(data[0]);
};
