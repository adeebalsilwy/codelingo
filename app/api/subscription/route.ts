import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/db/client";
import { eq } from "drizzle-orm";
import { userSubscription } from "@/db/schema";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API للتحقق من حالة اشتراك المستخدم
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // التحقق من اشتراك المستخدم في قاعدة البيانات
    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
    });

    // تحديد ما إذا كان الاشتراك نشطًا
    let isActive = false;
    
    if (subscription) {
      // التحقق من أن الاشتراك غير منتهي
      const currentPeriodEnd = subscription.stripeCurrentPeriodEnd;
      isActive = currentPeriodEnd ? new Date(currentPeriodEnd).getTime() > Date.now() : false;
    }

    return NextResponse.json({
      isActive,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error("[SUBSCRIPTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * دعم CORS لاستدعاءات مسبقة
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 