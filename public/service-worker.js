// اسم التخزين المؤقت
const CACHE_NAME = 'lingo-cache-v1';
const OFFLINE_URL = '/offline.html';

// الملفات التي سيتم تخزينها مؤقتًا للاستخدام في وضع عدم الاتصال
const urlsToCache = [
  '/',
  '/courses',
  '/learn',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/offline.html',
          '/manifest.json',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png'
        ]);
      })
  );
});

// تنشيط Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// استراتيجية التخزين المؤقت: الشبكة أولاً، ثم التخزين المؤقت
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then(response => {
        // Don't cache if not a successful response
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Store in cache
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          })
          .catch(err => {
            console.error('Cache put error:', err);
          });

        return response;
      })
      .catch(() => {
        // On network failure, try cache
        return caches.match(event.request)
          .then(response => {
            // Return cached response if available
            if (response) {
              return response;
            }

            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }

            // Return error response for other requests
            return new Response('Network error', {
              status: 408,
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
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'إيدو برو', options)
  );
});

// التعامل مع النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(windowClients => {
        // Try to focus existing window
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// تخزين الإشعارات في IndexedDB
const storeNotification = (title, options) => {
  if (!('indexedDB' in self)) return;
  
  const request = indexedDB.open('notifications-store', 1);
  
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('notifications')) {
      const store = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    }
  };
  
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    
    store.add({
      title,
      ...options,
      read: false,
      timestamp: new Date().getTime()
    });
  };
};

// التعامل مع الإشعارات المجدولة
self.addEventListener('message', (event) => {
  // تحديث Service Worker
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // إشعار مجدول
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, options, delay } = event.data;
    
    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delay);
  }
});