'use client';

import { useEffect } from 'react';
import { useI18n } from '@/app/i18n/client';
import { 
  requestNotificationPermission, 
  scheduleNotification,
  setupInactivityNotifications
} from '@/app/utils/notifications';

export const AutoNotifications = () => {
  const { language } = useI18n();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // تنفيذ الإعداد بدون استخدام async في الدالة الرئيسية لـ useEffect
    const setupNotifications = () => {
      // طلب إذن الإشعارات
      requestNotificationPermission().then(hasPermission => {
        if (!hasPermission) return;

        // إشعار كل 2.5 دقيقة (للاختبار)
        scheduleNotification(
          'reminder-2.5min',
          2.5,
          {
            title: language === 'ar' ? 'تذكير سريع!' : 'Quick Reminder!',
            body: language === 'ar' 
              ? 'استمر في تعلمك مع إيدو برو'
              : 'Continue your learning journey with Edu PRO',
            lang: language as 'ar' | 'en'
          }
        );

        // إشعار كل 30 دقيقة
        scheduleNotification(
          'reminder-30min',
          30,
          {
            title: language === 'ar' ? 'حان وقت الدراسة!' : 'Study Time!',
            body: language === 'ar' 
              ? 'تعرف على مهارات جديدة اليوم مع إيدو برو'
              : 'Learn new skills today with Edu PRO',
            lang: language as 'ar' | 'en'
          }
        );

        // إشعار كل ساعة
        scheduleNotification(
          'reminder-60min',
          60,
          {
            title: language === 'ar' ? 'ساعة من التعلم' : 'Hour of Learning',
            body: language === 'ar' 
              ? 'كل ساعة تقضيها في التعلم تقربك من أهدافك'
              : 'Every hour you spend learning brings you closer to your goals',
            lang: language as 'ar' | 'en'
          }
        );

        // إعداد إشعار عدم النشاط (بعد 12 ساعة)
        setupInactivityNotifications(12);
      });
    };

    // تنفيذ الإعداد
    setupNotifications();

    // تنظيف عند إلغاء تحميل المكون
    return () => {
      // لن نحتاج إلى إلغاء الإشعارات هنا لأنها تُعاد جدولتها مع كل تحميل للصفحة
    };
  }, [language]);

  // هذا المكون لا يعرض أي شيء في واجهة المستخدم
  return null;
}; 