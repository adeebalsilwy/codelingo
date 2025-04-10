// اسم التخزين المؤقت
const CACHE_NAME = 'edu-pro-cache-v3';
const OFFLINE_URL = '/offline.html';

// الملفات التي سيتم تخزينها مؤقتًا للاستخدام في وضع عدم الاتصال
const urlsToCache = [
  '/',
  '/courses',
  '/learn',
  '/offline.html',
  '/manifest.json',
  '/manifest-ar.json',
  '/app-permissions.js',
  '/app-version.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/logo1.jpg',
  '/favicon.ico',
  '/learn.svg',
  '/hero-programming.svg',
  '/correct.wav',
  '/finish.mp3'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed!');
        return self.skipWaiting();
      })
  );
});

// تنشيط Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Successfully activated!');
      return self.clients.claim();
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
  
  // خدمة API على حدة لعدم حفظها في ذاكرة التخزين المؤقت
  if (event.request.url.includes('/api/')) {
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
            console.error('[Service Worker] Cache put error:', err);
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

// متغيرات وإعدادات الإشعارات
let nextNotificationTime = null;
let notificationScheduler = null;
let lastUserInteraction = Date.now();
let notificationInterval = 12 * 60 * 60 * 1000; // 12 ساعة افتراضية
let userPreferredLanguage = 'ar';
let lastNotificationSent = null;

// تخزين ذاكرة التخزين مؤقت للإعدادات المختلفة
const STORAGE_KEY = 'sw-notification-settings';

// استرجاع الإعدادات من IndexedDB
const getStoredSettings = () => {
  return new Promise((resolve) => {
    if (!('indexedDB' in self)) {
      resolve({});
      return;
    }
    
    const request = indexedDB.open('settings-store', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };
    
    request.onerror = () => resolve({});
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const getRequest = store.get(STORAGE_KEY);
      
      getRequest.onerror = () => resolve({});
      getRequest.onsuccess = () => {
        const settings = getRequest.result || {};
        resolve(settings);
      };
    };
  });
};

// حفظ الإعدادات في IndexedDB
const storeSettings = (settings) => {
  if (!('indexedDB' in self)) return;
  
  const request = indexedDB.open('settings-store', 1);
  
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'id' });
    }
  };
  
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    
    store.put({
      id: STORAGE_KEY,
      ...settings,
      lastUpdate: Date.now()
    });
  };
};

// قائمة الإشعارات الحافزة والعاطفية
const motivationalNotifications = {
  ar: [
    {
      title: "نفتقدك! 💫",
      body: "لقد مضى بعض الوقت منذ آخر درس، هل تعود اليوم للتعلم؟"
    },
    {
      title: "حان وقت التعلم! ✨",
      body: "عقلك ينتظر المزيد من المعرفة! تعال وأكمل الدرس التالي"
    },
    {
      title: "أنت قريب من إتمام الوحدة! 🚀",
      body: "لا تتوقف الآن، أنت على بعد خطوات قليلة من إكمال المستوى الحالي"
    },
    {
      title: "تذكير ودي ✌️",
      body: "المثابرة هي سر النجاح! لا تنسَ جلسة التعلم اليومية"
    },
    {
      title: "إنجازك في خطر! ⏰",
      body: "حافظ على سلسلة إنجازاتك المتتالية، عد للتعلم اليوم"
    },
    {
      title: "هل تعلم؟ 🧠",
      body: "التعلم اليومي ولو لمدة 5 دقائق يحسن ذاكرتك بنسبة 70%"
    },
    {
      title: "لحظة إلهام! 💡",
      body: "أعظم المبرمجين بدأوا تمامًا من حيث أنت الآن، استمر!"
    }
  ],
  en: [
    {
      title: "We miss you! 💫",
      body: "It's been a while since your last lesson, ready to learn today?"
    },
    {
      title: "Learning time! ✨",
      body: "Your brain is waiting for more knowledge! Come complete your next lesson"
    },
    {
      title: "You're close to completing the unit! 🚀",
      body: "Don't stop now, you're just a few steps away from completing the current level"
    },
    {
      title: "Friendly reminder ✌️",
      body: "Persistence is the secret to success! Don't forget your daily learning session"
    },
    {
      title: "Your streak is at risk! ⏰",
      body: "Keep your consecutive achievement streak, come back to learn today"
    },
    {
      title: "Did you know? 🧠",
      body: "Daily learning for just 5 minutes improves your memory by 70%"
    },
    {
      title: "Moment of inspiration! 💡",
      body: "The greatest programmers started exactly where you are now, keep going!"
    }
  ]
};

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
      timestamp: Date.now()
    });
  };
};

// جدولة إشعار دوري عشوائي
const scheduleNextPeriodicNotification = async (interval = 12 * 60 * 60 * 1000) => {
  // إلغاء أي إشعار مجدول سابقًا
  if (notificationScheduler) {
    clearTimeout(notificationScheduler);
  }
  
  // تحديث فترة الإشعارات
  notificationInterval = interval;
  
  // تحديد وقت الإشعار القادم (الافتراضي: 12 ساعة)
  nextNotificationTime = Date.now() + interval;
  
  // حفظ الإعدادات
  const settings = await getStoredSettings();
  storeSettings({
    ...settings,
    notificationInterval: interval,
    nextNotificationTime
  });
  
  // جدولة الإشعار القادم
  notificationScheduler = setTimeout(() => {
    // التحقق من الوقت منذ آخر تفاعل
    const timeSinceLastInteraction = Date.now() - lastUserInteraction;
    const minimumInactivityPeriod = 3 * 60 * 60 * 1000; // 3 ساعات كحد أدنى من عدم النشاط
    
    if (timeSinceLastInteraction >= minimumInactivityPeriod) {
      // التحقق من لغة المستخدم المفضلة
      sendRandomMotivationalNotification(userPreferredLanguage);
    } else {
      // اجدول مرة أخرى بعد فترة قصيرة
      setTimeout(() => {
        sendRandomMotivationalNotification(userPreferredLanguage);
      }, minimumInactivityPeriod - timeSinceLastInteraction);
    }
  }, interval);
  
  console.log('[Service Worker] Next notification scheduled at:', new Date(nextNotificationTime));
};

// تحديث وقت آخر تفاعل للمستخدم
const updateLastUserInteraction = () => {
  lastUserInteraction = Date.now();
  
  // حفظ آخر وقت تفاعل
  getStoredSettings().then(settings => {
    storeSettings({
      ...settings,
      lastUserInteraction
    });
  });
};

// إرسال إشعار تحفيزي عشوائي
const sendRandomMotivationalNotification = (language = 'ar') => {
  // لا نرسل إذا تم إرسال إشعار بالفعل خلال الساعة الماضية
  if (lastNotificationSent && Date.now() - lastNotificationSent < 60 * 60 * 1000) {
    scheduleNextPeriodicNotification(notificationInterval);
    return;
  }
  
  // اختيار إشعار عشوائي من القائمة
  const notifications = motivationalNotifications[language] || motivationalNotifications.ar;
  const randomIndex = Math.floor(Math.random() * notifications.length);
  const { title, body } = notifications[randomIndex];
  
  // إرسال الإشعار
  self.registration.showNotification(title, {
    body,
    icon: '/logo1.jpg',
    badge: '/logo1.jpg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: randomIndex,
      type: 'motivational'
    },
    actions: [
      {
        action: 'open',
        title: language === 'ar' ? 'فتح التطبيق' : 'Open App'
      },
      {
        action: 'close',
        title: language === 'ar' ? 'لاحقًا' : 'Later'
      }
    ]
  }).then(() => {
    // تحديث وقت آخر إرسال إشعار
    lastNotificationSent = Date.now();
    
    // حفظ الإعدادات
    getStoredSettings().then(settings => {
      storeSettings({
        ...settings,
        lastNotificationSent
      });
    });
    
    // جدولة الإشعار التالي
    scheduleNextPeriodicNotification(notificationInterval);
  });
  
  // تخزين الإشعار
  storeNotification(title, { body });
};

// التعامل مع الإشعارات المجدولة
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  // تحديث Service Worker
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting, activating immediately');
    self.skipWaiting();
  }

  // تلقي لغة المستخدم
  if (event.data && event.data.type === 'LANGUAGE_INFO') {
    const { language } = event.data;
    if (language) {
      userPreferredLanguage = language;
      
      // حفظ اللغة المفضلة
      getStoredSettings().then(settings => {
        storeSettings({
          ...settings,
          userPreferredLanguage
        });
      });
    }
  }

  // تحديث وقت آخر تفاعل للمستخدم
  if (event.data && event.data.type === 'USER_INTERACTION') {
    updateLastUserInteraction();
  }

  // ضبط وتيرة الإشعارات
  if (event.data && event.data.type === 'SET_NOTIFICATION_INTERVAL') {
    const { hours } = event.data;
    if (hours && typeof hours === 'number') {
      scheduleNextPeriodicNotification(hours * 60 * 60 * 1000);
    }
  }

  // إشعار مجدول
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, options, delay } = event.data;
    console.log('[Service Worker] Scheduling notification in', delay, 'ms');
    
    setTimeout(() => {
      self.registration.showNotification(title, options);
      storeNotification(title, options);
    }, delay);
  }
  
  // إرسال إشعار فوري
  if (event.data && event.data.type === 'SEND_NOTIFICATION') {
    const { title, options } = event.data;
    console.log('[Service Worker] Sending immediate notification');
    
    self.registration.showNotification(title, options);
    storeNotification(title, options);
  }
  
  // طلب صلاحيات
  if (event.data && event.data.type === 'REQUEST_PERMISSION') {
    console.log('[Service Worker] Permission request:', event.data.permission);
    
    const requestPermission = async () => {
      // يتم التعامل مع الأذونات في الجانب العميل، نرسل فقط رسالة التأكيد
      event.ports[0].postMessage({
        status: 'received',
        permission: event.data.permission
      });
    };
    
    event.waitUntil(requestPermission());
  }
  
  // التحقق من الاتصال
  if (event.data && event.data.type === 'CHECK_CONNECTIVITY') {
    fetch('/api/ping', { method: 'GET', cache: 'no-store' })
      .then(() => {
        event.ports[0].postMessage({ online: true });
      })
      .catch(() => {
        event.ports[0].postMessage({ online: false });
      });
  }
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // تحديث وقت التفاعل
  updateLastUserInteraction();
  
  // إرسال إشعار إلى العميل أن المستخدم تفاعل مع الإشعار
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_CLICKED',
        data: event.notification.data
      });
    });
  });
  
  // التعامل مع الإجراءات المختلفة
  if (event.action === 'open') {
    // فتح التطبيق في نافذة موجودة أو إنشاء نافذة جديدة
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clientsArr => {
        // استخدام نافذة موجودة إذا وجدت
        const hadWindowToFocus = clientsArr.some(windowClient => windowClient.url.includes('/courses') ? (windowClient.focus(), true) : false);
        
        // إذا لم توجد نافذة مفتوحة، افتح نافذة جديدة
        if (!hadWindowToFocus) {
          self.clients.openWindow('/courses').then(windowClient => windowClient ? windowClient.focus() : null);
        }
      })
    );
  } else if (event.action === 'close') {
    // لا نفعل شيئًا، تم إغلاق الإشعار بالفعل
    console.log('[Service Worker] Notification dismissed');
  } else {
    // السلوك الافتراضي - فتح التطبيق
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clientsArr => {
        // افتح الصفحة الرئيسية
        self.clients.openWindow('/').then(windowClient => windowClient ? windowClient.focus() : null);
      })
    );
  }
});

// تنفيذ في حالة عدم وجود العميل نشط
self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-and-notify') {
    event.waitUntil(async () => {
      // التحقق من وقت آخر إشعار تم إرساله
      const settings = await getStoredSettings();
      const timeSinceLastNotification = settings.lastNotificationSent 
        ? Date.now() - settings.lastNotificationSent
        : Infinity;
      
      const minTimeBetweenNotifications = 3 * 60 * 60 * 1000; // 3 ساعات كحد أدنى
      
      if (timeSinceLastNotification >= minTimeBetweenNotifications) {
        // نرسل إشعاراً إذا مر وقت كافٍ منذ آخر إشعار
        sendRandomMotivationalNotification(
          settings.userPreferredLanguage || userPreferredLanguage
        );
      }
    });
  }
});

// عند تثبيت SW للمرة الأولى، قم باسترجاع الإعدادات وجدولة الإشعار الأول
self.addEventListener('activate', (event) => {
  event.waitUntil(
    // استرجاع الإعدادات المخزنة
    getStoredSettings().then(settings => {
      // تطبيق الإعدادات المخزنة إن وجدت
      if (settings.notificationInterval) {
        notificationInterval = settings.notificationInterval;
      }
      
      if (settings.lastUserInteraction) {
        lastUserInteraction = settings.lastUserInteraction;
      }
      
      if (settings.userPreferredLanguage) {
        userPreferredLanguage = settings.userPreferredLanguage;
      }
      
      if (settings.lastNotificationSent) {
        lastNotificationSent = settings.lastNotificationSent;
      }
      
      // بدء جدولة الإشعارات بعد التنشيط
      return scheduleNextPeriodicNotification(notificationInterval);
    }).catch(err => {
      console.error('[Service Worker] Error restoring settings:', err);
      
      // استخدام القيم الافتراضية إذا فشلت عملية الاسترجاع
      return scheduleNextPeriodicNotification(3 * 60 * 60 * 1000); // أول إشعار بعد 3 ساعات
    })
  );
  
  // تسجيل مزامنة دورية إذا كانت مدعومة
  if ('periodicSync' in self.registration) {
    event.waitUntil(
      self.registration.periodicSync.register('check-and-notify', {
        minInterval: 3 * 60 * 60 * 1000 // كل 3 ساعات
      }).catch(err => {
        console.error('[Service Worker] Error registering periodic sync:', err);
      })
    );
  }
});

// استماع لأحداث التثبيت
self.addEventListener('sync', (event) => {
  if (event.tag === 'first-sync-after-install') {
    // تحديث وقت آخر تفاعل
    updateLastUserInteraction();
    
    // إرسال إشعار ترحيبي بعد 30 دقيقة من التثبيت
    event.waitUntil(
      new Promise(resolve => {
        setTimeout(() => {
          sendRandomMotivationalNotification(userPreferredLanguage);
          resolve();
        }, 30 * 60 * 1000); // 30 دقيقة
      })
    );
  }
});