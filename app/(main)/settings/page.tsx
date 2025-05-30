'use client';

import { useState, useEffect } from 'react';
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Quests } from "@/components/quests";
import Image from "next/image";
import { useI18n } from "@/app/i18n/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  Mic, 
  Camera, 
  Clipboard, 
  Database, 
  Wifi, 
  WifiOff, 
  Moon, 
  Sun, 
  PanelRightOpen, 
  Languages,
  RefreshCw,
  Download
} from "lucide-react";
import { useTheme } from "next-themes";

interface PermissionStatus {
  microphone: string;
  camera: string;
  notifications: string;
  'clipboard-read': string;
  'clipboard-write': string;
  storage: string;
}

interface PermissionRequested {
  microphone: boolean;
  camera: boolean;
  notifications: boolean;
  'clipboard-read': boolean;
  'clipboard-write': boolean;
  storage: boolean;
}

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
    APP_VERSION?: {
      version: string;
      buildDate: string;
      changelog: {
        ar: string[];
        en: string[];
      };
      isDevelopment: boolean;
    };
  }
}

const SettingsPage = () => {
  const { language, setLanguage, dir, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [userProgress, setUserProgress] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>("1.0.0");
  const [buildDate, setBuildDate] = useState<string>("");
  const [permissions, setPermissions] = useState<PermissionStatus>({
    microphone: 'unknown',
    camera: 'unknown',
    notifications: 'unknown',
    'clipboard-read': 'unknown', 
    'clipboard-write': 'unknown',
    storage: 'unknown'
  });
  const [requested, setRequested] = useState<PermissionRequested>({
    microphone: false,
    camera: false,
    notifications: false,
    'clipboard-read': false,
    'clipboard-write': false,
    storage: false
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [notificationInterval, setNotificationInterval] = useState<number>(12);

  // تحميل بيانات المستخدم والاشتراك
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const progressResponse = await fetch('/api/user-progress');
        if (progressResponse.ok) {
          const progress = await progressResponse.json();
          setUserProgress(progress);
        }

        const subscriptionResponse = await fetch('/api/subscription');
        if (subscriptionResponse.ok) {
          const subscription = await subscriptionResponse.json();
          setUserSubscription(subscription);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // مراقبة حالة الاتصال بالإنترنت
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // التحقق من الصلاحيات الحالية
  useEffect(() => {
    const checkPermissions = async () => {
      if (window.appPermissions) {
        const permissionStatuses: Record<string, string> = {};
        const permissionRequested: Record<string, boolean> = {};

        for (const permission of Object.keys(permissions)) {
          permissionStatuses[permission] = await window.appPermissions.checkPermission(permission);
          permissionRequested[permission] = !!window.appPermissions.permissions[permission]?.requested;
        }

        setPermissions(prev => ({
          ...prev,
          ...permissionStatuses as any
        }));
        
        setRequested(prev => ({
          ...prev,
          ...permissionRequested as any
        }));
      }
    };

    // التحقق من حالة التثبيت
    setIsInstalled(
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true
    );

    checkPermissions();

    // استمع لتغييرات الصلاحيات
    const handlePermissionChange = (e: any) => {
      if (e.detail && e.detail.permission) {
        setPermissions(prev => ({
          ...prev,
          [e.detail.permission]: e.detail.state
        }));
      }
    };

    document.addEventListener('permissionchange', handlePermissionChange);
    
    return () => {
      document.removeEventListener('permissionchange', handlePermissionChange);
    };
  }, []);

  // التحقق من وجود تحديثات للتطبيق
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // استمع لأحداث تحديث Service Worker
      const handleUpdateFound = () => {
        console.log('Update found for service worker');
        setIsUpdateAvailable(true);
      };

      // التحقق من حالة التحديث عند تحميل الصفحة
      const checkForUpdates = async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && registration.waiting) {
            // هناك خدمة عامل جديدة في حالة الانتظار
            setIsUpdateAvailable(true);
          }
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      };

      // الاستماع لأحداث تحديث Service Worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isUpdating) {
          // تم تطبيق التحديث، أعد تحميل الصفحة
          window.location.reload();
        }
      });

      checkForUpdates();

      // الاستماع لأحداث التحديث من Service Worker الموجود
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.addEventListener('statechange', (event) => {
          if ((event.target as any).state === 'redundant') {
            // تم استبدال Service Worker، مما يعني أن هناك تحديثًا
            setIsUpdateAvailable(true);
          }
        });
      }

      return () => {
        // تنظيف مستمعي الأحداث عند إلغاء تركيب المكون
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.removeEventListener('statechange', () => {});
        }
        navigator.serviceWorker.removeEventListener('controllerchange', () => {});
      };
    }
  }, [isUpdating]);

  // طلب صلاحية معينة
  const requestPermission = async (permission: keyof PermissionStatus) => {
    if (!window.appPermissions) return;
    
    setLoading(prev => ({ ...prev, [permission]: true }));
    
    try {
      const success = await window.appPermissions.requestPermission(permission);
      const newStatus = await window.appPermissions.checkPermission(permission);
      
      setPermissions(prev => ({
        ...prev,
        [permission]: newStatus
      }));
      
      setRequested(prev => ({
        ...prev,
        [permission]: true
      }));
      
      toast({
        title: t('permissions.updated'),
        description: success
          ? t('permissions.granted_success')
          : t('permissions.denied_message'),
        variant: success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: t('permissions.error'),
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, [permission]: false }));
    }
  };

  // تغيير اللغة
  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    toast({
      title: newLanguage === 'ar' ? 'تم تغيير اللغة' : 'Language changed',
      description: newLanguage === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English',
    });
  };

  // تغيير المظهر (داكن/فاتح)
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    toast({
      title: language === 'ar' ? 'تم تغيير المظهر' : 'Theme changed',
      description: language === 'ar' 
        ? (newTheme === 'dark' ? 'تم تفعيل الوضع المظلم' : 'تم تفعيل الوضع الفاتح')
        : (newTheme === 'dark' ? 'Dark mode activated' : 'Light mode activated'),
    });
  };

  // تصيير واجهة الصلاحيات
  const renderPermissionStatus = (permission: keyof PermissionStatus) => {
    const status = permissions[permission];
    
    let statusText;
    let statusColor;
    
    switch (status) {
      case 'granted':
        statusText = t('permissions.granted');
        statusColor = 'text-green-500';
        break;
      case 'denied':
        statusText = t('permissions.denied');
        statusColor = 'text-red-500';
        break;
      case 'prompt':
        statusText = t('permissions.pending');
        statusColor = 'text-amber-500';
        break;
      default:
        statusText = t('permissions.unknown');
        statusColor = 'text-gray-500';
    }
    
    return (
      <span className={`text-sm font-medium ${statusColor}`}>
        {statusText}
      </span>
    );
  };

  // استخراج أيقونة لكل صلاحية
  const getPermissionIcon = (permission: keyof PermissionStatus) => {
    switch (permission) {
      case 'microphone':
        return <Mic className="h-5 w-5" />;
      case 'camera':
        return <Camera className="h-5 w-5" />;
      case 'notifications':
        return <Bell className="h-5 w-5" />;
      case 'clipboard-read':
      case 'clipboard-write':
        return <Clipboard className="h-5 w-5" />;
      case 'storage':
        return <Database className="h-5 w-5" />;
      default:
        return null;
    }
  };

  // استخراج اسم الصلاحية بلغة المستخدم
  const getPermissionName = (permission: keyof PermissionStatus) => {
    switch (permission) {
      case 'microphone':
        return t('permissions.microphone');
      case 'camera':
        return t('permissions.camera');
      case 'notifications':
        return t('permissions.notifications');
      case 'clipboard-read':
        return t('permissions.clipboard_read');
      case 'clipboard-write':
        return t('permissions.clipboard_write');
      case 'storage':
        return t('permissions.storage');
      default:
        return permission;
    }
  };

  // تحديث التطبيق
  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      // التحقق من وجود خدمة عامل مسجّلة
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration && registration.waiting) {
        // إرسال رسالة إلى خدمة العامل المنتظرة لتنشيطها
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        toast({
          title: language === 'ar' ? 'جاري التحديث...' : 'Updating...',
          description: language === 'ar' 
            ? 'سيتم إعادة تحميل التطبيق عند اكتمال التحديث'
            : 'The app will reload when the update is complete',
        });
      } else {
        // تحقق من التحديثات
        if (registration) {
          await registration.update();
          
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          } else {
            // لم يتم العثور على تحديثات
            toast({
              title: language === 'ar' ? 'لا توجد تحديثات' : 'No updates available',
              description: language === 'ar'
                ? 'التطبيق محدث بالفعل'
                : 'The app is already up to date',
            });
          }
        } else {
          // لم يتم العثور على خدمة عامل
          toast({
            title: language === 'ar' ? 'تعذر التحديث' : 'Update failed',
            description: language === 'ar'
              ? 'لم يتم العثور على خدمة العامل'
              : 'Service worker not found',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error updating the app:', error);
      toast({
        title: language === 'ar' ? 'خطأ في التحديث' : 'Update error',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // أضف استدعاء للحصول على الإصدار
  useEffect(() => {
    // التحقق من إصدار التطبيق
    if (typeof window !== 'undefined' && window.APP_VERSION) {
      setAppVersion(window.APP_VERSION.version);
      setBuildDate(window.APP_VERSION.buildDate);
    }

    // تحميل إعدادات الإشعارات من التخزين المحلي
    const savedInterval = localStorage.getItem('notificationInterval');
    if (savedInterval) {
      const hours = parseInt(savedInterval, 10);
      if (!isNaN(hours) && [3, 6, 12, 24].includes(hours)) {
        setNotificationInterval(hours);
      }
    }
  }, []);

  // تغيير وتيرة الإشعارات
  const handleNotificationIntervalChange = (hours: number) => {
    setNotificationInterval(hours);
    
    // حفظ في التخزين المحلي
    localStorage.setItem('notificationInterval', hours.toString());
    
    // Notify service worker about the change and trigger notification testing
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_NOTIFICATION_INTERVAL',
        hours
      });
      
      // Notification to test the new settings
      if (window.appPermissions) {
        const appPermissions = window.appPermissions; // Capture reference
        setTimeout(() => {
          appPermissions.sendNotification({
            title: language === 'ar' ? 'تم تحديث الإعدادات' : 'Settings Updated',
            body: language === 'ar' 
              ? `تم ضبط الإشعارات على كل ${hours} ساعة. سنبقيك على اطلاع!`
              : `Notifications set to every ${hours} hours. We'll keep you updated!`,
            tag: 'settings-update',
            data: { type: 'settings-update' }
          });
        }, 1500);
      }
      
      toast({
        title: language === 'ar' ? 'تم تحديث الإشعارات' : 'Notifications updated',
        description: language === 'ar'
          ? `ستصلك الإشعارات كل ${hours} ساعة`
          : `You'll receive notifications every ${hours} hours`,
      });
    }
  };

  // don't render anything while checking auth
  // التحقق من بعض المتطلبات قبل العرض
  
  const isPro = !!userSubscription?.isActive;

  return ( 
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        {userProgress && (
          <UserProgress
            activeCourseId={userProgress.activeCourseId}
            hearts={userProgress.hearts}
            points={userProgress.points}
            hasActiveSubscription={isPro}
          />
        )}
        {userProgress && (
          <Quests points={userProgress.points} />
        )}
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image
            src="/settings.svg"
            alt={t('settings.title')}
            height={90}
            width={90}
          />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
            {t('settings.title')}
          </h1>

          {/* حالة الاتصال */}
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {t('settings.connection')}
              </span>
            </div>
            <span className={isOnline ? 'text-green-500' : 'text-red-500'}>
              {isOnline 
                ? t('settings.online')
                : t('settings.offline')}
            </span>
          </div>

          {/* المظهر واللغة */}
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-lg mb-4">
              {t('settings.appearance')}
            </h2>
            
            <div className="space-y-4">
              {/* المظهر */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                  <Label htmlFor="theme-switch" className="font-medium">
                    {t('settings.darkMode')}
                  </Label>
                </div>
                <Switch
                  id="theme-switch"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
              
              {/* اللغة */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Languages className="h-5 w-5" />
                  <Label htmlFor="lang-switch" className="font-medium">
                    {t('settings.language')}
                  </Label>
                </div>
                <Switch
                  id="lang-switch"
                  checked={language === 'en'}
                  onCheckedChange={toggleLanguage}
                />
              </div>
              
              {/* اتجاه التطبيق */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PanelRightOpen className="h-5 w-5" />
                  <Label className="font-medium">
                    {t('settings.direction')}
                  </Label>
                </div>
                <span className="text-sm">
                  {dir === 'rtl' 
                    ? t('settings.rtl')
                    : t('settings.ltr')}
                </span>
              </div>
            </div>
          </div>

          {/* إدارة الصلاحيات */}
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-lg mb-4">
              {t('settings.permissions')}
            </h2>
            
            <div className="space-y-4">
              {(Object.keys(permissions) as Array<keyof PermissionStatus>).map((permission) => (
                <div key={permission} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPermissionIcon(permission)}
                    <Label className="font-medium">
                      {getPermissionName(permission)}
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    {renderPermissionStatus(permission)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => requestPermission(permission)}
                      disabled={loading[permission] || permissions[permission] === 'granted'}
                    >
                      {loading[permission] ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {t('app.loading')}
                        </span>
                      ) : permissions[permission] === 'granted' ? (
                        t('permissions.granted')
                      ) : (
                        t('permissions.request')
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* حالة التطبيق */}
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-lg mb-4">
              {t('settings.info')}
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {t('settings.version')}
                </span>
                <span className="text-sm">{appVersion}</span>
              </div>
              
              {/* {buildDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {language === 'ar' ? 'تاريخ الإصدار' : 'Build date'}
                  </span>
                  <span className="text-sm">{buildDate}</span>
                </div>
              )} */}
              
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {t('settings.pwa')}
                </span>
                <span className={`text-sm ${isInstalled ? 'text-green-500' : 'text-amber-500'}`}>
                  {isInstalled 
                    ? t('settings.yes')
                    : t('settings.no')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {t('settings.account')}
                </span>
                <span className={`text-sm ${isPro ? 'text-green-500' : 'text-gray-500'}`}>
                  {isPro 
                    ? t('settings.pro')
                    : t('settings.free')}
                </span>
              </div>
            </div>
          </div>

          {/* تحديث التطبيق */}
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-lg mb-4">
              {language === 'ar' ? 'تحديث التطبيق' : 'App Updates'}
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {language === 'ar'
                  ? 'تحقق من وجود تحديثات جديدة للتطبيق وقم بتثبيتها.'
                  : 'Check for new app updates and install them.'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {language === 'ar' ? 'التحديثات' : 'Updates'}
                  </span>
                </div>
                
                <div>
                  {isUpdateAvailable ? (
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 py-1 px-2 rounded-full font-medium">
                      {language === 'ar' ? 'متاح' : 'Available'}
                    </span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 py-1 px-2 rounded-full font-medium">
                      {language === 'ar' ? 'محدث' : 'Up to date'}
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleUpdate}
                disabled={isUpdating || !isInstalled}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{language === 'ar' ? 'جاري التحديث...' : 'Updating...'}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>{language === 'ar' ? 'التحقق من التحديثات' : 'Check for updates'}</span>
                  </>
                )}
              </Button>
              
              {!isInstalled && (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  {language === 'ar'
                    ? 'يجب تثبيت التطبيق كتطبيق PWA لاستخدام ميزة التحديث'
                    : 'You need to install the app as a PWA to use the update feature'}
                </p>
              )}
            </div>
          </div>

          {/* إعدادات الإشعارات */}
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-lg mb-4">
              {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {language === 'ar'
                  ? 'اختر عدد ساعات تكرار الإشعارات التذكيرية.'
                  : 'Choose how often you want to receive reminder notifications.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {[3, 6, 12, 24].map((hours) => (
                  <Button
                    key={hours}
                    variant={notificationInterval === hours ? 'default' : 'secondary'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleNotificationIntervalChange(hours)}
                  >
                    {hours === 24 
                      ? (language === 'ar' ? 'يوميًا' : 'Daily')
                      : `${hours} ${language === 'ar' ? 'ساعات' : 'hours'}`}
                  </Button>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                {language === 'ar'
                  ? `ستتلقى إشعارات تحفيزية كل ${notificationInterval} ساعة تقريبًا`
                  : `You'll receive motivational notifications approximately every ${notificationInterval} hours`}
              </p>
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};
 
export default SettingsPage; 