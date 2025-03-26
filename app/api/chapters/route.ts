import { NextResponse } from "next/server";
import { chapters } from "@/db/schema";
import { eq, sql, asc, desc } from "drizzle-orm";
import db from "@/db/client";

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

      return NextResponse.json(chapter);
    }

    const { searchParams } = new URL(req.url);
    const start = parseInt(searchParams.get("_start") || "0");
    const end = parseInt(searchParams.get("_end") || "10");
    const order = searchParams.get("_order") || "ASC";

    const chaptersList = await db.query.chapters.findMany({
      with: {
        unit: true
      },
      offset: start,
      limit: end - start,
      orderBy: order === "ASC" ? [asc(chapters.id)] : [desc(chapters.id)]
    });

    const totalCount = await db.select({ count: sql<number>`count(*)` })
      .from(chapters)
      .then(res => Number(res[0].count));

    const formattedChapters = chaptersList.map(chapter => ({
      ...chapter,
      unitId: chapter.unit?.id
    }));

    return NextResponse.json(formattedChapters, {
      headers: {
        "Content-Range": `chapters ${start}-${end}/${totalCount}`,
        "Access-Control-Expose-Headers": "Content-Range"
      }
    })
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