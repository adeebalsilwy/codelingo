import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/admin-server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    const isAdmin = await checkIsAdmin(userId);
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("[ADMIN_CHECK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 