'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/app/i18n/client';
import { requestNotificationPermission } from '@/app/utils/notifications';

export const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { language } = useI18n();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if notifications are supported
    if (!('Notification' in window)) return;

    // Check current permission status
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return;
    }

    // Check if we've asked before using localStorage
    const hasAskedBefore = localStorage.getItem('notificationPromptShown');
    if (!hasAskedBefore) {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    setIsProcessing(true);
    try {
      const granted = await requestNotificationPermission();
      
      // Save that we've asked the user
      localStorage.setItem('notificationPromptShown', 'true');
      localStorage.setItem('notificationPermission', granted ? 'granted' : 'denied');
      
      // If permission was granted, send a thank you notification
      if (granted) {
        const title = language === 'ar' ? 'شكراً لك!' : 'Thank you!';
        const body = language === 'ar' 
          ? 'سنرسل لك إشعارات مفيدة للحفاظ على مسار تعلمك'
          : 'We\'ll send you helpful notifications to keep your learning on track';
        
        new Notification(title, {
          body,
          icon: '/logo1.jpg'
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsProcessing(false);
      setShowPrompt(false);
    }
  };

  const handleLater = () => {
    // Save that we've asked to prevent showing again soon
    localStorage.setItem('notificationPromptShown', 'true');
    localStorage.setItem('notificationLastAsked', new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleLater}>
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {language === 'ar' 
            ? 'هل ترغب في تلقي إشعارات حول دروسك وتحديثات التطبيق؟ سيساعدك ذلك في البقاء على المسار الصحيح لتعلمك.'
            : 'Would you like to receive notifications about your lessons and app updates? This will help you stay on track with your learning.'}
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleLater}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            disabled={isProcessing}
          >
            {language === 'ar' ? 'لاحقاً' : 'Later'}
          </button>
          <button
            onClick={handleAllow}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {language === 'ar' ? 'جارٍ المعالجة...' : 'Processing...'}
              </span>
            ) : (
              language === 'ar' ? 'السماح' : 'Allow'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 