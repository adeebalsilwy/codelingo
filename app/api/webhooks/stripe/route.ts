import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import db from "@/db/client";
import { stripe } from "@/lib/stripe";
import { userSubscription } from "@/db/schema";

// Add runtime directive to ensure webhook handler runs properly
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to create or update subscription
const upsertSubscription = async (userId: string, subscriptionData: {
  subscriptionId: string;
  customerId: string;
  priceId: string;
  periodEnd: number;
}) => {
  try {
    // Check if subscription exists for this user
    const existingSubscription = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
    });

    if (existingSubscription) {
      // Update existing subscription
      console.log(`[STRIPE_WEBHOOK] Updating existing subscription for user: ${userId}`);
      await db.update(userSubscription)
        .set({
          stripeSubscriptionId: subscriptionData.subscriptionId,
          stripeCustomerId: subscriptionData.customerId,
          stripePriceId: subscriptionData.priceId,
          stripeCurrentPeriodEnd: new Date(subscriptionData.periodEnd * 1000),
        })
        .where(eq(userSubscription.userId, userId));
    } else {
      // Create new subscription
      console.log(`[STRIPE_WEBHOOK] Creating new subscription for user: ${userId}`);
      await db.insert(userSubscription).values({
        userId: userId,
        stripeSubscriptionId: subscriptionData.subscriptionId,
        stripeCustomerId: subscriptionData.customerId,
        stripePriceId: subscriptionData.priceId,
        stripeCurrentPeriodEnd: new Date(subscriptionData.periodEnd * 1000),
      });
    }
    return true;
  } catch (error) {
    console.error(`[STRIPE_WEBHOOK] Database error while upserting subscription:`, error);
    return false;
  }
};

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

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[STRIPE_WEBHOOK] Processing checkout.session.completed for user: ${session.metadata?.userId}`);
      
      if (!session?.subscription) {
        console.error("[STRIPE_WEBHOOK] Missing subscription ID in session");
        return new NextResponse("Subscription ID is required", { status: 400 });
      }

      if (!session?.metadata?.userId) {
        console.error("[STRIPE_WEBHOOK] Missing userId in session metadata");
        return new NextResponse("User ID is required", { status: 400 });
      }

      try {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const success = await upsertSubscription(session.metadata.userId, {
          subscriptionId: subscription.id,
          customerId: subscription.customer as string,
          priceId: subscription.items.data[0].price.id,
          periodEnd: subscription.current_period_end,
        });

        if (!success) {
          return new NextResponse("Failed to update database", { status: 500 });
        }
        
        console.log(`[STRIPE_WEBHOOK] Successfully processed checkout session for user: ${session.metadata.userId}`);
      } catch (error) {
        console.error('[STRIPE_WEBHOOK] Error retrieving subscription:', error);
        return new NextResponse("Error retrieving subscription details", { status: 500 });
      }
    }

    // Handle invoice.payment_succeeded
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("[STRIPE_WEBHOOK] Processing invoice.payment_succeeded");
      
      // Make sure we're handling a subscription invoice
      if (!invoice.subscription) {
        console.log("[STRIPE_WEBHOOK] Not a subscription invoice, skipping");
        return new NextResponse(null, { status: 200 });
      }
      
      try {
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        
        // Get customer ID from the invoice
        const customerId = invoice.customer as string;
        console.log(`[STRIPE_WEBHOOK] Updating subscription for customer: ${customerId}`);
        
        // Find user ID for this customer
        const existingSub = await db.query.userSubscription.findFirst({
          where: eq(userSubscription.stripeCustomerId, customerId)
        });
        
        if (!existingSub) {
          console.error(`[STRIPE_WEBHOOK] No subscription found for customer: ${customerId}`);
          return new NextResponse("Subscription not found", { status: 404 });
        }
        
        const success = await upsertSubscription(existingSub.userId, {
          subscriptionId: subscription.id,
          customerId: customerId,
          priceId: subscription.items.data[0].price.id,
          periodEnd: subscription.current_period_end,
        });

        if (!success) {
          return new NextResponse("Failed to update database", { status: 500 });
        }
        
        console.log(`[STRIPE_WEBHOOK] Successfully updated subscription for user: ${existingSub.userId}`);
      } catch (error) {
        console.error('[STRIPE_WEBHOOK] Error processing invoice payment:', error);
        return new NextResponse("Error processing invoice payment", { status: 500 });
      }
    }

    // Handle customer.subscription.updated
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`[STRIPE_WEBHOOK] Processing subscription update: ${subscription.id}`);
      
      try {
        const customerId = subscription.customer as string;
        
        // Find user ID for this customer
        const existingSub = await db.query.userSubscription.findFirst({
          where: eq(userSubscription.stripeCustomerId, customerId)
        });
        
        if (!existingSub) {
          console.error(`[STRIPE_WEBHOOK] No subscription found for customer: ${customerId}`);
          return new NextResponse("Subscription not found", { status: 404 });
        }
        
        await db.update(userSubscription)
          .set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where(eq(userSubscription.stripeCustomerId, customerId));
        
        console.log(`[STRIPE_WEBHOOK] Successfully updated subscription period for user: ${existingSub.userId}`);
      } catch (error) {
        console.error('[STRIPE_WEBHOOK] Error updating subscription:', error);
        return new NextResponse("Error updating subscription", { status: 500 });
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK] Unhandled error:", error);
    return new NextResponse(`Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`, { 
      status: 500 
    });
  }
};
