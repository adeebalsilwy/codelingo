const CACHE_NAME = 'codelingo-cache-v1';
const STATIC_CACHE_NAME = 'codelingo-static-v1';
const DYNAMIC_CACHE_NAME = 'codelingo-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/learn',
  '/code-editor',
  '/chat',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/mascot.svg',
  '/learn.svg',
  '/leaderboard.svg',
  '/quests.svg',
  '/shop.svg',
  '/code.svg',
  '/chat.svg',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
  );
  
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || 
      url.protocol !== 'https:' && url.protocol !== 'http:') {
    return;
  }
  
  // Skip API calls and authentication requests
  if (url.pathname.startsWith('/api/') || 
      url.pathname.includes('clerk') || 
      url.pathname.includes('analytics')) {
    return fetch(event.request);
  }
  
  // Cache-first strategy for static assets
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.png') || 
      url.pathname.endsWith('.svg') || 
      url.pathname.endsWith('.jpg') || 
      url.pathname.endsWith('.jpeg')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request)
            .then((res) => {
              return caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request.url, res.clone());
                  return res;
                });
            })
            .catch((err) => {
              console.error('[Service Worker] Fetch failed:', err);
              // Return offline page for navigation requests
              if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');
              }
            });
        })
    );
    return;
  }
  
  // Network-first strategy for dynamic content
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Clone the response to store in cache
        const resClone = res.clone();
        
        // Open dynamic cache and store the response
        caches.open(DYNAMIC_CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, resClone);
          });
          
        return res;
      })
      .catch((err) => {
        console.log('[Service Worker] Network request failed, trying cache', err);
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync', event);
  if (event.tag === 'sync-messages') {
    event.waitUntil(
      // Implement background sync logic here
      console.log('[Service Worker] Syncing messages')
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received', event);
  
  let data = { title: 'CodeLingo Update', body: 'New content available!' };
  
  if (event.data) {
    data = JSON.parse(event.data.text());
  }
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
}); 