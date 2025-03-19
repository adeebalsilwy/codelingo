import { Language } from './client';

// Server-side translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    'app.title': 'Lingo',
    'app.description': 'Learn programming languages easily',
    
    // Navigation
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.learn': 'Learn',
    'nav.admin': 'Admin',
    
    // Lessons
    'lessons.title': 'Lessons',
    
    // Chapters
    'chapters.title': 'Chapters',
    'chapters.lessons': 'lesson',
    'chapters.lessons_plural': 'lessons',
  },
  ar: {
    // General
    'app.title': 'لينجو',
    'app.description': 'تعلم لغات البرمجة بسهولة',
    
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.courses': 'الدورات',
    'nav.learn': 'تعلم',
    'nav.admin': 'الإدارة',
    
    // Lessons
    'lessons.title': 'الدروس',
    
    // Chapters
    'chapters.title': 'الفصول',
    'chapters.lessons': 'درس',
    'chapters.lessons_plural': 'دروس',
  }
};

export function getTranslation(key: string, lang: Language = 'en'): string {
  return translations[lang][key] || key;
}

export function getDirection(lang: Language = 'en'): string {
  return lang === 'ar' ? 'rtl' : 'ltr';
} 