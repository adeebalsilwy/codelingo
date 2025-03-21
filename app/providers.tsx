'use client';

import { I18nProvider } from "@/app/i18n/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
} 