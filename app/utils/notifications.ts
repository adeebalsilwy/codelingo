// وظائف إدارة الإشعارات

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  lang?: 'ar' | 'en';
}

// طلب إذن الإشعارات
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('هذا المتصفح لا يدعم إشعارات سطح المكتب');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// إرسال إشعار
export const sendNotification = async (options: NotificationOptions): Promise<boolean> => {
  const isGranted = await requestNotificationPermission();
  if (!isGranted) return false;
  
  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/logo1.jpg',
      lang: options.lang || 'ar',
    });
    
    if (options.url) {
      notification.onclick = () => {
        window.open(options.url, '_blank');
      };
    }
    
    return true;
  } catch (error) {
    console.error('فشل في إرسال الإشعار:', error);
    return false;
  }
};

// إشعارات السحابة (تُرسل من السيرفر)
export const subscribeToCloudNotifications = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('خدمة الإشعارات السحابية غير مدعومة في هذا المتصفح');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // الحصول على اشتراك موجود أو إنشاء اشتراك جديد
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // في التطبيق الحقيقي، يمكنك الحصول على المفتاح العام من الخادم
      const publicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      const convertedKey = urlBase64ToUint8Array(publicKey);
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });
      
      // إرسال تفاصيل الاشتراك إلى الخادم (تنفيذ وهمي)
      console.log('تم الاشتراك في الإشعارات السحابية:', JSON.stringify(subscription));
    }
    
    return true;
  } catch (error) {
    console.error('فشل في الاشتراك بالإشعارات السحابية:', error);
    return false;
  }
};

// تحويل Base64 URL إلى نوع Uint8Array (مطلوب لـ applicationServerKey)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// جدولة الإشعارات
type NotificationSchedule = {
  id: string;
  minutes: number;
  notificationOptions: NotificationOptions;
};

const scheduledNotifications: Map<string, number> = new Map();

export const scheduleNotification = (
  id: string,
  minutes: number,
  options: NotificationOptions
): void => {
  // إلغاء الإشعار القديم إذا كان موجودًا بنفس الهوية
  cancelScheduledNotification(id);
  
  // جدولة الإشعار الجديد
  const timeoutId = window.setTimeout(() => {
    sendNotification(options);
    scheduledNotifications.delete(id);
  }, minutes * 60 * 1000);
  
  scheduledNotifications.set(id, timeoutId);
};

export const cancelScheduledNotification = (id: string): boolean => {
  if (scheduledNotifications.has(id)) {
    window.clearTimeout(scheduledNotifications.get(id));
    scheduledNotifications.delete(id);
    return true;
  }
  return false;
};

// إشعارات عدم النشاط
let inactivityTimeout: number | null = null;

export const setupInactivityNotifications = (hourLimit: number = 12): void => {
  const resetInactivityTimer = () => {
    if (inactivityTimeout) {
      window.clearTimeout(inactivityTimeout);
    }
    
    inactivityTimeout = window.setTimeout(() => {
      const lang = localStorage.getItem('language') || 'ar';
      const title = lang === 'ar' ? 'نفتقدك!' : 'We miss you!';
      const body = lang === 'ar' 
        ? 'لقد مر وقت منذ آخر زيارة لك. عد للتعلم واكتشاف المزيد!'
        : 'It\'s been a while since your last visit. Come back to learn and discover more!';
      
      sendNotification({
        title,
        body,
        lang: lang as 'ar' | 'en',
        url: '/'
      });
    }, hourLimit * 60 * 60 * 1000); // تحويل الساعات إلى ميلي ثانية
  };
  
  // إعادة ضبط المؤقت عند كل نشاط للمستخدم
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
  
  // ضبط المؤقت الأولي
  resetInactivityTimer();
}; 