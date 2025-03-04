import { Menu } from "lucide-react";
import { useI18n } from "@/app/i18n/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

export const MobileSidebar = () => {
  const { dir } = useI18n();
  const isRtl = dir === "rtl";
  
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="text-white" />
      </SheetTrigger>
      <SheetContent className="p-0 z-[100]" side={isRtl ? "right" : "left"}>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
