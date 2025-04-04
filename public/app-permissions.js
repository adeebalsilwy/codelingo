/**
 * ملف للتعامل مع صلاحيات التطبيق في وضع PWA
 */

class AppPermissions {
  constructor() {
    this.serviceWorkerRegistration = null;
    this.permissions = {
      microphone: { status: 'unknown', requested: false },
      camera: { status: 'unknown', requested: false },
      notifications: { status: 'unknown', requested: false },
      'clipboard-read': { status: 'unknown', requested: false },
      'clipboard-write': { status: 'unknown', requested: false },
      storage: { status: 'unknown', requested: false }
    };
    
    this.init();
  }
  
  /**
   * تهيئة المدير
   */
  async init() {
    // التحقق من دعم الصلاحيات
    if (!('permissions' in navigator)) {
      console.warn('Permissions API is not supported in this browser');
      return;
    }
    
    // تسجيل مستمع لأحداث التثبيت
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.checkAllPermissions();
    });
    
    // التحقق من أننا في وضع PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone) {
      console.log('Running in standalone PWA mode');
      this.checkAllPermissions();
    }
    
    // تسجيل Service Worker
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
        console.log('Service Worker is ready');
        
        // إرسال معلومات اللغة إلى Service Worker
        this.sendLanguageToServiceWorker();
        
        // إضافة مستمع للرسائل من Service Worker
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      } catch (error) {
        console.error('Error registering Service Worker:', error);
      }
    }
    
    // مراقبة تغيير اللغة
    window.addEventListener('languagechange', () => {
      this.sendLanguageToServiceWorker();
    });
    
    // تسجيل حالة المستخدم النشط
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // مراقبة الاتصال بالإنترنت
    window.addEventListener('online', () => this.sendConnectivityStatus(true));
    window.addEventListener('offline', () => this.sendConnectivityStatus(false));
  }
  
  /**
   * إرسال حالة الاتصال إلى Service Worker
   * @param {boolean} isOnline - حالة الاتصال
   */
  sendConnectivityStatus(isOnline) {
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'CONNECTIVITY_STATUS',
        isOnline
      });
    }
  }
  
  /**
   * معالجة تغيير حالة الرؤية
   */
  handleVisibilityChange() {
    // إذا كان المستخدم عاد للتطبيق، أرسل معلومات اللغة
    if (document.visibilityState === 'visible') {
      this.sendLanguageToServiceWorker();
    }
  }
  
  /**
   * إرسال معلومات اللغة إلى Service Worker
   */
  sendLanguageToServiceWorker() {
    const language = localStorage.getItem('language') || 
                     (document.documentElement.lang === 'ar' ? 'ar' : 'en');
    
    if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'LANGUAGE_INFO',
        language
      });
    }
  }
  
  /**
   * معالجة الرسائل من Service Worker
   * @param {MessageEvent} event - حدث الرسالة
   */
  handleServiceWorkerMessage(event) {
    if (!event.data) return;
    
    console.log('[AppPermissions] Message from Service Worker:', event.data);
    
    // التعامل مع طلب معلومات اللغة
    if (event.data.type === 'GET_LANGUAGE') {
      this.sendLanguageToServiceWorker();
    }
  }
  
  /**
   * التحقق من جميع الصلاحيات
   */
  async checkAllPermissions() {
    for (const permission of Object.keys(this.permissions)) {
      const status = await this.checkPermission(permission);
      this.permissions[permission].status = status;
    }
    
    // استرجاع الصلاحيات المطلوبة سابقًا من التخزين المحلي
    const requestedPermissions = localStorage.getItem('requestedPermissions');
    if (requestedPermissions) {
      try {
        const parsedPermissions = JSON.parse(requestedPermissions);
        for (const [key, value] of Object.entries(parsedPermissions)) {
          if (this.permissions[key]) {
            this.permissions[key].requested = value;
          }
        }
      } catch (error) {
        console.error('Error parsing requested permissions:', error);
      }
    }
  }
  
  /**
   * التحقق من حالة صلاحية معينة
   * @param {string} name - اسم الصلاحية
   * @returns {Promise<string>} - حالة الصلاحية (granted, denied, prompt, unknown)
   */
  async checkPermission(name) {
    try {
      if (!navigator.permissions) {
        return this.checkPermissionFallback(name);
      }
      
      // استخدام واجهة برمجة التطبيقات Permissions API للتحقق من الصلاحية
      const permission = await navigator.permissions.query({ name });
      return permission.state;
    } catch (error) {
      console.warn(`Error checking permission "${name}":`, error);
      return this.checkPermissionFallback(name);
    }
  }
  
  /**
   * طريقة بديلة للتحقق من الصلاحيات في حالة عدم دعم Permissions API
   * @param {string} name - اسم الصلاحية
   * @returns {string} - حالة الصلاحية
   */
  checkPermissionFallback(name) {
    // التحقق من الإشعارات
    if (name === 'notifications' && 'Notification' in window) {
      return Notification.permission;
    }
    
    // استرجاع الحالة من التخزين المحلي
    const savedState = localStorage.getItem(`permission_${name}`);
    if (savedState) {
      return savedState;
    }
    
    return 'unknown';
  }
  
  /**
   * طلب صلاحية معينة
   * @param {string} name - اسم الصلاحية
   * @returns {Promise<boolean>} - نجاح أو فشل الطلب
   */
  async requestPermission(name) {
    try {
      let granted = false;
      
      // طلب الصلاحيات حسب النوع
      switch (name) {
        case 'notifications':
          granted = await this.requestNotificationPermission();
          break;
        case 'microphone':
          granted = await this.requestMicrophonePermission();
          break;
        case 'camera':
          granted = await this.requestCameraPermission();
          break;
        case 'clipboard-read':
        case 'clipboard-write':
          granted = await this.requestClipboardPermission(name);
          break;
        case 'storage':
          granted = await this.requestStoragePermission();
          break;
        default:
          console.warn(`Unknown permission type: ${name}`);
          return false;
      }
      
      // حفظ حالة الطلب
      this.permissions[name].requested = true;
      
      // حفظ الصلاحيات المطلوبة في التخزين المحلي
      this.saveRequestedPermissions();
      
      return granted;
    } catch (error) {
      console.error(`Error requesting permission "${name}":`, error);
      return false;
    }
  }
  
  /**
   * حفظ الصلاحيات المطلوبة في التخزين المحلي
   */
  saveRequestedPermissions() {
    const requestedPermissions = {};
    for (const [key, value] of Object.entries(this.permissions)) {
      requestedPermissions[key] = value.requested;
    }
    
    localStorage.setItem('requestedPermissions', JSON.stringify(requestedPermissions));
  }
  
  /**
   * طلب إذن الإشعارات
   * @returns {Promise<boolean>} - نجاح أو فشل الطلب
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      localStorage.setItem('permission_notifications', permission);
      this.permissions.notifications.status = permission;
      
      // إرسال إشعار ترحيبي إذا تم منح الإذن
      if (granted && this.serviceWorkerRegistration) {
        const language = localStorage.getItem('language') || 
                       (document.documentElement.lang === 'ar' ? 'ar' : 'en');
        
        setTimeout(() => {
          this.sendNotification({
            title: language === 'ar' ? '🎉 أهلاً بك!' : '🎉 Welcome!',
            body: language === 'ar' 
              ? 'شكراً لتفعيل الإشعارات! سنحافظ على إبقائك على اطلاع بجديد رحلة التعلم.'
              : 'Thanks for enabling notifications! We\'ll keep you updated on your learning journey.',
            icon: '/logo1.jpg',
            tag: 'welcome',
            vibrate: [100, 50, 100]
          });
        }, 1000);
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  /**
   * طلب إذن الميكروفون
   * @returns {Promise<boolean>} - نجاح أو فشل الطلب
   */
  async requestMicrophonePermission() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Microphone API not supported');
      return false;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // تنظيف المسارات بعد الحصول على الإذن
      stream.getTracks().forEach(track => track.stop());
      
      localStorage.setItem('permission_microphone', 'granted');
      this.permissions.microphone.status = 'granted';
      
      return true;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      
      localStorage.setItem('permission_microphone', 'denied');
      this.permissions.microphone.status = 'denied';
      
      return false;
    }
  }
  
  /**
   * طلب إذن الكاميرا
   * @returns {Promise<boolean>} - نجاح أو فشل الطلب
   */
  async requestCameraPermission() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Camera API not supported');
      return false;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // تنظيف المسارات بعد الحصول على الإذن
      stream.getTracks().forEach(track => track.stop());
      
      localStorage.setItem('permission_camera', 'granted');
      this.permissions.camera.status = 'granted';
      
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      
      localStorage.setItem('permission_camera', 'denied');
      this.permissions.camera.status = 'denied';
      
      return false;
    }
  }
  
  /**
   * طلب إذن الحافظة
   * @param {string} type - نوع الإذن (قراءة أو كتابة)
   * @returns {Promise<boolean>} - نجاح أو فشل الطلب
   */
  async requestClipboardPermission(type) {
    if (!navigator.clipboard) {
      console.warn('Clipboard API not supported');
      return false;
    }
    
    try {
      let granted = false;
      
      if (type === 'clipboard-read') {
        // محاولة قراءة الحافظة للتحقق من الإذن
        await navigator.clipboard.readText();
        granted = true;
      } else if (type === 'clipboard-write') {
        // محاولة الكتابة في الحافظة للتحقق من الإذن
        await navigator.clipboard.writeText('test');
        granted = true;
      }
      
      localStorage.setItem(`permission_${type}`, granted ? 'granted' : 'denied');
      this.permissions[type].status = granted ? 'granted' : 'denied';
      
      return granted;
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      
      localStorage.setItem(`permission_${type}`, 'denied');
      this.permissions[type].status = 'denied';
      
      return false;
    }
  }
  
  /**
   * طلب إذن التخزين
   * @returns {Promise<boolean>} - نجاح أو فشل الطلب
   */
  async requestStoragePermission() {
    if (!('storage' in navigator) || !navigator.storage.persist) {
      console.warn('Storage API not supported');
      return false;
    }
    
    try {
      const isPersisted = await navigator.storage.persist();
      
      localStorage.setItem('permission_storage', isPersisted ? 'granted' : 'denied');
      this.permissions.storage.status = isPersisted ? 'granted' : 'denied';
      
      return isPersisted;
    } catch (error) {
      console.error('Error requesting storage permission:', error);
      
      localStorage.setItem('permission_storage', 'denied');
      this.permissions.storage.status = 'denied';
      
      return false;
    }
  }
  
  /**
   * إرسال إشعار
   * @param {Object} options - خيارات الإشعار
   * @returns {Promise<boolean>} - نجاح أو فشل الإرسال
   */
  async sendNotification(options) {
    if (!this.serviceWorkerRegistration) {
      console.warn('Service Worker not registered');
      return false;
    }
    
    try {
      await this.serviceWorkerRegistration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/logo1.jpg',
        badge: options.badge || '/logo1.jpg',
        tag: options.tag,
        vibrate: options.vibrate || [100, 50, 100],
        data: options.data || {}
      });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }
  
  /**
   * جدولة إشعار
   * @param {Object} options - خيارات الإشعار
   * @param {number} delay - التأخير بالميلي ثانية
   * @returns {Promise<boolean>} - نجاح أو فشل الجدولة
   */
  async scheduleNotification(options, delay) {
    if (!this.serviceWorkerRegistration) {
      console.warn('Service Worker not registered');
      return false;
    }
    
    try {
      // إرسال رسالة إلى Service Worker لجدولة الإشعار
      await this.sendMessageToSW({
        type: 'SCHEDULE_NOTIFICATION',
        title: options.title,
        options: {
          body: options.body,
          icon: options.icon || '/logo1.jpg',
          badge: options.badge || '/logo1.jpg',
          tag: options.tag,
          vibrate: options.vibrate || [100, 50, 100],
          data: options.data || {}
        },
        delay
      });
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }
  
  /**
   * تعيين فاصل زمني للإشعارات
   * @param {number} hours - عدد الساعات
   * @returns {Promise<boolean>} - نجاح أو فشل التعيين
   */
  async setNotificationInterval(hours) {
    if (!this.serviceWorkerRegistration) {
      console.warn('Service Worker not registered');
      return false;
    }
    
    try {
      await this.sendMessageToSW({
        type: 'SET_NOTIFICATION_INTERVAL',
        hours
      });
      return true;
    } catch (error) {
      console.error('Error setting notification interval:', error);
      return false;
    }
  }
  
  /**
   * التحقق من حالة الاتصال
   * @returns {Promise<boolean>} - حالة الاتصال
   */
  async checkConnectivity() {
    if (!this.serviceWorkerRegistration) {
      // في حالة عدم وجود Service Worker، استخدم navigator.onLine
      return navigator.onLine;
    }
    
    try {
      const result = await this.sendMessageToSW({ type: 'CHECK_CONNECTIVITY' });
      return result && result.online;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return navigator.onLine;
    }
  }
  
  /**
   * إرسال رسالة إلى Service Worker
   * @param {Object} message - الرسالة
   * @returns {Promise<any>} - الرد
   */
  async sendMessageToSW(message) {
    if (!this.serviceWorkerRegistration) {
      console.error('Service Worker is not registered');
      return null;
    }
    
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };
      
      this.serviceWorkerRegistration.active.postMessage(message, [messageChannel.port2]);
    });
  }
}

// إنشاء نسخة واحدة وتخزينها في window
window.addEventListener('load', () => {
  if (!window.appPermissions) {
    window.appPermissions = new AppPermissions();
  }
}); 