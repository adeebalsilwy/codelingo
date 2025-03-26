import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin-server";
import db from "@/db/client";
import { units } from "@/db/schema";

export async function GET(
  req: Request,
  { params }: { params: { unitId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
  }

    const unit = await db.query.units.findFirst({
      where: eq(units.id, parseInt(params.unitId)),
      with: {
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order)]
        }
      }
  });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("[UNIT_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export const PUT = async (
  req: Request,
  { params }: { params: { unitId: number } },
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();
  const data = await db.update(units).set({
    ...body,
  }).where(eq(units.id, params.unitId)).returning();

  return NextResponse.json(data[0]);
};

export const DELETE = async (
  req: Request,
  { params }: { params: { unitId: number } },
) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const data = await db.delete(units)
    .where(eq(units.id, params.unitId)).returning();

  return NextResponse.json(data[0]);
};
