// وظيفة لتسجيل service worker
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered: ', registration);
          
          // التحقق من وجود تحديثات
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // يوجد تحديث جديد متاح
                  console.log('New service worker available.');
                  
                  // إرسال حدث للتطبيق لإظهار إشعار التحديث
                  const event = new CustomEvent('serviceWorkerUpdateAvailable');
                  window.dispatchEvent(event);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed: ', error);
        });
        
      // التعامل مع تحديثات Service Worker
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

// وظيفة لتحديث service worker
export function updateServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
}

// وظيفة لتطبيق التحديث فوراً
export function applyServiceWorkerUpdate() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        // إرسال رسالة إلى service worker للتخطي وتطبيق التحديث
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
}

// وظيفة للتحقق من حالة الاتصال بالإنترنت
export function checkOnlineStatus() {
  if (typeof window !== 'undefined') {
    return navigator.onLine;
  }
  return true; // افتراضياً متصل على الخادم
}

// وظيفة للاستماع لتغييرات حالة الاتصال
export function listenToConnectionChanges(
  onlineCallback: () => void,
  offlineCallback: () => void
) {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', onlineCallback);
    window.addEventListener('offline', offlineCallback);
    
    return () => {
      window.removeEventListener('online', onlineCallback);
      window.removeEventListener('offline', offlineCallback);
    };
  }
  
  return () => {}; // وظيفة تنظيف فارغة للخادم
} 