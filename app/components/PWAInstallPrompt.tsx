'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/app/i18n/client';
import { useTheme } from 'next-themes';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { t, language } = useI18n();
  const { theme } = useTheme();

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    // Handle PWA install
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsVisible(false);
    }

    // Handle service worker updates
    const handleUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('serviceWorkerUpdateAvailable', handleUpdate);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('serviceWorkerUpdateAvailable', handleUpdate);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    
    if (result.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    setUpdateAvailable(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible && !updateAvailable) return null;

  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-background border border-border rounded-lg shadow-lg p-4 mx-auto max-w-md z-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              {language === 'ar' ? 'تحديث متوفر' : 'Update Available'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === 'ar' 
                ? 'يوجد تحديث جديد للتطبيق. يرجى التحديث للحصول على أحدث الميزات والإصلاحات.'
                : 'A new update is available for the app. Please update to get the latest features and fixes.'
              }
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setUpdateAvailable(false)}
            className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {language === 'ar' ? 'لاحقاً' : 'Later'}
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {language === 'ar' ? 'تحديث الآن' : 'Update Now'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-background border border-border rounded-lg shadow-lg p-4 mx-auto max-w-md z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {language === 'ar' ? 'تثبيت إيدو برو' : 'Install Edu PRO'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === 'ar' 
              ? 'قم بتثبيت تطبيق إيدو برو للوصول السريع وتجربة أفضل'
              : 'Install Edu PRO for quick access and better experience'
            }
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={handleDismiss}
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {language === 'ar' ? 'لاحقاً' : 'Later'}
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {language === 'ar' ? 'تثبيت' : 'Install'}
        </button>
      </div>
    </div>
  );
};