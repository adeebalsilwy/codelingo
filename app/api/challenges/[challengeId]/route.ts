import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/client";
import { challenges } from "@/db/schema";
import { isAdmin } from "@/lib/admin-server";

export const GET = async (
  req: Request,
  { params }: { params: { challengeId: string } },
) => {
  // Await the isAdmin check
  if (!(await isAdmin())) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const challengeId = parseInt(params.challengeId, 10);
  if (isNaN(challengeId)) {
    return new NextResponse("Invalid challenge ID", { status: 400 });
  }

  const data = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: { challengeId: string } },
) => {
  try {
    // Await the admin check
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const challengeId = parseInt(params.challengeId, 10);
    if (isNaN(challengeId)) {
      return new NextResponse("Invalid challenge ID", { status: 400 });
    }

    // Await the request body
    const body = await req.json();
    
    // Handle date fields properly
    const sanitizedBody = {};
    
    for (const [key, value] of Object.entries(body)) {
      // Skip null or undefined values
      if (value === null || value === undefined) {
        sanitizedBody[key] = value;
        continue;
      }
      
      // Check if the value looks like a date string
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        try {
          sanitizedBody[key] = new Date(value);
        } catch (e) {
          sanitizedBody[key] = value;
        }
      } 
      // Handle non-date fields
      else {
        sanitizedBody[key] = value;
      }
    }

    // Perform the update
    const data = await db.update(challenges)
      .set(sanitizedBody)
      .where(eq(challenges.id, challengeId))
      .returning();

    if (!data || data.length === 0) {
      return new NextResponse("Challenge not found", { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error updating challenge:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { challengeId: string } },
) => {
  try {
    // Await the isAdmin function since it's async
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const challengeId = parseInt(params.challengeId, 10);
    if (isNaN(challengeId)) {
      return new NextResponse("Invalid challenge ID", { status: 400 });
    }
    
    const data = await db.delete(challenges)
      .where(eq(challenges.id, challengeId))
      .returning();

    if (!data || data.length === 0) {
      return new NextResponse("Challenge not found", { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
};
