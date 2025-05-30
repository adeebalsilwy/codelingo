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
    // Check admin access
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const challengeOptionId = parseInt(params.challengeOptionId, 10);
    if (isNaN(challengeOptionId)) {
      return new NextResponse("Invalid challenge option ID", { status: 400 });
    }

    const data = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, challengeOptionId),
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
    // Check admin access
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const challengeOptionId = parseInt(params.challengeOptionId, 10);
    if (isNaN(challengeOptionId)) {
      return new NextResponse("Invalid challenge option ID", { status: 400 });
    }

    const body = await req.json();
    
    // Ensure required fields are present
    if (!body.text) {
      return new NextResponse("Text is required", { status: 400 });
    }
    
    // Find current challenge option to ensure it exists
    const currentOption = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, challengeOptionId)
    });

    if (!currentOption) {
      return new NextResponse("Challenge option not found", { status: 404 });
    }
    
    // Update challenge option
    const data = await db.update(challengeOptions).set({
      text: body.text,
      correct: body.correct !== undefined ? body.correct : currentOption.correct,
      challengeId: body.challengeId || currentOption.challengeId,
      // Add other fields as needed
    }).where(eq(challengeOptions.id, challengeOptionId)).returning();

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
    // Check admin access
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const challengeOptionId = parseInt(params.challengeOptionId, 10);
    if (isNaN(challengeOptionId)) {
      return new NextResponse("Invalid challenge option ID", { status: 400 });
    }
    
    // Find current challenge option to ensure it exists
    const currentOption = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, challengeOptionId)
    });

    if (!currentOption) {
      return new NextResponse("Challenge option not found", { status: 404 });
    }
    
    const data = await db.delete(challengeOptions)
      .where(eq(challengeOptions.id, challengeOptionId)).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("[CHALLENGE_OPTION_DELETE]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
};
