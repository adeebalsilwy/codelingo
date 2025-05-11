import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import db from "@/db/client";
import { challenges } from "@/db/schema";
import { isAdmin } from "@/lib/admin-server";

export const GET = async (
  req: Request,
  { params }: { params: { challengeId: number } },
) => {
  // Await the isAdmin check
  if (!(await isAdmin())) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // Await params to ensure they are ready
  const challengeId = await params.challengeId;

  const data = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  return NextResponse.json(data);
};

export const PUT = async (
  req: Request,
  { params }: { params: { challengeId: number } },
) => {
  try {
    // Await the admin check
    if (!(await isAdmin())) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Await the request body
    const body = await req.json();
    
    // Handle date fields properly
    const sanitizedBody = Object.fromEntries(
      Object.entries(body).map(([key, value]) => {
        if (value instanceof Date) {
          return [key, value.toISOString()];
        }
        return [key, value];
      })
    );

    // Await params and perform the update
    const challengeId = await params.challengeId;
    const data = await db.update(challenges)
      .set(sanitizedBody)
      .where(eq(challenges.id, challengeId))
      .returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error updating challenge:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { challengeId: number } },
) => {
  // Await the isAdmin function since it's async
  if (!(await isAdmin())) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // Await params before accessing its properties
  const challengeId = await params.challengeId;
  const data = await db.delete(challenges)
    .where(eq(challenges.id, challengeId)).returning();

  return NextResponse.json(data[0]);
};
