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

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install button
      setIsVisible(true);
    };

    // Check if the app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isAppInstalled) {
      setIsVisible(false);
    } else {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the saved prompt as it can't be used again
    setDeferredPrompt(null);
    setIsVisible(false);
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