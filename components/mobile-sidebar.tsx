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
import { useState } from "react";

export const MobileSidebar = () => {
  const { dir, language } = useI18n();
  const isRtl = dir === "rtl";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button 
          className={cn(
            "p-2 hover:bg-white/10 rounded-lg transition-all",
            isRtl ? "ml-2" : "mr-2"
          )}
        >
          <Menu className="text-white h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent 
        className={cn(
          "p-0 w-72 border-0 flex flex-col",
          isRtl ? "border-r" : "border-l",
          "bg-white dark:bg-gray-950"
        )} 
        side={isRtl ? "right" : "left"}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center gap-4 p-4 border-b",
          isRtl ? "flex-row-reverse" : "flex-row"
        )}>
          <div className="relative h-8 w-8">
            <Image
              src="/logo1.jpg"
              alt="Logo"
              fill
              className="object-contain rounded-md"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">
              {language === 'ar' ? 'إيدو برو' : 'Edu PRO'}
            </h2>
          </div>
          <SheetClose asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              {isRtl ? "✕" : "✕"}
            </button>
          </SheetClose>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Sidebar className="p-4" />
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className={cn(
            "text-xs text-muted-foreground",
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
