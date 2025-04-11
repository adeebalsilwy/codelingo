"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useTransition, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { POINTS_TO_REFILL } from "@/constants";
import { refillHearts } from "@/actions/user-progress";
import { createStripeUrl } from "@/actions/user-subscription";

type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

export const Items = ({
  hearts,
  points,
  hasActiveSubscription,
}: Props) => {
  const [pending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams();
  
  // Check for successful payment or cancellation
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');
  
  // Show toast messages for payment status
  if (success && sessionId && !isProcessing) {
    toast.success("Subscription successful! You now have unlimited hearts.");
  } else if (canceled && !isProcessing) {
    toast.error("Subscription was canceled. You can try again anytime.");
  }

  const onRefillHearts = () => {
    if (pending || hearts === 5 || points < POINTS_TO_REFILL) {
      return;
    }

    startTransition(() => {
      refillHearts()
        .then(() => {
          toast.success("Hearts refilled successfully!");
        })
        .catch(() => toast.error("Something went wrong while refilling hearts"));
    });
  };

  const onUpgrade = () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    toast.loading("Preparing subscription...");
    
    startTransition(() => {
      createStripeUrl()
        .then((response) => {
          if (response.data) {
            toast.success(response.message || "Redirecting to payment page...");
            window.location.href = response.data;
          } else {
            setIsProcessing(false);
            toast.error("Could not create subscription. Please try again.");
          }
        })
        .catch((error) => {
          setIsProcessing(false);
          toast.error(error.message || "Something went wrong with the subscription process");
          console.error("Subscription error:", error);
        });
    });
  };

  return (
    <ul className="w-full">
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image 
          src="/heart.svg"
          alt="Heart"
          height={60}
          width={60}
        />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Refill hearts
          </p>
        </div>
        <Button
          onClick={onRefillHearts}
          disabled={
            pending
            || hearts === 5 
            || points < POINTS_TO_REFILL
          }
        >
          {hearts === 5
            ? "full"
            : (
              <div className="flex items-center">
                <Image
                  src="/points.svg"
                  alt="Points"
                  height={20}
                  width={20}
                />
                <p>
                  {POINTS_TO_REFILL}
                </p>
              </div>
            )
          }
        </Button>
      </div>
      <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
        <Image
          src="/unlimited.svg"
          alt="Unlimited"
          height={60}
          width={60}
        />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Unlimited hearts
          </p>
          {hasActiveSubscription && (
            <p className="text-green-500 text-sm">
              Your subscription is active
            </p>
          )}
        </div>
        <Button
          onClick={onUpgrade}
          disabled={pending || isProcessing}
          variant={hasActiveSubscription ? "outline" : "default"}
        >
          {hasActiveSubscription ? "settings" : "upgrade"}
        </Button>
      </div>
    </ul>
  );
};
