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

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm"
          className={cn(
            "rounded-lg bg-white/10 hover:bg-white/20 text-black flex items-center gap-2 px-3",
            variant === "ghost" && "hover:bg-white/30"
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="inline text-sm">
            {currentLanguage?.flag}
          </span>
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