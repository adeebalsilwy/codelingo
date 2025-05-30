'use client';

import { useEffect, useState } from 'react';
import { I18nProvider } from "@/app/i18n/client";
import { ThemeProvider } from "@/app/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // تحديث الـ manifest والاتجاه بناءً على اللغة المحفوظة
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'ar') {
      document.getElementById('manifest-link')?.setAttribute('href', '/manifest-ar.json');
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    } else {
      document.getElementById('manifest-link')?.setAttribute('href', '/manifest.json');
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  }, [mounted]);

  return (
    <ThemeProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
} 