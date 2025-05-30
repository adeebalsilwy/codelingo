import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import db from "@/db/client";
import { eq } from "drizzle-orm";
import { userSubscription } from "@/db/schema";

// Force dynamic to avoid caching
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * API to check user subscription status for debugging
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("[DEBUG_SUBSCRIPTION] Unauthorized request - no user ID");
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          } 
        }
      );
    }
    
    console.log(`[DEBUG_SUBSCRIPTION] Checking subscription status for user: ${userId}`);

    // Query all user subscriptions
    const subscriptions = await db.query.userSubscription.findMany({});
    console.log(`[DEBUG_SUBSCRIPTION] Found ${subscriptions.length} total subscriptions in database`);

    // Query user subscription from database
    const userSub = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
    });

    // Determine if subscription is active
    let isActive = false;
    
    if (userSub) {
      // Check if subscription hasn't expired
      const currentPeriodEnd = userSub.stripeCurrentPeriodEnd;
      isActive = currentPeriodEnd ? new Date(currentPeriodEnd).getTime() > Date.now() : false;
      
      console.log(`[DEBUG_SUBSCRIPTION] User ${userId} subscription data:`, {
        status: isActive ? 'active' : 'inactive',
        expires: currentPeriodEnd,
        subscriptionId: userSub.stripeSubscriptionId,
        customerId: userSub.stripeCustomerId
      });
    } else {
      console.log(`[DEBUG_SUBSCRIPTION] No subscription found for user: ${userId}`);
    }

    return NextResponse.json(
      {
        isActive,
        subscription: userSub || null,
        allSubscriptions: subscriptions,
        message: userSub ? "Subscription found" : "No subscription found",
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate, max-age=0',
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error("[DEBUG_SUBSCRIPTION] Error checking subscription:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: "Failed to check subscription status",
        message: errorMessage 
      }, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 