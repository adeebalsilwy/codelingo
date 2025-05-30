'use client';

import { useI18n } from "@/app/i18n/client";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  hasLogo?: boolean;
};

export const Header = ({ title, hasLogo = false }: Props) => {
  const { language } = useI18n();

  return (
    <header className="h-20 w-full border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-10 bg-background">
      <div className="flex items-center gap-x-4">
        {hasLogo && (
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-10">
              <Image 
                src="/logo1.jpg"
                alt="Logo" 
                fill
                className="rounded-md object-cover"
              />
            </div>
            <span className="ml-2 font-bold text-xl">
              {language === 'ar' ? 'إيدو برو' : 'Edu PRO'}
            </span>
          </Link>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-x-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  );
}; 