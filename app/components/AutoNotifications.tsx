'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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
  
  // Extend Navigator interface for Android detection
  interface Navigator {
    userAgentData?: {
      platform: string;
      mobile: boolean;
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
  // Use refs for values that shouldn't trigger re-renders
  const lastActivityRef = useRef<Date>(new Date());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<'desktop' | 'android' | 'ios' | 'other'>('other');
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState<boolean>(false);

  // Detect platform
  useEffect(() => {
    const detectPlatform = () => {
      // Check for modern platform info
      if (typeof window !== 'undefined' && window.navigator.userAgentData) {
        const { platform, mobile } = window.navigator.userAgentData;
        if (platform.toLowerCase().includes('android')) {
          setPlatform('android');
        } else if (platform.toLowerCase().includes('ios') || /iphone|ipad|ipod/i.test(platform.toLowerCase())) {
          setPlatform('ios');
        } else if (!mobile) {
          setPlatform('desktop');
        }
        return;
      }

      // Fallback to user agent
      const userAgent = navigator.userAgent.toLowerCase();
      if (/android/i.test(userAgent)) {
        setPlatform('android');
      } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        setPlatform('ios');
      } else if (!/mobile|tablet/i.test(userAgent)) {
        setPlatform('desktop');
      }
    };

    detectPlatform();
  }, []);

  // Check if service worker is available and ready
  useEffect(() => {
    const checkServiceWorker = () => {
      try {
        if (!('serviceWorker' in navigator)) {
          console.warn('Service Worker not supported in this browser');
          return;
        }

        navigator.serviceWorker.ready.then(() => {
          setIsServiceWorkerReady(true);
          console.log('Service worker is ready');
        }).catch(err => {
          console.error('Service worker ready error:', err);
        });

        // Check if service worker is controller
        if (navigator.serviceWorker.controller) {
          setIsServiceWorkerReady(true);
        }
      } catch (error) {
        console.error('Error checking service worker:', error);
      }
    };

    checkServiceWorker();
  }, []);

  // Check notification permission on mount and handle platform-specific issues
  useEffect(() => {
    const checkPermission = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('Notifications not supported');
        return;
      }
      
      try {
        // For Android, make sure to handle permissions properly
        if (platform === 'android') {
          // On Android, sometimes we need to manually request permission
          if (Notification.permission === 'default') {
            // Try to trigger the permission prompt on Android
            const permission = await Notification.requestPermission();
            setHasNotificationPermission(permission === 'granted');
            
            // Store permission in localStorage for persistence
            localStorage.setItem('notification_permission', permission);
          } else {
            setHasNotificationPermission(Notification.permission === 'granted');
          }
        } else {
          // For other platforms
          setHasNotificationPermission(Notification.permission === 'granted');
        }
        
        // Check and register push manager if available (for better Android support)
        if (Notification.permission === 'granted' && 'PushManager' in window) {
          if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
            const registration = await navigator.serviceWorker.ready;
            
            try {
              // Try to subscribe to push if not already subscribed
              const subscription = await registration.pushManager.getSubscription();
              if (!subscription) {
                console.log('Attempting to subscribe to push notifications');
                try {
                  // Skip actual subscription if we don't have a real VAPID key
                  const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY';
                  if (vapidPublicKey !== 'YOUR_VAPID_PUBLIC_KEY') {
                    await registration.pushManager.subscribe({
                      userVisibleOnly: true,
                      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                    });
                    console.log('Successfully subscribed to push notifications');
                  } else {
                    console.log('Skipping push subscription - no VAPID key provided');
                  }
                } catch (subscribeError) {
                  console.warn('Push subscription error', subscribeError);
                }
              }
            } catch (error) {
              console.warn('Push manager error', error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking notification permission:', error);
      }
    };
    
    checkPermission();
  }, [platform]);

  // Convert base64 to Uint8Array for push subscription
  const urlBase64ToUint8Array = (base64String: string) => {
    try {
      // Check if we're using the placeholder key and return empty array
      if (base64String === 'YOUR_VAPID_PUBLIC_KEY') {
        console.warn('Using placeholder VAPID key. Replace with actual key for production.');
        return new Uint8Array();
      }
      
      // Make sure we have a valid base64 string
      if (!base64String || typeof base64String !== 'string') {
        return new Uint8Array();
      }
      
      // Normalize the base64 string
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      try {
        // Decode base64 to binary string
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
      } catch (decodeError) {
        console.error('Error decoding base64 string:', decodeError);
        return new Uint8Array();
      }
    } catch (error) {
      console.error('Error converting base64 to Uint8Array:', error);
      return new Uint8Array();
    }
  };

  // Send user interaction to service worker with fallback
  const notifyServiceWorkerOfActivity = useCallback(() => {
    try {
      if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
        // Fallback: store the timestamp locally if service worker is not available
        localStorage.setItem('last_user_interaction', Date.now().toString());
        return;
      }
      
      navigator.serviceWorker.controller.postMessage({
        type: 'USER_INTERACTION',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error notifying service worker of activity:', error);
      // Fallback: store the timestamp locally
      localStorage.setItem('last_user_interaction', Date.now().toString());
    }
  }, []);

  // Fallback function to send notification directly if service worker isn't available
  const sendNotificationWithFallback = useCallback((title: string, options: NotificationOptions) => {
    try {
      if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return;
      }
      
      if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }
      
      // Try to use service worker if available
      if (isServiceWorkerReady && window.appPermissions) {
        window.appPermissions.sendNotification({
          title,
          ...options
        });
      } else if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Direct message to service worker
        navigator.serviceWorker.controller.postMessage({
          type: 'SEND_NOTIFICATION',
          title,
          options
        });
      } else {
        // Direct notification as fallback (won't work in background)
        new Notification(title, options);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      // Last resort fallback
      try {
        new Notification(title, options);
      } catch (innerError) {
        console.error('Final fallback notification failed:', innerError);
      }
    }
  }, [isServiceWorkerReady]);

  // Record user activity for inactivity notifications
  useEffect(() => {
    const recordActivity = () => {
      try {
        const now = new Date();
        lastActivityRef.current = now;
        
        // Store last activity time in localStorage for persistence across page reloads
        localStorage.setItem('last_activity_time', now.toISOString());
        
        // Notify service worker
        notifyServiceWorkerOfActivity();
        
        // Clear any existing inactivity timer
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        
        // Set a new inactivity timer (3 hours)
        inactivityTimerRef.current = setTimeout(() => {
          if (hasNotificationPermission) {
            // Send inactivity notification after 3 hours
            const hoursSinceLastActivity = (Date.now() - now.getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceLastActivity >= 3) {
              const title = language === 'ar' 
                ? '👋 هل أنت هناك؟' 
                : '👋 Are you there?';
              
              const body = language === 'ar'
                ? 'لقد مر بعض الوقت منذ آخر نشاط لك. هل تريد العودة للتعلم؟'
                : 'It\'s been a while since your last activity. Want to get back to learning?';
              
              sendNotificationWithFallback(title, {
                body,
                tag: 'inactivity',
                icon: '/logo1.jpg',
                data: {
                  url: '/courses'
                }
              });
            }
          }
        }, 3 * 60 * 60 * 1000); // 3 hours
      } catch (error) {
        console.error('Error recording activity:', error);
      }
    };
    
    // Check if there's a stored last activity time in localStorage
    try {
      const storedLastActivity = localStorage.getItem('last_activity_time');
      if (storedLastActivity) {
        lastActivityRef.current = new Date(storedLastActivity);
      }
    } catch (error) {
      console.error('Error reading stored activity time:', error);
    }
    
    // Record activity on these events
    const events = ['mousedown', 'mousemove', 'keypress', 'touchstart', 'scroll', 'click'];
    events.forEach(event => {
      window.addEventListener(event, recordActivity, { passive: true });
    });
    
    // Record initial activity
    recordActivity();
    
    // Setup a periodic activity check (every 15 minutes)
    const periodicCheck = setInterval(() => {
      if (lastActivityRef.current) {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current.getTime();
        
        // If we've detected a period of inactivity (15+ minutes), try to send notification
        if (timeSinceLastActivity > 15 * 60 * 1000) {
          console.log('Detected inactivity period of', Math.round(timeSinceLastActivity / (1000 * 60)), 'minutes');
          
          // Notify the service worker about this inactivity period
          try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'INACTIVITY_PERIOD',
                duration: timeSinceLastActivity,
                timestamp: Date.now()
              });
            }
          } catch (error) {
            console.error('Error notifying service worker about inactivity:', error);
          }
        }
      }
    }, 15 * 60 * 1000); // Check every 15 minutes
    
    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, recordActivity);
      });
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      clearInterval(periodicCheck);
    };
  }, [hasNotificationPermission, language, notifyServiceWorkerOfActivity, sendNotificationWithFallback]);

  // Send a welcome back notification
  const sendWelcomeBackNotification = useCallback(() => {
    try {
      const title = language === 'ar' 
        ? '👋 أهلاً بعودتك!' 
        : '👋 Welcome back!';
      
      const body = language === 'ar'
        ? 'لقد افتقدناك! هل أنت مستعد لمواصلة رحلة التعلم؟'
        : 'We missed you! Ready to continue your learning journey?';
      
      sendNotificationWithFallback(title, {
        body,
        tag: 'welcome-back',
        icon: '/logo1.jpg',
        data: {
          url: '/courses'
        }
      });
    } catch (error) {
      console.error('Error sending welcome back notification:', error);
    }
  }, [language, sendNotificationWithFallback]);

  // Send an encouragement notification
  const sendEncouragementNotification = useCallback(() => {
    try {
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
      
      sendNotificationWithFallback(title, {
        body,
        tag: 'encouragement',
        icon: '/logo1.jpg',
        // Use vibrate as a custom property for platforms that support it
        data: { 
          vibrate: [100, 50, 100, 50, 100],
          url: '/courses'
        }
      });
    } catch (error) {
      console.error('Error sending encouragement notification:', error);
    }
  }, [language, sendNotificationWithFallback]);

  // Monitor page visits to send contextual notifications
  useEffect(() => {
    if (!hasNotificationPermission || !pathname) return;
    
    try {
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
    } catch (error) {
      console.error('Error handling page visit:', error);
    }
  }, [pathname, hasNotificationPermission, language, sendWelcomeBackNotification]);

  // Setup occasional motivational notifications based on user settings
  useEffect(() => {
    if (!hasNotificationPermission) return;
    
    // Set initial notification interval (defaults to 12 hours)
    const initializeNotificationInterval = () => {
      try {
        // Try to get user preference from localStorage
        const preferredInterval = localStorage.getItem('notificationInterval');
        const hours = preferredInterval ? parseInt(preferredInterval, 10) : 12;
        
        // Send to service worker if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SET_NOTIFICATION_INTERVAL',
            hours
          });
          
          console.log(`Initialized notification interval to ${hours} hours`);
        } else if (window.appPermissions) {
          window.appPermissions.setNotificationInterval(hours);
          console.log(`Initialized notification interval to ${hours} hours via appPermissions`);
        } else {
          // Fallback: store locally
          localStorage.setItem('notification_interval_hours', hours.toString());
          console.log(`Stored notification interval locally: ${hours} hours`);
          
          // Setup a backup notification system without service worker
          const lastNotification = localStorage.getItem('last_notification_time');
          const now = Date.now();
          
          if (!lastNotification || (now - parseInt(lastNotification, 10)) > hours * 60 * 60 * 1000) {
            // Time to send a notification as fallback
            const title = language === 'ar' 
              ? 'حان وقت التعلم! ✨' 
              : 'Learning time! ✨';
            
            const body = language === 'ar'
              ? 'عقلك ينتظر المزيد من المعرفة! تعال وأكمل الدرس التالي'
              : 'Your brain is waiting for more knowledge! Come complete your next lesson';
            
            // Send immediately, but only if enough time has passed
            sendNotificationWithFallback(title, {
              body,
              icon: '/logo1.jpg',
              tag: 'reminder'
            });
            
            // Record notification time
            localStorage.setItem('last_notification_time', now.toString());
          }
        }
      } catch (error) {
        console.error('Error initializing notification interval:', error);
      }
    };
    
    // Try to initialize immediately if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      initializeNotificationInterval();
    } else if (window.appPermissions) {
      initializeNotificationInterval();
    } else {
      // Otherwise wait for service worker to be ready
      const readyCheck = setInterval(() => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          initializeNotificationInterval();
          clearInterval(readyCheck);
        } else if (window.appPermissions) {
          initializeNotificationInterval();
          clearInterval(readyCheck);
        }
      }, 1000);
      
      // Set a timeout to use fallback after 5 seconds
      const fallbackTimeout = setTimeout(() => {
        if (!('serviceWorker' in navigator && navigator.serviceWorker.controller) && !window.appPermissions) {
          console.log('Using notification fallback mechanism');
          initializeNotificationInterval();
          clearInterval(readyCheck);
        }
      }, 5000);
      
      // Cleanup
      return () => {
        clearInterval(readyCheck);
        clearTimeout(fallbackTimeout);
      };
    }
    
    // Listen for notification clicks
    const handleNotificationMessage = (event: MessageEvent) => {
      try {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          // Record that the user engaged with a notification
          localStorage.setItem('lastNotificationEngagement', new Date().toISOString());
        }
      } catch (error) {
        console.error('Error handling notification message:', error);
      }
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleNotificationMessage);
    }
    
    // Create direct notification click handler
    const handleDirectNotificationClick = () => {
      localStorage.setItem('lastNotificationEngagement', new Date().toISOString());
    };
    
    // Add direct notification click handler for browsers without service worker
    if ('Notification' in window) {
      self.addEventListener('notificationclick', handleDirectNotificationClick);
    }
    
    // Event handlers for syncing notification settings
    const syncNotificationSettings = () => {
      try {
        // Get user preference
        const preferredInterval = localStorage.getItem('notificationInterval');
        
        if (preferredInterval) {
          const hours = parseInt(preferredInterval, 10);
          
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SET_NOTIFICATION_INTERVAL',
              hours
            });
          } else if (window.appPermissions) {
            window.appPermissions.setNotificationInterval(hours);
          } else {
            localStorage.setItem('notification_interval_hours', hours.toString());
          }
        }
      } catch (error) {
        console.error('Error syncing notification settings:', error);
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncNotificationSettings();
        notifyServiceWorkerOfActivity();
      }
    };
    
    const handleFocus = () => {
      syncNotificationSettings();
      notifyServiceWorkerOfActivity();
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Cleanup
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleNotificationMessage);
      }
      if ('Notification' in window) {
        self.removeEventListener('notificationclick', handleDirectNotificationClick);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [hasNotificationPermission, language, notifyServiceWorkerOfActivity, sendNotificationWithFallback]);

  // Handle course completion notifications
  useEffect(() => {
    if (!hasNotificationPermission) return;
    
    const handleCourseComplete = (event: any) => {
      try {
        if (!event.detail) return;
        
        const { courseId, attempts, timeSpent } = event.detail;
        
        // If user spent significant time or had multiple attempts, send encouragement
        if (attempts > 3 || timeSpent > 600) { // 10 minutes
          sendEncouragementNotification();
        }
      } catch (error) {
        console.error('Error handling course completion:', error);
      }
    };
    
    document.addEventListener('courseComplete', handleCourseComplete);
    
    return () => {
      document.removeEventListener('courseComplete', handleCourseComplete);
    };
  }, [hasNotificationPermission, sendEncouragementNotification]);

  // This component doesn't render anything
  return null;
}; 

export default AutoNotifications; 