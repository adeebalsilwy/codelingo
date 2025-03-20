'use client';

import { useI18n, Language } from "@/app/i18n/client";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "default" | "outline" | "ghost";
};

export const LanguageSwitcher = ({ variant = "ghost" }: Props) => {
  const { language, setLanguage, t, dir } = useI18n();
  const isRtl = dir === "rtl";

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="icon" 
          className={cn(
            "rounded-full bg-white/20",
            variant === "ghost" && "hover:bg-white/30 text-white"
          )}
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("app.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isRtl ? "start" : "end"}
        className={cn("dropdown-menu-content", isRtl ? "rtl" : "")}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "flex items-center gap-2",
              language === lang.code ? "font-bold" : "",
              isRtl ? "flex-row-reverse" : ""
            )}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
            {language === lang.code && (
              <span className={isRtl ? "mr-auto" : "ml-auto"}>✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 