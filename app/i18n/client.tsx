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
    'app.description': 'Learn programming languages easily',
    'app.language': 'Language',
    
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