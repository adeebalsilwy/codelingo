'use client';

import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({
  children,
}: Props) => {
  const { dir, language } = useI18n();
  const isRtl = dir === "rtl";

  useEffect(() => {
    // Set document language and direction
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  return (
    <>
      <MobileHeader />
      <Sidebar className="hidden lg:flex" />
      <main className={cn(
        "h-full pt-[50px] lg:pt-0",
        isRtl ? "lg:pr-[256px]" : "lg:pl-[256px]"
      )}>
        <div className="max-w-[1056px] mx-auto pt-6 h-full">
          {children}
        </div>
      </main>
    </>
  );
};
 
export default MainLayout;
