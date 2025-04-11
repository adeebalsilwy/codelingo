"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useTransition, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/app/i18n/client";

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
  const { language } = useI18n();
  const isArabic = language === 'ar';
  const [pending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionPending, setSubscriptionPending] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const searchParams = useSearchParams();
  
  // Check for successful payment or cancellation
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');
  
  // Poll subscription status to verify it was created properly
  const pollSubscriptionStatus = useCallback(async () => {
    if (!sessionId || hasActiveSubscription) return;
    
    try {
      // Increase poll count to limit number of attempts
      setPollCount(prev => prev + 1);
      
      // Check subscription status via API
      const response = await fetch('/api/subscription?' + new URLSearchParams({
        _t: Date.now().toString() // Cache buster
      }));
      
      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }
      
      const data = await response.json();
      
      if (data.isActive) {
        // Subscription is active, stop polling and reload
        toast.success(isArabic ? "تم التحقق من الاشتراك! لديك الآن قلوب غير محدودة." : "Subscription verified! You now have unlimited hearts.");
        setSubscriptionPending(false);
        setTimeout(() => {
          window.location.href = '/shop'; // Remove query params
        }, 1000);
        return;
      }
      
      // If we've tried 8 times (40 seconds) and still no subscription, show error
      if (pollCount >= 8) {
        toast.error(isArabic ? "انتهت مهلة التحقق من الاشتراك. يرجى تحديث الصفحة أو الاتصال بالدعم." : "Subscription verification timed out. Please refresh or contact support.");
        setSubscriptionPending(false);
        return;
      }
      
      // Continue polling every 5 seconds
      setTimeout(pollSubscriptionStatus, 5000);
    } catch (error) {
      console.error('Error polling subscription status:', error);
      
      // If we've tried 8 times and still erroring, stop
      if (pollCount >= 8) {
        toast.error(isArabic ? "فشل التحقق من الاشتراك. يرجى تحديث الصفحة أو الاتصال بالدعم." : "Subscription verification failed. Please refresh or contact support.");
        setSubscriptionPending(false);
      } else {
        // Otherwise keep trying
        setTimeout(pollSubscriptionStatus, 5000);
      }
    }
  }, [sessionId, hasActiveSubscription, pollCount, isArabic]);
  
  // Process successful payment redirect
  useEffect(() => {
    if (success && sessionId && !isProcessing && !subscriptionPending && !hasActiveSubscription) {
      setIsProcessing(true);
      setSubscriptionPending(true);
      
      // Show initial success message
      toast.success(isArabic ? "تمت عملية الدفع بنجاح! جاري التحقق من اشتراكك..." : "Payment successful! Verifying your subscription...");
      
      // Start polling after a short delay to allow webhook to process
      setTimeout(() => {
        pollSubscriptionStatus();
      }, 3000);
    }
  }, [success, sessionId, isProcessing, subscriptionPending, hasActiveSubscription, pollSubscriptionStatus, isArabic]);
  
  // Handle cancellation
  useEffect(() => {
    if (canceled && !isProcessing) {
      toast.error(isArabic ? "تم إلغاء الاشتراك. يمكنك المحاولة مرة أخرى في أي وقت." : "Subscription was canceled. You can try again anytime.");
    }
  }, [canceled, isProcessing, isArabic]);

  const onRefillHearts = () => {
    if (pending || hearts === 5 || points < POINTS_TO_REFILL) {
      return;
    }

    startTransition(() => {
      refillHearts()
        .then(() => {
          toast.success(isArabic ? "تم إعادة تعبئة القلوب بنجاح!" : "Hearts refilled successfully!");
        })
        .catch(() => toast.error(isArabic ? "حدث خطأ أثناء إعادة تعبئة القلوب" : "Something went wrong while refilling hearts"));
    });
  };

  const onUpgrade = () => {
    if (isProcessing || subscriptionPending) return;
    
    setIsProcessing(true);
    toast.loading(isArabic ? "جاري تجهيز الاشتراك..." : "Preparing subscription...");
    
    startTransition(() => {
      createStripeUrl()
        .then((response) => {
          if (response.data) {
            toast.success(response.message || (isArabic ? "جاري التحويل إلى صفحة الدفع..." : "Redirecting to payment page..."));
            window.location.href = response.data;
          } else {
            setIsProcessing(false);
            toast.error(isArabic ? "تعذر إنشاء الاشتراك. يرجى المحاولة مرة أخرى." : "Could not create subscription. Please try again.");
          }
        })
        .catch((error) => {
          setIsProcessing(false);
          toast.error(error.message || (isArabic ? "حدث خطأ أثناء عملية الاشتراك" : "Something went wrong with the subscription process"));
          console.error("Subscription error:", error);
        });
    });
  };

  return (
    <ul className="w-full" dir={isArabic ? "rtl" : "ltr"}>
      {subscriptionPending && (
        <div className="w-full p-4 mb-4 rounded-md bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-x-2 text-blue-700">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>{isArabic ? "جاري معالجة اشتراكك. قد يستغرق ذلك دقيقة..." : "Processing your subscription. This could take a minute..."}</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image 
          src="/heart.svg"
          alt={isArabic ? "قلب" : "Heart"}
          height={60}
          width={60}
        />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            {isArabic ? "القلوب الحالية" : "Current Hearts"}
          </p>
          <p className="text-neutral-500 text-sm">
            {isArabic ? `لديك ${hearts}/5 قلوب` : `You have ${hearts}/5 hearts`}
          </p>
        </div>
        {hearts < 5 && (
          <Button
            onClick={onRefillHearts}
            disabled={pending || points < POINTS_TO_REFILL || subscriptionPending}
            variant="default"
          >
            {isArabic ? "إعادة تعبئة" : "Refill"}
          </Button>
        )}
        {hearts === 5 && (
          <span className="px-3 py-1.5 text-sm font-medium text-green-800 bg-green-100 rounded-md">
            {isArabic ? "كامل" : "Full"}
          </span>
        )}
      </div>

      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image 
          src="/points.svg"
          alt={isArabic ? "نقاط" : "Points"}
          height={60}
          width={60}
        />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            {isArabic ? "تحويل النقاط إلى قلوب" : "Convert Points to Hearts"}
          </p>
          <p className="text-neutral-500 text-sm">
            {isArabic 
              ? `${points} نقطة متاحة • ${POINTS_TO_REFILL} نقطة = 5 قلوب` 
              : `${points} points available • ${POINTS_TO_REFILL} points = 5 hearts`}
          </p>
        </div>
        <Button
          onClick={onRefillHearts}
          disabled={
            pending
            || hearts === 5 
            || points < POINTS_TO_REFILL
            || subscriptionPending
          }
          variant="sidebarOutline"
        >
          {hearts === 5
            ? (isArabic ? "القلوب مكتملة" : "Hearts Full")
            : (
              <div className="flex items-center gap-x-2">
                <Image
                  src="/points.svg"
                  alt={isArabic ? "نقاط" : "Points"}
                  height={16}
                  width={16}
                />
                <p>
                  {isArabic ? `استخدم ${POINTS_TO_REFILL} نقطة` : `Use ${POINTS_TO_REFILL} Points`}
                </p>
              </div>
            )
          }
        </Button>
      </div>

      <div className="flex items-center w-full p-4 pt-6 gap-x-4 border-t-2">
        <Image
          src="/unlimited.svg"
          alt={isArabic ? "غير محدود" : "Unlimited"}
          height={60}
          width={60}
        />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            {isArabic ? "قلوب غير محدودة" : "Unlimited hearts"}
          </p>
          {hasActiveSubscription && (
            <p className="text-green-500 text-sm">
              {isArabic ? "اشتراكك نشط" : "Your subscription is active"}
            </p>
          )}
          {subscriptionPending && (
            <p className="text-blue-500 text-sm animate-pulse">
              {isArabic ? "جاري معالجة الاشتراك..." : "Subscription processing..."}
            </p>
          )}
        </div>
        <Button
          onClick={onUpgrade}
          disabled={pending || isProcessing || subscriptionPending}
          variant={hasActiveSubscription ? "sidebarOutline" : "default"}
        >
          {hasActiveSubscription ? (isArabic ? "الإعدادات" : "settings") : (isArabic ? "ترقية" : "upgrade")}
        </Button>
      </div>
    </ul>
  );
};
