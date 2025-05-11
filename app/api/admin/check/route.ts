import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/admin-server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Make sure to await the auth call
    const { userId } = await auth();
    
    // If no userId, return 401 Unauthorized with more helpful message
    if (!userId) {
      return NextResponse.json(
        { isAdmin: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check admin status
    const isAdmin = await checkIsAdmin(userId);
    
    // Return 200 OK with isAdmin status
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("[ADMIN_CHECK]", error);
    
    // If it's an authentication error, return 401
    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json(
        { isAdmin: false, error: "Authentication error" },
        { status: 401 }
      );
    }
    
    // For other errors, return 500 Internal Server Error
    return NextResponse.json(
      { isAdmin: false, error: "Failed to check admin status" },
      { status: 500 }
    );
  }
} 