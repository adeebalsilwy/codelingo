import { MobileSidebar } from "./mobile-sidebar";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";

export const MobileHeader = () => {
  const { dir } = useI18n();
  const isRtl = dir === "rtl";

  return (
    <nav className="lg:hidden px-6 h-[50px] flex items-center justify-between bg-green-500 border-b fixed top-0 w-full z-50">
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
