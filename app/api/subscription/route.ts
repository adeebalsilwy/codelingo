import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/db/client";
import { eq } from "drizzle-orm";
import { userSubscription } from "@/db/schema";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API to check user subscription status
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("[SUBSCRIPTION_API] Unauthorized request - no user ID");
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          } 
        }
      );
    }
    
    console.log(`[SUBSCRIPTION_API] Checking subscription status for user: ${userId}`);

    // Query user subscription from database
    const subscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
    });

    // Determine if subscription is active
    let isActive = false;
    
    if (subscription) {
      // Check if subscription hasn't expired
      const currentPeriodEnd = subscription.stripeCurrentPeriodEnd;
      isActive = currentPeriodEnd ? new Date(currentPeriodEnd).getTime() > Date.now() : false;
      
      console.log(`[SUBSCRIPTION_API] User ${userId} subscription status: ${isActive ? 'active' : 'inactive'}, expires: ${currentPeriodEnd}`);
    } else {
      console.log(`[SUBSCRIPTION_API] No subscription found for user: ${userId}`);
    }

    // Add cache control headers to ensure fresh data
    return NextResponse.json(
      {
        isActive,
        subscription: subscription || null,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Date': new Date().toUTCString(),
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error("[SUBSCRIPTION_API] Error checking subscription:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: "Failed to check subscription status",
        message: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        }
      }
    );
  }
}

/**
 * Support for CORS preflight requests
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