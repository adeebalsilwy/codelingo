'use client';

import Link from "next/link";
import Image from "next/image";
import {
  ClerkLoading,
  ClerkLoaded,
  UserButton,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n/client";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";

import { SidebarItem } from "./sidebar-item";

type Props = {
  className?: string;
};

export const Sidebar = ({ className }: Props) => {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  
  return (
    <div className={cn(
      "flex h-full lg:w-[256px] lg:fixed top-0 border-r-2 flex-col",
      isRtl ? "lg:right-0 border-l-2 border-r-0" : "lg:left-0",
      className,
    )}>
      <Link href="/learn">
        <div className={cn(
          "pt-8 pb-7 flex items-center gap-x-3",
          isRtl ? "pr-4" : "pl-4"
        )}>
          <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
          <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
            {t('app.title')}
          </h1>
        </div>
      </Link>
      <div className="flex flex-col gap-y-2 flex-1">
        <SidebarItem 
          label={t('nav.learn')} 
          href="/learn"
          iconSrc="/learn.svg"
          isRtl={isRtl}
        />
        <SidebarItem 
          label={t('nav.leaderboard')} 
          href="/leaderboard"
          iconSrc="/leaderboard.svg"
          isRtl={isRtl}
        />
        <SidebarItem 
          label={t('nav.quests')} 
          href="/quests"
          iconSrc="/quests.svg"
          isRtl={isRtl}
        />
        <SidebarItem 
          label={t('nav.shop')} 
          href="/shop"
          iconSrc="/shop.svg"
          isRtl={isRtl}
        />
        <SidebarItem 
          label={t('nav.code_editor')} 
          href="/code-editor"
          iconSrc="/code.svg"
          isRtl={isRtl}
        />
        <SidebarItem 
          label={t('nav.chat')} 
          href="/chat"
          iconSrc="/chat.svg"
          isRtl={isRtl}
        />
      </div>
      <div className="p-4 flex items-center justify-between">
        <div className={isRtl ? "order-last" : ""}>
          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
          </ClerkLoaded>
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  );
};
