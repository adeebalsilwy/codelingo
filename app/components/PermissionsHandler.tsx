'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/app/i18n/client';

interface PermissionType {
  name: 'camera' | 'microphone' | 'clipboard-read' | 'clipboard-write' | 'storage';
  icon: React.ReactNode;
}

export const PermissionsHandler = () => {
  const { language } = useI18n();
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<PermissionType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // معرفة ما إذا كانت الأذونات مدعومة في المتصفح
  const isPermissionSupported = (name: string): boolean => {
    if (typeof navigator === 'undefined') return false;
    return !!navigator.permissions;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // تحقق من وضع التطبيق (هل تم تثبيته كـ PWA أم لا)
    const isInstalledPWA = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;

    if (!isInstalledPWA) return;

    // قائمة الأذونات المهمة للتطبيق بعد التثبيت
    const checkPermissions = async () => {
      // التحقق من كل إذن على حدة بترتيب الأولوية
      await checkPermission('clipboard-write');
      await checkPermission('clipboard-read');
      await checkPermission('microphone');
      await checkPermission('camera');
    };

    // فحص حالة الإذن والسؤال عنه إذا لم يتم تحديده مسبقًا
    const checkPermission = async (permName: PermissionType['name']) => {
      try {
        // تخطي إذا تم السؤال من قبل (في localStorage)
        const hasAsked = localStorage.getItem(`permission_${permName}_asked`);
        if (hasAsked) return;

        // تحقق من دعم الأذونات في المتصفح
        if (!isPermissionSupported(permName)) return;

        // التحقق من حالة الإذن
        const permStatus = await navigator.permissions.query({ name: permName as PermissionName });

        // إذا كانت الحالة غير محددة، عرض الطلب
        if (permStatus.state === 'prompt') {
          // تنفيذ الطلب المناسب بناءً على نوع الإذن
          setCurrentPermission({
            name: permName,
            icon: getIconForPermission(permName)
          });
          setShowPrompt(true);
          return;
        }

        // تسجيل أن السؤال تم بغض النظر عن النتيجة
        localStorage.setItem(`permission_${permName}_asked`, 'true');
        localStorage.setItem(`permission_${permName}_status`, permStatus.state);
      } catch (error) {
        console.error(`خطأ في فحص إذن ${permName}:`, error);
      }
    };

    // تنفيذ فحص الأذونات بعد فترة قصيرة من تحميل الصفحة
    const timer = setTimeout(() => {
      checkPermissions();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // الحصول على أيقونة مناسبة لنوع الإذن
  const getIconForPermission = (permName: PermissionType['name']) => {
    switch (permName) {
      case 'camera':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        );
      case 'microphone':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        );
      case 'clipboard-read':
      case 'clipboard-write':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        );
    }
  };

  // معالجة طلب الإذن
  const handleRequestPermission = async () => {
    if (!currentPermission) return;
    setIsProcessing(true);

    try {
      let granted = false;

      switch (currentPermission.name) {
        case 'camera':
          // طلب إذن الكاميرا
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoStream.getTracks().forEach(track => track.stop());
          granted = true;
          break;
        case 'microphone':
          // طلب إذن الميكروفون
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getTracks().forEach(track => track.stop());
          granted = true;
          break;
        case 'clipboard-read':
        case 'clipboard-write':
          // طلب إذن الحافظة
          try {
            // اختبار الكتابة للحافظة
            if (currentPermission.name === 'clipboard-write') {
              await navigator.clipboard.writeText('تجربة صلاحية الكتابة للحافظة');
              granted = true;
            } else {
              // تحسين طريقة طلب إذن القراءة من الحافظة
              try {
                // محاولة استخدام واجهة Permissions API أولاً
                const permissionStatus = await navigator.permissions.query({
                  name: 'clipboard-read' as PermissionName
                });
                
                if (permissionStatus.state === 'granted') {
                  granted = true;
                } else if (permissionStatus.state === 'prompt') {
                  // إذا كان الإذن في حالة الطلب، نحاول القراءة لتحفيز ظهور الطلب
                  try {
                    const text = await navigator.clipboard.readText();
                    granted = true;
                  } catch (readError) {
                    console.log('طلب إذن القراءة من الحافظة قيد المعالجة', readError);
                  }
                }
              } catch (permissionError) {
                console.warn('واجهة Permissions API غير مدعومة للحافظة، محاولة القراءة المباشرة');
                // محاولة مباشرة لقراءة الحافظة
                try {
                  const text = await navigator.clipboard.readText();
                  granted = true;
                } catch (readError) {
                  console.warn('فشلت قراءة الحافظة المباشرة:', readError);
                }
              }
            }
          } catch (e) {
            console.error('خطأ في اختبار صلاحية الحافظة:', e);
          }
          break;
      }

      // تسجيل حالة الإذن
      localStorage.setItem(`permission_${currentPermission.name}_asked`, 'true');
      localStorage.setItem(`permission_${currentPermission.name}_status`, granted ? 'granted' : 'denied');
    } catch (error) {
      console.error(`فشل في طلب إذن ${currentPermission.name}:`, error);
    } finally {
      setIsProcessing(false);
      setShowPrompt(false);
      setCurrentPermission(null);
    }
  };

  // تخطي طلب الإذن
  const handleSkip = () => {
    if (currentPermission) {
      localStorage.setItem(`permission_${currentPermission.name}_asked`, 'true');
    }
    setShowPrompt(false);
    setCurrentPermission(null);
  };

  if (!showPrompt || !currentPermission) return null;

  // تحديد نص العرض بناءً على نوع الإذن
  const getTitleText = (): string => {
    if (language === 'ar') {
      switch (currentPermission.name) {
        case 'camera': return 'السماح بالوصول إلى الكاميرا';
        case 'microphone': return 'السماح بالوصول إلى الميكروفون';
        case 'clipboard-read': return 'السماح بقراءة الحافظة';
        case 'clipboard-write': return 'السماح بالكتابة إلى الحافظة';
        default: return 'طلب إذن';
      }
    } else {
      switch (currentPermission.name) {
        case 'camera': return 'Allow Camera Access';
        case 'microphone': return 'Allow Microphone Access';
        case 'clipboard-read': return 'Allow Clipboard Reading';
        case 'clipboard-write': return 'Allow Clipboard Writing';
        default: return 'Permission Request';
      }
    }
  };

  const getDescriptionText = (): string => {
    if (language === 'ar') {
      switch (currentPermission.name) {
        case 'camera': return 'يحتاج التطبيق إلى الوصول للكاميرا لإتمام بعض المهام كتصوير الواجبات والمشاركة في الفصول الافتراضية.';
        case 'microphone': return 'يحتاج التطبيق إلى الوصول للميكروفون للمشاركة الصوتية في الفصول الافتراضية ومهام التحدث.';
        case 'clipboard-read': return 'يحتاج التطبيق إلى قراءة الحافظة لتسهيل نسخ الأكواد والنصوص من مصادر أخرى.';
        case 'clipboard-write': return 'يحتاج التطبيق إلى الكتابة للحافظة لتسهيل نسخ الأكواد والنصوص إلى تطبيقات أخرى.';
        default: return 'يحتاج التطبيق إلى هذا الإذن لتوفير تجربة أفضل.';
      }
    } else {
      switch (currentPermission.name) {
        case 'camera': return 'The app needs camera access to complete tasks like photographing assignments and participating in virtual classes.';
        case 'microphone': return 'The app needs microphone access for voice participation in virtual classes and speaking tasks.';
        case 'clipboard-read': return 'The app needs to read from clipboard to facilitate copying code and text from other sources.';
        case 'clipboard-write': return 'The app needs to write to clipboard to facilitate copying code and text to other applications.';
        default: return 'The app needs this permission to provide a better experience.';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleSkip}>
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          {currentPermission.icon}
          <h3 className="text-xl font-bold text-foreground">
            {getTitleText()}
          </h3>
        </div>
        
        <p className="text-muted-foreground mb-4">
          {getDescriptionText()}
        </p>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            disabled={isProcessing}
          >
            {language === 'ar' ? 'لاحقاً' : 'Later'}
          </button>
          <button
            onClick={handleRequestPermission}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {language === 'ar' ? 'جارٍ المعالجة...' : 'Processing...'}
              </span>
            ) : (
              language === 'ar' ? 'السماح' : 'Allow'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 