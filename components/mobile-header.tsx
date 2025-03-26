'use client';

import { MobileSidebar } from "./mobile-sidebar";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const MobileHeader = () => {
  const [mounted, setMounted] = useState(false);
  const { dir } = useI18n();
  const isRtl = dir === "rtl";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className={cn(
        "lg:hidden fixed top-0 left-0 right-0",
        "h-16 px-4 z-50",
        "bg-white dark:bg-gray-900",
        "border-b border-gray-200 dark:border-gray-800"
      )}>
        <div className="flex h-full items-center justify-between">
          <div className="w-8 h-8" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8" />
            <div className="w-8 h-8" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn(
      "lg:hidden fixed top-0 left-0 right-0",
      "h-16 px-4 z-50",
      "bg-white dark:bg-gray-900",
      "border-b border-gray-200 dark:border-gray-800",
      "transition-colors duration-200"
    )}>
      <div className="flex h-full items-center justify-between max-w-[1400px] mx-auto">
        <div className={cn(
          "flex items-center",
          isRtl ? "order-last" : "order-first"
        )}>
          <MobileSidebar />
        </div>
        <div className={cn(
          "flex items-center gap-3",
          isRtl ? "order-first" : "order-last"
        )}>
          <ThemeToggle />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
};
