import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin-server";
import db from "@/db/client";
import { units } from "@/db/schema";

// Set dynamic to force dynamic rendering
export const dynamic = 'force-dynamic';

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Total-Count',
      'Access-Control-Max-Age': '86400',
    },
  });
}

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
        },
        course: true // Include course information
      }
    });

    if (!unit) {
      return new NextResponse("Unit not found", { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("[UNIT_GET]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { unitId: string } }
) {
  try {
    // Verify admin status
    if (!await isAdmin()) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    
    // Ensure required fields are present
    if (!body.title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Find current unit to ensure it exists
    const currentUnit = await db.query.units.findFirst({
      where: eq(units.id, parseInt(context.params.unitId))
    });

    if (!currentUnit) {
      return new NextResponse("Unit not found", { status: 404 });
    }

    // Update unit
    const updatedUnit = await db
      .update(units)
      .set({
        title: body.title,
        description: body.description || currentUnit.description,
        courseId: body.courseId || currentUnit.courseId,
        order: body.order || currentUnit.order,
      })
      .where(eq(units.id, parseInt(context.params.unitId)))
      .returning();

    return NextResponse.json(updatedUnit[0]);
  } catch (error) {
    console.error("[UNIT_PUT]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { unitId: string } }
) {
  try {
    // Verify admin status
    if (!await isAdmin()) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    // Find current unit to ensure it exists
    const currentUnit = await db.query.units.findFirst({
      where: eq(units.id, parseInt(context.params.unitId))
    });

    if (!currentUnit) {
      return new NextResponse("Unit not found", { status: 404 });
    }

    // Delete unit
    await db
      .delete(units)
      .where(eq(units.id, parseInt(context.params.unitId)));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[UNIT_DELETE]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
