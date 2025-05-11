"use server";

import { auth, currentUser } from "@clerk/nextjs";

import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { getUserSubscription } from "@/db/queries";

const returnUrl = absoluteUrl("/shop");

export const createStripeUrl = async () => {
  try {
    console.log("[createStripeUrl] Starting subscription creation process");
    
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      console.error("[createStripeUrl] Authentication failed - no user found");
      throw new Error("Unauthorized - Please log in to continue");
    }

    // Get current user email
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      console.error("[createStripeUrl] User has no email address");
      throw new Error("No email address found for user");
    }
    
    console.log(`[createStripeUrl] Processing for user: ${userId}, email: ${email}`);
    
    // Check if user already has a subscription
    const userSubscription = await getUserSubscription();
    console.log(`[createStripeUrl] Existing subscription status:`, 
      userSubscription ? 
      `CustomerId: ${userSubscription.stripeCustomerId}, Active: ${userSubscription.isActive}` : 
      "No subscription"
    );

    // If user has a Stripe customer ID, redirect to billing portal
    if (userSubscription && userSubscription.stripeCustomerId) {
      console.log(`[createStripeUrl] Redirecting to billing portal for existing customer: ${userSubscription.stripeCustomerId}`);
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: returnUrl,
      });

      return { data: stripeSession.url, message: "Redirecting to billing portal" };
    }

    // Get customer name for better identification
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : (user.firstName || email.split('@')[0]);

    // Create a new checkout session for new subscribers
    console.log(`[createStripeUrl] Creating new checkout session for: ${userId} (${fullName})`);
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          userId,
          userEmail: email,
        },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "USD",
            product_data: {
              name: "EDU-PRO Premium",
              description: "Unlimited Hearts and Premium Features",
              metadata: {
                userId,
              },
            },
            unit_amount: 2000, // $20.00 USD
            recurring: {
              interval: "month",
            },
          },
        },
      ],
      metadata: {
        userId,
        userEmail: email,
        userName: fullName,
      },
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
    });

    console.log(`[createStripeUrl] Successfully created checkout session: ${stripeSession.id}`);
    return { data: stripeSession.url, message: "Redirecting to checkout" };
  } catch (error) {
    console.error("[createStripeUrl] Error creating Stripe session:", error);
    
    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('api_key')) {
        throw new Error("Payment service configuration error. Please contact support.");
      }
      
      if (error.message.includes('customer')) {
        throw new Error("Customer account error. Please try again or contact support.");
      }
      
      throw new Error(`Payment service error: ${error.message}`);
    }
    
    throw new Error("An unexpected error occurred during payment setup. Please try again.");
  }
};
