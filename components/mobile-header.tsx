'use client';

import { MobileSidebar } from "./mobile-sidebar";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
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
      <nav className="lg:hidden px-6 h-[50px] flex items-center justify-between bg-blue-500 border-b fixed top-0 w-full z-50">
        <div className="flex items-center">
          <div className="w-8 h-8" /> {/* Placeholder for sidebar button */}
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8" /> {/* Placeholder for language switcher */}
        </div>
      </nav>
    );
  }

  return (
    <nav className="lg:hidden px-6 h-[50px] flex items-center justify-between bg-blue-500 border-b fixed top-0 w-full z-50">
      <div className={cn(
        "flex items-center",
        isRtl ? "order-last" : ""
      )}>
        <MobileSidebar />
      </div>
      <div className={cn(
        "flex items-center",
        isRtl ? "order-first" : ""
      )}>
        <LanguageSwitcher />
      </div>
    </nav>
  );
};
