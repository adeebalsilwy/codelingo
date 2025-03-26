'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useI18n } from '@/app/i18n/client';
import { cn } from '@/lib/utils';

export const SettingsBar = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, dir } = useI18n();
  const [showLanguages, setShowLanguages] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const changeLanguage = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    setShowLanguages(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className="w-16 md:w-20 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 h-[calc(100vh-4rem)] sticky top-16 z-20">
      <div className="h-full py-4 flex flex-col items-center gap-4">
        {/* Theme Toggle */}
        <div className="w-full px-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="w-full aspect-square rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'dark' ? t('theme.enableLight') : t('theme.enableDark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-blue-500" />
            )}
          </Button>
        </div>
        
        {/* Language Selector */}
        <div className="w-full px-3 relative">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowLanguages(!showLanguages)}
            className="w-full aspect-square rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={t('app.language')}
          >
            <Languages className="h-5 w-5 text-primary" />
          </Button>
          
          {showLanguages && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowLanguages(false)}
              />
              
              {/* Language Menu */}
              <div 
                className={cn(
                  "absolute top-0 min-w-[160px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50",
                  dir === 'rtl' ? "right-full mr-3" : "left-full ml-3"
                )}
              >
                <button 
                  onClick={() => changeLanguage('ar')}
                  className={cn(
                    "w-full px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-3",
                    language === 'ar' ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300",
                    dir === 'rtl' ? "flex-row" : "flex-row-reverse"
                  )}
                  dir="rtl"
                >
                  <span className="flex-1 text-right">العربية</span>
                  {language === 'ar' && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
                <button 
                  onClick={() => changeLanguage('en')}
                  className={cn(
                    "w-full px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-3",
                    language === 'en' ? "text-primary font-medium" : "text-gray-700 dark:text-gray-300"
                  )}
                  dir="ltr"
                >
                  <span className="flex-1">English</span>
                  {language === 'en' && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Version */}
        <div className="w-full px-3">
          <div className="text-center py-2 text-xs text-gray-400 dark:text-gray-500 font-medium">
            v0.1.4
          </div>
        </div>
      </div>
    </aside>
  );
}; 