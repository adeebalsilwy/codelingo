import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getCourses } from "@/db/queries";

export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

// Add OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Total-Count',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET() {
  try {
    // Authentication - fix for sync issues
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courses = await getCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error("[COURSES_LIST]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 