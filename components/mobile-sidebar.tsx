import { Menu } from "lucide-react";
import { useI18n } from "@/app/i18n/client";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export const MobileSidebar = () => {
  const { dir, language } = useI18n();
  const isRtl = dir === "rtl";
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button 
          className={cn(
            "inline-flex items-center justify-center rounded-md p-2.5",
            "text-gray-700 dark:text-gray-300",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "transition-all duration-200",
            isRtl ? "ml-2" : "mr-2"
          )}
          aria-label={language === 'ar' ? 'فتح القائمة' : 'Open menu'}
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent 
        side={isRtl ? "right" : "left"}
        className={cn(
          "p-0 w-[280px] border-0",
          "flex flex-col h-full",
          "bg-white dark:bg-gray-900"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center gap-4 p-4",
          "border-b border-gray-200 dark:border-gray-800",
          isRtl ? "flex-row-reverse" : "flex-row"
        )}>
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/logo1.jpg"
              alt="Logo"
              fill
              className="object-contain rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h2 className={cn(
              "text-xl font-bold",
              "text-gray-900 dark:text-white",
              isRtl ? "text-right" : "text-left"
            )}>
              {language === 'ar' ? 'إيدو برو' : 'Edu PRO'}
            </h2>
            <p className={cn(
              "text-sm text-gray-500 dark:text-gray-400",
              isRtl ? "text-right" : "text-left"
            )}>
              {language === 'ar' ? 'منصة تعليمية' : 'Learning Platform'}
            </p>
          </div>
          <SheetClose className={cn(
            "rounded-md p-2",
            "text-gray-500 hover:text-gray-700",
            "dark:text-gray-400 dark:hover:text-gray-200",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "transition-colors duration-200"
          )}>
            <span className="sr-only">
              {language === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
            </span>
            ✕
          </SheetClose>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar 
            className={cn(
              "p-4",
              isRtl ? "rtl" : "ltr"
            )} 
          />
        </div>

        {/* Footer */}
        <div className={cn(
          "border-t border-gray-200 dark:border-gray-800",
          "p-4 bg-gray-50 dark:bg-gray-900"
        )}>
          <div className={cn(
            "text-sm text-gray-600 dark:text-gray-400",
            isRtl ? "text-right" : "text-left"
          )}>
            {language === 'ar' 
              ? 'تعلم البرمجة بسهولة وفعالية' 
              : 'Learn programming easily and effectively'}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
