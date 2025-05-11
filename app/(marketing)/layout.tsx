'use client';

import { Footer } from "./footer";
import { Header } from "./header";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

const MarketingLayout = ({ children }: Props) => {
  const { dir, language } = useI18n();
  const isRtl = dir === "rtl";

  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col",
        isRtl && "direction-rtl"
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default MarketingLayout;
