import { NextResponse } from 'next/server';
import db from "@/db/client";
import { chapters } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { unitId: string } }
) {
  try {
    const unitId = parseInt(params.unitId);

    if (isNaN(unitId)) {
      return NextResponse.json(
        { error: 'Invalid unit ID' },
        { status: 400 }
      );
    }

    const chaptersData = await db.query.chapters.findMany({
      where: eq(chapters.unitId, unitId),
      orderBy: (chapters, { asc }) => [asc(chapters.order)],
    });

    return NextResponse.json(chaptersData);
  } catch (error) {
    console.error('[CHAPTERS_GET]', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
} 