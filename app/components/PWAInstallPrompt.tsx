'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useI18n } from '@/app/i18n/client';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { dir } = useI18n();
  const isRtl = dir === 'rtl';

  useEffect(() => {
    // Check if the app is already installed
    const checkInstallState = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');

      if (isStandalone) {
        console.log('App is already installed');
        setIsVisible(false);
        return true;
      }
      return false;
    };

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('Received beforeinstallprompt event');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Don't show if already installed
      if (checkInstallState()) return;

      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setIsVisible(true);
    };

    // Initial check
    if (!checkInstallState()) {
      // Only add the event listener if the app isn't installed
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Handle iOS standalone mode
    if (
      navigator.userAgent.match(/iPhone|iPad|iPod/) &&
      !window.matchMedia('(display-mode: standalone)').matches
    ) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // For iOS devices, show a custom message
    if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
      alert(isRtl 
        ? 'لتثبيت التطبيق: اضغط على زر المشاركة ثم "إضافة إلى الشاشة الرئيسية"'
        : 'To install: tap the share button and then "Add to Home Screen"'
      );
      return;
    }

    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    } finally {
      // Clear the saved prompt as it can't be used again
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm border z-50",
      isRtl ? "right-4" : "left-4"
    )}>
      <h3 className="font-semibold mb-2">
        {isRtl ? 'تثبيت تطبيق كودلينجو' : 'Install CodeLingo App'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {isRtl 
          ? 'قم بتثبيت التطبيق على جهازك للوصول السريع والاستخدام بدون إنترنت.'
          : 'Install our app on your device for quick access and offline use.'
        }
      </p>
      <div className={cn("flex gap-2", isRtl ? "flex-row-reverse" : "")}>
        <Button onClick={handleInstallClick} className="gap-2">
          <Download className="h-4 w-4" />
          {isRtl ? 'تثبيت التطبيق' : 'Install App'}
        </Button>
        <Button variant="secondary" onClick={() => setIsVisible(false)}>
          {isRtl ? 'لاحقاً' : 'Later'}
        </Button>
      </div>
    </div>
  );
} 