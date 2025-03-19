import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const { userId } = auth();
    const adminStatus = await checkIsAdmin(userId);
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
} 