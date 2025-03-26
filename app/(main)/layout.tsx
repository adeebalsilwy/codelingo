'use client';

import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const MainLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { dir } = useI18n();
  const isRtl = dir === "rtl";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full">
        <div className="lg:hidden h-[50px]" />
        <div className="flex h-full">
          <div className="hidden lg:block w-[256px]" />
          <main className="flex-1 h-full pt-[50px] lg:pt-0">
            <div className="max-w-[1200px] mx-auto h-full px-4 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-full"
      dir={dir}
    >
      <MobileHeader />
      <div className="flex h-full">
        <Sidebar 
          className={cn(
            "hidden lg:flex h-full w-[256px] flex-col fixed inset-y-0 z-50",
            isRtl ? "right-0" : "left-0"
          )} 
        />
        <main 
          className={cn(
            "flex-1 h-full pt-[50px] lg:pt-0",
            isRtl ? "lg:pr-[256px]" : "lg:pl-[256px]"
          )}
        >
          <div className="max-w-[1200px] mx-auto h-full px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
