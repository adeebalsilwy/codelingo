'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  [key: string]: string;
}

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // General
    'app.title': 'Edu PRO',
    'app.description': 'Learn Programming Languages Easily',
    'app.language': 'Language',
    'app.loading': 'Loading...',
    'app.back': 'Back',
    'app.start': 'Start',
    'app.review': 'Review',
    'app.progress': 'Progress',
    'app.level': 'Level',
    
    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance & Language',
    'settings.permissions': 'Manage Permissions',
    'settings.info': 'App Information',
    'settings.connection': 'Connection Status',
    'settings.online': 'Online',
    'settings.offline': 'Offline',
    'settings.darkMode': 'Dark Mode',
    'settings.language': 'Arabic Language',
    'settings.direction': 'Application Direction',
    'settings.rtl': 'Right to Left',
    'settings.ltr': 'Left to Right',
    'settings.version': 'Version',
    'settings.pwa': 'Installed as PWA',
    'settings.account': 'Account Type',
    'settings.pro': 'Pro Account',
    'settings.free': 'Free Account',
    'settings.yes': 'Yes',
    'settings.no': 'No',
    
    // App updates
    'updates.title': 'App Updates',
    'updates.description': 'Check for new app updates and install them.',
    'updates.available': 'Available',
    'updates.upToDate': 'Up to date',
    'updates.check': 'Check for updates',
    'updates.updating': 'Updating...',
    'updates.requiresPWA': 'You need to install the app as a PWA to use the update feature',
    
    // Notification settings
    'notifications.title': 'Notification Settings',
    'notifications.description': 'Choose how often you want to receive reminder notifications.',
    'notifications.daily': 'Daily',
    'notifications.hours': 'hours',
    'notifications.frequency': 'You\'ll receive motivational notifications approximately every {hours} hours',
    'notifications.updated': 'Notifications updated',
    
    // Permissions
    'permissions.microphone': 'Microphone',
    'permissions.camera': 'Camera',
    'permissions.notifications': 'Notifications',
    'permissions.clipboard_read': 'Clipboard Read',
    'permissions.clipboard_write': 'Clipboard Write',
    'permissions.storage': 'Storage',
    'permissions.granted': 'Granted',
    'permissions.denied': 'Denied',
    'permissions.pending': 'Pending',
    'permissions.unknown': 'Unknown',
    'permissions.request': 'Request',
    'permissions.updated': 'Permission updated',
    'permissions.granted_success': 'Permission granted successfully',
    'permissions.denied_message': 'Permission was denied',
    'permissions.error': 'Error requesting permission',
    
    // Navigation
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.learn': 'Learn',
    'nav.admin': 'Admin',
    'nav.profile': 'Profile',
    'nav.leaderboard': 'Leaderboard',
    'nav.quests': 'Quests',
    'nav.shop': 'Shop',
    'nav.code_editor': 'Code Editor',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'theme.enableLight': 'Enable light mode',
    'theme.enableDark': 'Enable dark mode',
    
    // Units and Lessons
    'units.activeCourse': 'Active Course',
    'units.locked': 'Locked',
    'units.active': 'Current',
    'units.completed': 'Completed',
    'units.current': 'Current Lesson',
    'units.minutes': 'min',
    'units.challenges': 'challenges',
    'units.return': 'Return to Homepage',
    
    // Lessons Types
    'lessons.type.practice': 'Practice',
    'lessons.type.challenge': 'Challenge',
    'lessons.type.quiz': 'Quiz',
    
    // Courses
    'courses.title': 'Available Courses',
    'courses.start': 'Start Learning',
    'courses.continue': 'Continue',
    
    // Units
    'units.title': 'Units',
    'units.lessons': 'Lessons',
    
    // Chapters
    'chapters.title': 'Chapters',
    'chapters.lessons': 'lesson',
    'chapters.lessons_plural': 'lessons',
    'chapters.completed': 'completed',
    
    // Lessons
    'lessons.title': 'Lessons',
    'lessons.challenges': 'Challenges',
    'lessons.complete': 'Complete',
    'lessons.next': 'Next Lesson',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.courses': 'Courses',
    'admin.units': 'Units',
    'admin.chapters': 'Chapters',
    'admin.lessons': 'Lessons',
    'admin.challenges': 'Challenges',
    'admin.users': 'Users',
    
    // Admin Actions
    'admin.create': 'Create',
    'admin.edit': 'Edit',
    'admin.delete': 'Delete',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    'admin.search': 'Search',
    'admin.filter': 'Filter',
    
    // Admin Fields
    'admin.title': 'Title',
    'admin.description': 'Description',
    'admin.order': 'Order',
    'admin.content': 'Content',
    'admin.video': 'YouTube Video',
    'admin.unit': 'Unit',
    'admin.chapter': 'Chapter',
    'admin.course': 'Course',
    
    // Code Editor
    'editor.title': 'Code Editor',
    'editor.run': 'Run Code',
    'editor.clear': 'Clear',
    'editor.copy': 'Copy Code',
    'editor.language': 'Language',
    'editor.theme': 'Theme',
    'editor.placeholder': 'Write your code here...',
    'editor.output': 'Output',
    'editor.running': 'Running...',
    'editor.error': 'Error',
    'editor.success': 'Success',
    'editor.save': 'Save Code',
    'editor.share': 'Share Code',
    'editor.fullscreen': 'Fullscreen',
    'editor.exit_fullscreen': 'Exit Fullscreen',
    
    // Errors
    'error.notFound': 'Not Found',
    'error.unauthorized': 'Unauthorized',
    'error.somethingWrong': 'Something went wrong',
  },
  ar: {
    // General
    'app.title': 'إيدو برو',
    'app.description': 'تعلم لغات البرمجة بسهولة',
    'app.language': 'اللغة',
    'app.loading': 'جاري التحميل...',
    'app.back': 'عودة',
    'app.start': 'ابدأ',
    'app.review': 'مراجعة',
    'app.progress': 'التقدم',
    'app.level': 'المستوى',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.appearance': 'المظهر واللغة',
    'settings.permissions': 'إدارة الصلاحيات',
    'settings.info': 'معلومات التطبيق',
    'settings.connection': 'حالة الاتصال',
    'settings.online': 'متصل',
    'settings.offline': 'غير متصل',
    'settings.darkMode': 'الوضع المظلم',
    'settings.language': 'اللغة الإنجليزية',
    'settings.direction': 'اتجاه التطبيق',
    'settings.rtl': 'من اليمين إلى اليسار',
    'settings.ltr': 'من اليسار إلى اليمين',
    'settings.version': 'النسخة',
    'settings.pwa': 'مثبت كتطبيق PWA',
    'settings.account': 'نوع الحساب',
    'settings.pro': 'حساب مدفوع',
    'settings.free': 'حساب مجاني',
    'settings.yes': 'نعم',
    'settings.no': 'لا',
    
    // App updates
    'updates.title': 'تحديث التطبيق',
    'updates.description': 'تحقق من وجود تحديثات جديدة للتطبيق وقم بتثبيتها.',
    'updates.available': 'متاح',
    'updates.upToDate': 'محدث',
    'updates.check': 'التحقق من التحديثات',
    'updates.updating': 'جاري التحديث...',
    'updates.requiresPWA': 'يجب تثبيت التطبيق كتطبيق PWA لاستخدام ميزة التحديث',
    
    // Notification settings
    'notifications.title': 'إعدادات الإشعارات',
    'notifications.description': 'اختر عدد ساعات تكرار الإشعارات التذكيرية.',
    'notifications.daily': 'يوميًا',
    'notifications.hours': 'ساعات',
    'notifications.frequency': 'ستتلقى إشعارات تحفيزية كل {hours} ساعة تقريبًا',
    'notifications.updated': 'تم تحديث الإشعارات',
    
    // Permissions
    'permissions.microphone': 'الميكروفون',
    'permissions.camera': 'الكاميرا',
    'permissions.notifications': 'الإشعارات',
    'permissions.clipboard_read': 'قراءة الحافظة',
    'permissions.clipboard_write': 'كتابة الحافظة',
    'permissions.storage': 'التخزين',
    'permissions.granted': 'مسموح',
    'permissions.denied': 'محظور',
    'permissions.pending': 'معلق',
    'permissions.unknown': 'غير معروف',
    'permissions.request': 'طلب',
    'permissions.updated': 'تم تحديث الصلاحية',
    'permissions.granted_success': 'تم منح الصلاحية بنجاح',
    'permissions.denied_message': 'تم رفض الصلاحية',
    'permissions.error': 'خطأ في طلب الصلاحية',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.courses': 'الدورات',
    'nav.learn': 'تعلم',
    'nav.admin': 'الإدارة',
    'nav.profile': 'الملف الشخصي',
    'nav.leaderboard': 'المتصدرين',
    'nav.quests': 'المهام',
    'nav.shop': 'المتجر',
    'nav.code_editor': 'محرر الأكواد',
    
    // Theme
    'theme.light': 'فاتح',
    'theme.dark': 'داكن',
    'theme.system': 'تلقائي',
    'theme.enableLight': 'تفعيل الوضع الفاتح',
    'theme.enableDark': 'تفعيل الوضع الداكن',
    
    // Units and Lessons
    'units.activeCourse': 'الدورة الحالية',
    'units.locked': 'مقفل',
    'units.active': 'الحالي',
    'units.completed': 'مكتمل',
    'units.current': 'الدرس الحالي',
    'units.minutes': 'دقيقة',
    'units.challenges': 'تحديات',
    'units.return': 'العودة للصفحة الرئيسية',
    
    // Lessons Types
    'lessons.type.practice': 'تدريب',
    'lessons.type.challenge': 'تحدي',
    'lessons.type.quiz': 'اختبار',
    
    // Courses
    'courses.title': 'الدورات المتاحة',
    'courses.start': 'ابدأ التعلم',
    'courses.continue': 'استمر',
    
    // Units
    'units.title': 'الوحدات',
    'units.lessons': 'الدروس',
    
    // Chapters
    'chapters.title': 'الفصول',
    'chapters.lessons': 'درس',
    'chapters.lessons_plural': 'دروس',
    'chapters.completed': 'مكتمل',
    
    // Lessons
    'lessons.title': 'الدروس',
    'lessons.challenges': 'التحديات',
    'lessons.complete': 'إكمال',
    'lessons.next': 'الدرس التالي',
    
    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.courses': 'الدورات',
    'admin.units': 'الوحدات',
    'admin.chapters': 'الفصول',
    'admin.lessons': 'الدروس',
    'admin.challenges': 'التحديات',
    'admin.users': 'المستخدمين',
    
    // Admin Actions
    'admin.create': 'إنشاء',
    'admin.edit': 'تعديل',
    'admin.delete': 'حذف',
    'admin.save': 'حفظ',
    'admin.cancel': 'إلغاء',
    'admin.search': 'بحث',
    'admin.filter': 'تصفية',
    
    // Admin Fields
    'admin.title': 'العنوان',
    'admin.description': 'الوصف',
    'admin.order': 'الترتيب',
    'admin.content': 'المحتوى',
    'admin.video': 'فيديو يوتيوب',
    'admin.unit': 'الوحدة',
    'admin.chapter': 'الفصل',
    'admin.course': 'الدورة',
    
    // Code Editor
    'editor.title': 'محرر الأكواد',
    'editor.run': 'تشغيل الكود',
    'editor.clear': 'مسح',
    'editor.copy': 'نسخ الكود',
    'editor.language': 'اللغة',
    'editor.theme': 'المظهر',
    'editor.placeholder': 'اكتب الكود هنا...',
    'editor.output': 'النتيجة',
    'editor.running': 'جاري التشغيل...',
    'editor.error': 'خطأ',
    'editor.success': 'تم بنجاح',
    'editor.save': 'حفظ الكود',
    'editor.share': 'مشاركة الكود',
    'editor.fullscreen': 'ملء الشاشة',
    'editor.exit_fullscreen': 'إنهاء ملء الشاشة',
    
    // Errors
    'error.notFound': 'غير موجود',
    'error.unauthorized': 'غير مصرح',
    'error.somethingWrong': 'حدث خطأ ما',
  }
};

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  dir: 'ltr',
});

export const useI18n = () => useContext(I18nContext);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [dir, setDir] = useState<string>('ltr');

  useEffect(() => {
    // Check if there's a saved language preference
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
    } else {
      // Default to browser language if available and supported
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'ar') {
        setLanguageState('ar');
      }
    }
  }, []);

  useEffect(() => {
    // Update document direction based on language
    setDir(language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}; 