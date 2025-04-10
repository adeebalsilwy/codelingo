'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/app/i18n/client';
import { usePathname } from 'next/navigation';

// Extend the window interface to include our app permissions
declare global {
  interface Window {
    appPermissions?: {
      checkPermission: (permission: string) => Promise<string>;
      requestPermission: (permission: string) => Promise<boolean>;
      permissions: Record<string, { status: string, requested: boolean }>;
      checkConnectivity: () => Promise<boolean>;
      sendNotification: (options: any) => Promise<boolean>;
      scheduleNotification: (options: any, delay: number) => Promise<boolean>;
      setNotificationInterval: (hours: number) => Promise<boolean>;
      sendMessageToSW: (message: any) => Promise<any>;
    };
  }
}

/**
 * Component for managing automatic notifications
 * This component doesn't render anything visible
 * It handles the logic for scheduling periodic notifications
 * and responding to user activity to provide motivational messages
 */
export const AutoNotifications = () => {
  const { language } = useI18n();
  const pathname = usePathname();
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [appStartTime] = useState<Date>(new Date());
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean | null>(null);
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    const checkPermission = () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      
      const permission = Notification.permission;
      setHasNotificationPermission(permission === 'granted');
    };
    
    checkPermission();
  }, []);

  // Send user interaction to service worker
  const notifyServiceWorkerOfActivity = () => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
    
    navigator.serviceWorker.controller.postMessage({
      type: 'USER_INTERACTION',
      timestamp: Date.now()
    });
  };

  // Record user activity for inactivity notifications
  useEffect(() => {
    const recordActivity = () => {
      const now = new Date();
      setLastActivity(now);
      
      // Notify service worker
      notifyServiceWorkerOfActivity();
      
      // Clear any existing inactivity timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      // Set a new inactivity timer (3 hours)
      const newTimer = setTimeout(() => {
        if (hasNotificationPermission && window.appPermissions) {
          // Send inactivity notification after 3 hours
          const hoursSinceLastActivity = (Date.now() - now.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceLastActivity >= 3) {
            const title = language === 'ar' 
              ? '👋 هل أنت هناك؟' 
              : '👋 Are you there?';
            
            const body = language === 'ar'
              ? 'لقد مر بعض الوقت منذ آخر نشاط لك. هل تريد العودة للتعلم؟'
              : 'It\'s been a while since your last activity. Want to get back to learning?';
            
            window.appPermissions.sendNotification({
              title,
              body,
              tag: 'inactivity',
              data: {
                url: '/courses'
              }
            });
          }
        }
      }, 3 * 60 * 60 * 1000); // 3 hours
      
      setInactivityTimer(newTimer);
    };
    
    // Record activity on these events
    const events = ['mousedown', 'mousemove', 'keypress', 'touchstart', 'scroll', 'click'];
    events.forEach(event => {
      window.addEventListener(event, recordActivity, { passive: true });
    });
    
    // Record initial activity
    recordActivity();
    
    // Setup a periodic activity check (every 15 minutes)
    const periodicCheck = setInterval(() => {
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - lastActivity.getTime();
        
        // If we've detected a period of inactivity (15+ minutes), notify service worker
        if (timeSinceLastActivity > 15 * 60 * 1000) {
          console.log('Detected inactivity period of', Math.round(timeSinceLastActivity / (1000 * 60)), 'minutes');
          
          // Notify the service worker about this inactivity period
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'INACTIVITY_PERIOD',
              duration: timeSinceLastActivity,
              timestamp: Date.now()
            });
          }
        }
      }
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, recordActivity);
      });
      
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      
      clearInterval(periodicCheck);
    };
  }, [hasNotificationPermission, inactivityTimer, language, lastActivity]);

  // Monitor page visits to send contextual notifications
  useEffect(() => {
    if (!hasNotificationPermission || !pathname) return;
    
    const visitsHistory = localStorage.getItem('visitsHistory');
    let history: Record<string, number> = {};
    
    if (visitsHistory) {
      try {
        history = JSON.parse(visitsHistory);
      } catch (e) {
        console.error('Error parsing visits history:', e);
      }
    }
    
    // Update history
    history[pathname] = (history[pathname] || 0) + 1;
    localStorage.setItem('visitsHistory', JSON.stringify(history));
    
    // Check if user is returning to courses after long time
    const isCoursePage = pathname.includes('/courses');
    const lastLearnSession = localStorage.getItem('lastLearnSession');
    
    if (isCoursePage && lastLearnSession) {
      const lastTime = new Date(lastLearnSession);
      const now = new Date();
      const hoursSinceLastLearn = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
      
      // If returning after more than 48 hours, send a welcome back notification
      if (hoursSinceLastLearn > 48) {
        sendWelcomeBackNotification();
      }
    }
    
    // Record learning session time
    if (pathname.includes('/learn')) {
      localStorage.setItem('lastLearnSession', new Date().toISOString());
    }
  }, [pathname, hasNotificationPermission, language]);

  // Setup occasional motivational notifications based on user settings
  useEffect(() => {
    if (!hasNotificationPermission) return;
    
    // Set initial notification interval (defaults to 12 hours)
    const initializeNotificationInterval = () => {
      if (window.appPermissions) {
        // Try to get user preference from localStorage
        const preferredInterval = localStorage.getItem('notificationInterval');
        const hours = preferredInterval ? parseInt(preferredInterval, 10) : 12;
        
        window.appPermissions.setNotificationInterval(hours);
        
        console.log(`Initialized notification interval to ${hours} hours`);
      }
    };
    
    // Try to initialize immediately if service worker is ready
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      initializeNotificationInterval();
    } else {
      // Otherwise wait for service worker to be ready
      const readyCheck = setInterval(() => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          initializeNotificationInterval();
          clearInterval(readyCheck);
        }
      }, 1000);
      
      // Cleanup
      return () => clearInterval(readyCheck);
    }
    
    // Set up a listener for notification clicks
    const handleNotificationMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        // Record that the user engaged with a notification
        localStorage.setItem('lastNotificationEngagement', new Date().toISOString());
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleNotificationMessage);
    
    // Sync notification interval when app is loaded
    const syncNotificationSettings = () => {
      // Get user preference
      const preferredInterval = localStorage.getItem('notificationInterval');
      
      if (preferredInterval && window.appPermissions) {
        const hours = parseInt(preferredInterval, 10);
        window.appPermissions.setNotificationInterval(hours);
      }
    };
    
    // Sync notification interval when user comes back to the app
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncNotificationSettings();
        notifyServiceWorkerOfActivity();
      }
    });
    
    // Sync on window focus
    window.addEventListener('focus', () => {
      syncNotificationSettings();
      notifyServiceWorkerOfActivity();
    });
    
    // Cleanup
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleNotificationMessage);
      document.removeEventListener('visibilitychange', syncNotificationSettings);
      window.removeEventListener('focus', syncNotificationSettings);
    };
  }, [hasNotificationPermission]);

  // Send notification when user completes a section after struggling
  useEffect(() => {
    if (!hasNotificationPermission) return;
    
    const handleCourseComplete = (event: any) => {
      if (!event.detail) return;
      
      const { courseId, attempts, timeSpent } = event.detail;
      
      // If user spent significant time or had multiple attempts, send encouragement
      if (attempts > 3 || timeSpent > 600) { // 10 minutes
        sendEncouragementNotification();
      }
    };
    
    document.addEventListener('courseComplete', handleCourseComplete);
    
    return () => {
      document.removeEventListener('courseComplete', handleCourseComplete);
    };
  }, [hasNotificationPermission, language]);

  /**
   * Send a welcome back notification
   */
  const sendWelcomeBackNotification = () => {
    if (!window.appPermissions) return;
    
    const title = language === 'ar' 
      ? '👋 أهلاً بعودتك!' 
      : '👋 Welcome back!';
    
    const body = language === 'ar'
      ? 'لقد افتقدناك! هل أنت مستعد لمواصلة رحلة التعلم؟'
      : 'We missed you! Ready to continue your learning journey?';
    
    window.appPermissions.sendNotification({
      title,
      body,
      tag: 'welcome-back',
      data: {
        url: '/courses'
      }
    });
  };

  /**
   * Send an encouragement notification after completing a difficult section
   */
  const sendEncouragementNotification = () => {
    if (!window.appPermissions) return;
    
    const encouragements = language === 'ar' 
      ? [
          {
            title: '🎉 أحسنت! أنت تتقدم بشكل رائع',
            body: 'استمر في العمل الجيد، المثابرة هي مفتاح النجاح!'
          },
          {
            title: '💪 عمل ممتاز!',
            body: 'تخطيت تحديًا صعبًا. أنت أقرب إلى هدفك الآن!'
          },
          {
            title: '🌟 رائع جدًا!',
            body: 'إنجازك يثبت أنك تستطيع التغلب على أي تحدٍ!'
          }
        ]
      : [
          {
            title: '🎉 Well done! You\'re making amazing progress',
            body: 'Keep up the good work, persistence is the key to success!'
          },
          {
            title: '💪 Excellent job!',
            body: 'You overcame a difficult challenge. You\'re closer to your goal now!'
          },
          {
            title: '🌟 Absolutely amazing!',
            body: 'Your achievement proves you can overcome any challenge!'
          }
        ];
    
    // Pick a random encouragement
    const randomIndex = Math.floor(Math.random() * encouragements.length);
    const { title, body } = encouragements[randomIndex];
    
    window.appPermissions.sendNotification({
      title,
      body,
      tag: 'encouragement',
      vibrate: [100, 50, 100, 50, 100]
    });
  };

  // This component doesn't render anything
  return null;
}; 

export default AutoNotifications; 