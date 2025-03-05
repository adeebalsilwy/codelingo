'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/app/i18n/client';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t, language } = useI18n();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
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

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mx-auto max-w-md z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {language === 'ar' ? 'تثبيت كودينجو' : 'Install CodeLingo'}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {language === 'ar' 
              ? 'قم بتثبيت تطبيق كودينجو للوصول السريع وتجربة أفضل'
              : 'Install CodeLingo for quick access and better experience'
            }
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={handleDismiss}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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