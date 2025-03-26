import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/client";
import { chapters } from "@/db/schema";
import { isAdmin } from "@/lib/admin-server";

export const GET = async (
  req: Request,
  { params }: { params: { chapterId: number } },
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const data = await db.query.chapters.findFirst({
    where: eq(chapters.id, params.chapterId),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: { chapterId: number } },
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();
  const data = await db.update(chapters).set({
    ...body,
  }).where(eq(chapters.id, params.chapterId)).returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: { chapterId: number } },
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const data = await db.delete(chapters)
    .where(eq(chapters.id, params.chapterId)).returning();

  return NextResponse.json(data[0]);
};