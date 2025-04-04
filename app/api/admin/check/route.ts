import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/admin-server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    // If no userId, return false immediately
    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }

    const isAdmin = await checkIsAdmin(userId);
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("[ADMIN_CHECK]", error);
    // Return JSON with isAdmin: false instead of text response
    return NextResponse.json(
      { isAdmin: false, error: "Failed to check admin status" },
      { status: 500 }
    );
  }
} 