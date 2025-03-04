// اسم التخزين المؤقت
const CACHE_NAME = 'codelingo-cache-v1';

// الملفات التي سيتم تخزينها مؤقتًا للاستخدام في وضع عدم الاتصال
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/images/logo-android.png',
  '/images/icons/icon-72x72.png',
  '/images/icons/icon-96x96.png',
  '/images/icons/icon-128x128.png',
  '/images/icons/icon-144x144.png',
  '/images/icons/icon-152x152.png',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-384x384.png',
  '/images/icons/icon-512x512.png',
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('تم فتح التخزين المؤقت');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// تنشيط Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية التخزين المؤقت: الشبكة أولاً، ثم التخزين المؤقت
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // تحقق مما إذا كانت الاستجابة صالحة
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // انسخ الاستجابة
        const responseToCache = response.clone();

        // أضف الاستجابة إلى التخزين المؤقت
        caches.open(CACHE_NAME)
          .then((cache) => {
            // تخزين الطلبات GET فقط
            if (event.request.method === 'GET') {
              cache.put(event.request, responseToCache);
            }
          });

        return response;
      })
      .catch(() => {
        // إذا فشل الطلب، تحقق من التخزين المؤقت
        return caches.match(event.request)
          .then((response) => {
            // إذا وجدنا استجابة في التخزين المؤقت، أعدها
            if (response) {
              return response;
            }
            
            // إذا كان الطلب لصفحة، أعد صفحة عدم الاتصال
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // إذا لم نتمكن من استرداد الأصل من التخزين المؤقت، أعد استجابة خطأ
            return new Response('حدث خطأ في الاتصال.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// التعامل مع إشعارات الدفع
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// التعامل مع النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// التعامل مع طلبات التحديث من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 