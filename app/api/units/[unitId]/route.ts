import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin-server";
import db from "@/db/client";
import { units } from "@/db/schema";

export async function GET(
  request: NextRequest,
  context: { params: { unitId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const unit = await db.query.units.findFirst({
      where: eq(units.id, parseInt(context.params.unitId)),
      with: {
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order)]
        }
      }
    });

    if (!unit) {
      return new NextResponse("Unit not found", { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("[UNIT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { unitId: string } }
) {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    const { title, description } = await request.json();

    const unit = await db
      .update(units)
      .set({
        title,
        description,
      })
      .where(eq(units.id, parseInt(context.params.unitId)))
      .returning();

    return NextResponse.json(unit[0]);
  } catch (error) {
    console.error("[UNIT_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { unitId: string } }
) {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    await db
      .delete(units)
      .where(eq(units.id, parseInt(context.params.unitId)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[UNIT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
