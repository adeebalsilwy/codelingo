import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import db from "@/db/client";
import { stripe } from "@/lib/stripe";
import { userSubscription } from "@/db/schema";

// Add runtime directive to ensure webhook handler runs properly
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    console.log("[STRIPE_WEBHOOK] Received webhook event");
    
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    if (!signature) {
      console.error("[STRIPE_WEBHOOK] Missing Stripe signature");
      return new NextResponse("Webhook Error: Missing Stripe signature", { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
      console.log(`[STRIPE_WEBHOOK] Event verified: ${event.type}`);
    } catch(error: any) {
      console.error(`[STRIPE_WEBHOOK] Error verifying webhook:`, error);
      return new NextResponse(`Webhook error: ${error.message}`, {
        status: 400,
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
      console.log(`[STRIPE_WEBHOOK] Processing checkout.session.completed for user: ${session.metadata?.userId}`);
      
      if (!session?.subscription) {
        console.error("[STRIPE_WEBHOOK] Missing subscription ID in session");
        return new NextResponse("Subscription ID is required", { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      if (!session?.metadata?.userId) {
        console.error("[STRIPE_WEBHOOK] Missing userId in session metadata");
        return new NextResponse("User ID is required", { status: 400 });
      }

      // Check if a subscription record already exists for this user
      const existingSubscription = await db.query.userSubscription.findFirst({
        where: eq(userSubscription.userId, session.metadata.userId),
      });

      if (existingSubscription) {
        // Update existing subscription
        console.log(`[STRIPE_WEBHOOK] Updating existing subscription for user: ${session.metadata.userId}`);
        await db.update(userSubscription)
          .set({
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ),
          })
          .where(eq(userSubscription.userId, session.metadata.userId));
      } else {
        // Create new subscription
        console.log(`[STRIPE_WEBHOOK] Creating new subscription for user: ${session.metadata.userId}`);
        await db.insert(userSubscription).values({
          userId: session.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
        });
      }
      
      console.log(`[STRIPE_WEBHOOK] Successfully processed subscription for user: ${session.metadata.userId}`);
    }

    if (event.type === "invoice.payment_succeeded") {
      console.log("[STRIPE_WEBHOOK] Processing invoice.payment_succeeded");
      
      if (!session?.subscription) {
        console.error("[STRIPE_WEBHOOK] Missing subscription ID in invoice session");
        return new NextResponse("Subscription ID is required", { status: 400 });
      }
      
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      
      console.log(`[STRIPE_WEBHOOK] Updating subscription: ${subscription.id}`);
      
      // First find the subscription to make sure it exists
      const existingSub = await db.query.userSubscription.findFirst({
        where: eq(userSubscription.stripeSubscriptionId, subscription.id)
      });
      
      if (!existingSub) {
        console.error(`[STRIPE_WEBHOOK] No subscription found with ID: ${subscription.id}`);
        return new NextResponse("Subscription not found", { status: 404 });
      }
      
      await db.update(userSubscription)
        .set({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
        })
        .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
      
      console.log(`[STRIPE_WEBHOOK] Successfully updated subscription: ${subscription.id}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK] Unhandled error:", error);
    return new NextResponse(`Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`, { 
      status: 500 
    });
  }
};
