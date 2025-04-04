import { Language } from './client';
import { cookies, headers } from 'next/headers';

// Server-side translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    'app.title': 'Edu PRO',
    'app.description': 'Learn programming languages easily',
    
    // Navigation
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.learn': 'Learn',
    'nav.admin': 'Admin',
    
    // Units and Lessons
    'units.activeCourse': 'Active Course',
    'units.locked': 'Locked',
    'units.active': 'Current',
    'units.completed': 'Completed',
    'units.current': 'Current Lesson',
    'units.minutes': 'min',
    'units.challenges': 'challenges',
    'units.return': 'Return to Homepage',
    'units.progress': 'Course Progress',
    
    // Lessons
    'lessons.title': 'Lessons',
    'lessons.challenges': 'Challenges',
    'lessons.start': 'Start Lesson',
    'lessons.continue': 'Continue',
    'lessons.review': 'Review',
    
    // Chapters
    'chapters.title': 'Chapters',
    'chapters.lessons': 'lesson',
    'chapters.lessons_plural': 'lessons',
    'chapters.completed': 'completed',
    'chapters.read': 'Read Chapter',
    'chapters.watch': 'Watch Video',
    'chapters.practice': 'Practice',
    'chapters.loading': 'Loading chapter...',
  },
  ar: {
    // General
    'app.title': 'إيدو برو',
    'app.description': 'تعلم لغات البرمجة بسهولة',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.courses': 'الدورات',
    'nav.learn': 'تعلم',
    'nav.admin': 'الإدارة',
    
    // Units and Lessons
    'units.activeCourse': 'الدورة الحالية',
    'units.locked': 'مقفل',
    'units.active': 'الحالي',
    'units.completed': 'مكتمل',
    'units.current': 'الدرس الحالي',
    'units.minutes': 'دقيقة',
    'units.challenges': 'تحديات',
    'units.return': 'العودة للصفحة الرئيسية',
    'units.progress': 'تقدم الدورة',
    
    // Lessons
    'lessons.title': 'الدروس',
    'lessons.challenges': 'التحديات',
    'lessons.start': 'ابدأ الدرس',
    'lessons.continue': 'استمر',
    'lessons.review': 'مراجعة',
    
    // Chapters
    'chapters.title': 'الفصول',
    'chapters.lessons': 'درس',
    'chapters.lessons_plural': 'دروس',
    'chapters.completed': 'مكتمل',
    'chapters.read': 'قراءة الفصل',
    'chapters.watch': 'مشاهدة الفيديو',
    'chapters.practice': 'تدريب',
    'chapters.loading': 'جاري تحميل الفصل...',
  }
};

export async function getLanguage(): Promise<Language> {
  try {
    // Try to get language from cookies first
    const cookieStore = await cookies();
    const langCookie = cookieStore.get('language');
    
    if (langCookie?.value === 'ar' || langCookie?.value === 'en') {
      return langCookie.value as Language;
    }
    
    // Fallback to accept-language header
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';
    
    // Check if Arabic is in the accept-language header
    if (acceptLanguage.includes('ar')) {
      return 'ar';
    }
    
    // Default to English
    return 'en';
  } catch (error) {
    console.error('Error getting language:', error);
    return 'en';
  }
}

export async function getTranslation(key: string, lang?: Language): Promise<string> {
  const language = await getLanguage();
  return translations[lang || language][key] || key;
}

export async function getDirection(lang?: Language): Promise<string> {
  const language = await getLanguage();
  return (lang || language) === 'ar' ? 'rtl' : 'ltr';
}

export async function getDictionary(lang?: Language): Promise<Record<string, string>> {
  const language = await getLanguage();
  return translations[lang || language];
} 