import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/admin-server";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { userId } = auth();
    const isAdmin = await checkIsAdmin(userId);
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Error in admin check route:", error);
    return NextResponse.json({ isAdmin: false });
  }
} 