'use client';

import React, { useEffect, useState } from 'react';
import { useI18n, Language } from '@/app/i18n/client';
import { requestNotificationPermission } from '@/app/utils/notifications';
import { Bell, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { language } = useI18n();
  const [notificationStep, setNotificationStep] = useState(1); // 1: initial, 2: benefits

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
    const lastAsked = localStorage.getItem('notificationLastAsked');
    
    if (!hasAskedBefore || (lastAsked && Date.now() - new Date(lastAsked).getTime() > 7 * 24 * 60 * 60 * 1000)) {
      // Show prompt after a short delay (if never asked before or if it's been more than 7 days)
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const sendWelcomeNotification = (language: Language) => {
    const title = language === 'ar' ? '🎉 أهلاً بك في مجتمع إيدو برو!' : '🎉 Welcome to Edu PRO community!';
    const body = language === 'ar' 
      ? 'شكراً لانضمامك! سنرسل لك إشعارات محفزة لمساعدتك على الاستمرار في التعلم'
      : 'Thank you for joining! We\'ll send you motivational notifications to help you stay on track';
    
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SEND_NOTIFICATION',
          title,
          options: {
            body,
            icon: '/logo1.jpg',
            badge: '/logo1.jpg',
            vibrate: [100, 50, 100, 150, 100],
            tag: 'welcome',
            actions: [
              {
                action: 'open',
                title: language === 'ar' ? 'بدء التعلم' : 'Start Learning'
              }
            ]
          }
        });
      } else {
        // Fallback if service worker is not available
        new Notification(title, {
          body,
          icon: '/logo1.jpg'
        });
      }

      // Schedule first periodic notification in 2 hours
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SET_NOTIFICATION_INTERVAL',
          hours: 2
        });
      }
    } catch (error) {
      console.error('Error sending welcome notification:', error);
    }
  };

  const handleAllow = async () => {
    setIsProcessing(true);
    try {
      const granted = await requestNotificationPermission();
      
      // Save that we've asked the user
      localStorage.setItem('notificationPromptShown', 'true');
      localStorage.setItem('notificationLastAsked', new Date().toISOString());
      localStorage.setItem('notificationPermission', granted ? 'granted' : 'denied');
      
      // If permission was granted, send a thank you notification
      if (granted) {
        sendWelcomeNotification(language);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsProcessing(false);
      setShowPrompt(false);
    }
  };

  const handleNextStep = () => {
    setNotificationStep(2);
  };

  const handleLater = () => {
    // Save that we've asked to prevent showing again soon
    localStorage.setItem('notificationPromptShown', 'true');
    localStorage.setItem('notificationLastAsked', new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.1 } }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" 
        onClick={handleLater}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={overlayVariants}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          variants={contentVariants}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="bg-primary/10 p-2 rounded-full">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white ms-3">
          {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
        </h3>
            </div>
          <button
            onClick={handleLater}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
              <X className="h-5 w-5" />
          </button>
          </div>

          {notificationStep === 1 ? (
            <>
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {language === 'ar' 
                    ? 'دعنا نساعدك في الحفاظ على حماسك للتعلم! سنرسل لك:'
                    : 'Let us help you stay motivated! We\'ll send you:'}
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <Heart className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0 mr-2" />
                    <span>{language === 'ar' ? 'تذكيرات ودية للعودة للتعلم' : 'Friendly reminders to continue learning'}</span>
                  </li>
                  <li className="flex items-start">
                    <Heart className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0 mr-2" />
                    <span>{language === 'ar' ? 'رسائل تحفيزية لتشجيعك على الاستمرار' : 'Motivational messages to keep you going'}</span>
                  </li>
                  <li className="flex items-start">
                    <Heart className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0 mr-2" />
                    <span>{language === 'ar' ? 'نصائح ومعلومات مفيدة لتحسين مهاراتك' : 'Tips and helpful information to improve your skills'}</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleNextStep}
                  className="w-full"
                  variant="default"
                >
                  {language === 'ar' ? 'أريد ذلك!' : 'I want this!'}
                </Button>
                <Button 
                  onClick={handleLater}
                  className="w-full"
                  variant="secondary"
                >
                  {language === 'ar' ? 'ليس الآن' : 'Not now'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {language === 'ar' 
                  ? 'لإرسال الإشعارات، نحتاج إذنك. سيطلب المتصفح موافقتك في الخطوة التالية.'
                  : 'To send notifications, we need your permission. Your browser will ask for confirmation in the next step.'}
              </p>
              <div className="flex flex-col gap-2">
                <Button 
            onClick={handleAllow}
                  className="w-full"
                  variant="default"
            disabled={isProcessing}
          >
            {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {language === 'ar' ? 'جاري التفعيل...' : 'Enabling...'}
              </span>
            ) : (
                    language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'
                  )}
                </Button>
                <Button 
                  onClick={handleLater}
                  className="w-full"
                  variant="secondary"
                  disabled={isProcessing}
                >
                  {language === 'ar' ? 'ربما لاحقاً' : 'Maybe later'}
                </Button>
        </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}; 