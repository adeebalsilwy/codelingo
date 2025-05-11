import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/db/client";
import { isAdmin } from "@/lib/admin-server";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// الحصول على قائمة المسؤولين
export async function GET(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    
    if (!isUserAdmin) {
      return new NextResponse(
        JSON.stringify({ error: "غير مصرح" }),
        { status: 401 }
      );
    }

    const adminsList = await db.query.admins.findMany();
    
    return NextResponse.json(adminsList);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return new NextResponse(
      JSON.stringify({ error: "حدث خطأ في الخادم" }),
      { status: 500 }
    );
  }
}

// إضافة مسؤول جديد
export async function POST(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    
    if (!isUserAdmin) {
      return new NextResponse(
        JSON.stringify({ error: "غير مصرح" }),
        { status: 401 }
      );
    }

    const { userId } = await req.json();
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "معرف المستخدم مطلوب" }),
        { status: 400 }
      );
    }

    // التحقق من وجود المستخدم بالفعل
    const existingAdmin = await db.query.admins.findFirst({
      where: eq(admins.userId, userId),
    });

    if (existingAdmin) {
      return new NextResponse(
        JSON.stringify({ error: "هذا المستخدم مسؤول بالفعل" }),
        { status: 400 }
      );
    }

    // إضافة المستخدم كمسؤول
    const newAdmin = await db.insert(admins).values({
      id: randomUUID(),
      userId: userId,
    }).returning();

    return NextResponse.json(newAdmin[0]);
  } catch (error) {
    console.error("Error adding admin:", error);
    return new NextResponse(
      JSON.stringify({ error: "حدث خطأ في الخادم" }),
      { status: 500 }
    );
  }
}

// حذف مسؤول
export async function DELETE(req: Request) {
  try {
    const isUserAdmin = await isAdmin();
    
    if (!isUserAdmin) {
      return new NextResponse(
        JSON.stringify({ error: "غير مصرح" }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "معرف المستخدم مطلوب" }),
        { status: 400 }
      );
    }

    // حذف المسؤول
    await db.delete(admins).where(eq(admins.userId, userId));

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return new NextResponse(
      JSON.stringify({ error: "حدث خطأ في الخادم" }),
      { status: 500 }
    );
  }
} 