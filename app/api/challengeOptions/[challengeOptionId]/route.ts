import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import db from "@/db/client";
import { challengeOptions } from "@/db/schema";
import { isAdmin } from "@/lib/admin-server";

// Set dynamic to force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Total-Count',
      'Access-Control-Max-Age': '0',
    },
  });
}
export const GET = async (
  req: NextRequest,
  { params }: { params: { challengeOptionId: string } },
) => {
  try {
    // Await the isAdmin function since it's async
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    // Await params before accessing its properties
    const { challengeOptionId } = await params;
    const data = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, parseInt(challengeOptionId)),
    });

    if (!data) {
      return new NextResponse("Challenge option not found", { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[CHALLENGE_OPTION_GET]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { challengeOptionId: string } },
) => {
  try {
    // Await the isAdmin function since it's async
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    // Await params before accessing its properties
    const { challengeOptionId } = await params;
    
    // Ensure required fields are present
    if (!body.text) {
      return new NextResponse("Text is required", { status: 400 });
    }
    
    // Find current challenge option to ensure it exists
    const currentOption = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, parseInt(challengeOptionId))
    });

    if (!currentOption) {
      return new NextResponse("Challenge option not found", { status: 404 });
    }
    
    // Skip any date processing entirely and use the body directly
    // This avoids any potential toISOString errors
    
    // Update challenge option
    const data = await db.update(challengeOptions).set({
      text: body.text,
      correct: body.correct !== undefined ? body.correct : currentOption.correct,
      challengeId: body.challengeId || currentOption.challengeId,
      // Add other fields as needed
    }).where(eq(challengeOptions.id, parseInt(challengeOptionId))).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("[CHALLENGE_OPTION_PUT]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { challengeOptionId: string } },
) => {
  try {
    // Await the isAdmin function since it's async
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    // Await params before accessing its properties
    const { challengeOptionId } = await params;
    
    // Find current challenge option to ensure it exists
    const currentOption = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, parseInt(challengeOptionId))
    });

    if (!currentOption) {
      return new NextResponse("Challenge option not found", { status: 404 });
    }
    
    const data = await db.delete(challengeOptions)
      .where(eq(challengeOptions.id, parseInt(challengeOptionId))).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("[CHALLENGE_OPTION_DELETE]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
};
