import { NextResponse } from "next/server";
import { chapters } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import db from "@/db/drizzle";
import { isAdmin } from "@/lib/admin";

export async function GET(
  req: Request,
) {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const chapter = await db.query.chapters.findFirst({
        where: eq(chapters.id, parseInt(id)),
        with: {
          unit: true
        }
      });

      if (!chapter) {
        return new NextResponse("Chapter not found", { status: 404 });
      }

      return NextResponse.json(chapter);
    }

    const { searchParams } = new URL(req.url);
    const start = parseInt(searchParams.get("_start") || "0");
    const end = parseInt(searchParams.get("_end") || "10");
    const sort = searchParams.get("_sort") || "order";
    const order = searchParams.get("_order")?.toUpperCase() || "ASC";

    const chaptersList = await db.query.chapters.findMany({
      with: {
        unit: true
      },
      offset: start,
      limit: end - start,
      orderBy: (chapters, { asc, desc }) => [
        order === "ASC" ? asc(chapters[sort as keyof typeof chapters]) : desc(chapters[sort as keyof typeof chapters])
      ],
    });

    const totalCount = await db.select({ count: sql<number>`count(*)` })
      .from(chapters)
      .then(res => Number(res[0].count));

    return NextResponse.json(chaptersList, {
      headers: {
        "Content-Range": `chapters ${start}-${end}/${totalCount}`,
        "Access-Control-Expose-Headers": "Content-Range"
      }
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
) {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const data = await req.json();

    // Validate required fields
    if (!data.title || !data.description || !data.unitId || !data.order) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [chapter] = await db.insert(chapters)
      .values(data)
      .returning();

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    let errorMessage = 'Failed to create chapter';
    let errorDetails = 'Unknown error';
    let status = 500;

    if (error instanceof Error) {
      errorDetails = error.message;
      if (error.message.includes('duplicate key')) {
        errorMessage = 'A chapter with this order already exists in this unit';
        status = 409;
      } else if (error.message.includes('foreign key')) {
        errorMessage = 'The selected unit does not exist';
        status = 400;
      } else if (error.message.includes('not-null')) {
        errorMessage = 'Required fields are missing';
        status = 400;
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status }
    );
  }
}

export async function PUT(
  req: Request,
) {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const data = await req.json();
    const { id, ...values } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Chapter ID is required' },
        { status: 400 }
      );
    }

    const [chapter] = await db.update(chapters)
      .set(values)
      .where(eq(chapters.id, id))
      .returning();

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    let errorMessage = 'Failed to update chapter';
    let errorDetails = 'Unknown error';
    let status = 500;

    if (error instanceof Error) {
      errorDetails = error.message;
      if (error.message.includes('duplicate key')) {
        errorMessage = 'A chapter with this order already exists in this unit';
        status = 409;
      } else if (error.message.includes('foreign key')) {
        errorMessage = 'The selected unit does not exist';
        status = 400;
      } else if (error.message.includes('not-null')) {
        errorMessage = 'Required fields are missing';
        status = 400;
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status }
    );
  }
}

export async function DELETE(
  req: Request,
) {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    const [deletedChapter] = await db.delete(chapters)
      .where(eq(chapters.id, parseInt(id)))
      .returning();

    if (!deletedChapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { error: 'Failed to delete chapter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}