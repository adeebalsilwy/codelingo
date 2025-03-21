'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useI18n } from "@/app/i18n/client";
import { useIsAdmin } from "@/lib/admin-client";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  className?: string;
};

export const Sidebar = ({ className }: Props) => {
  const pathname = usePathname();
  const { t, language } = useI18n();
  const { isAdmin, loading } = useIsAdmin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routes = [
    {
      icon: "/courses.svg",
      label: t('nav.courses'),
      href: "/courses",
      color: "text-yellow-500"
    },
    {
      icon: "/learn.svg",
      label: t('nav.learn'),
      href: "/learn",
      color: "text-sky-500"
    },
    {
      icon: "/leaderboard.svg",
      label: t('nav.leaderboard'),
      href: "/leaderboard",
      color: "text-violet-500"
    },
    {
      icon: "/quests.svg",
      label: t('nav.quests'),
      href: "/quests",
      color: "text-orange-500"
    },
    {
      icon: "/shop.svg",
      label: t('nav.shop'),
      href: "/shop",
      color: "text-emerald-500"
    },
    {
      icon: "/code.svg",
      label: t('nav.codeEditor'),
      href: "/code-editor",
      color: "text-blue-500"
    },
    {
      icon: "/mascot.svg",
      label: t('nav.chat'),
      href: "/chat",
      color: "text-pink-500"
    },
  ];

  if (mounted && isAdmin) {
    routes.push({
      icon: "/next.svg",
      label: t('nav.admin'),
      href: "/admin",
      color: "text-rose-500"
    });
  }

  if (!mounted) {
    return (
      <div className={cn(
        "flex h-full items-center justify-center",
        className
      )}>
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-y-2",
      className
    )}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-x-4 text-muted-foreground text-sm font-medium p-3",
            "hover:text-foreground hover:bg-primary/5 rounded-lg transition-all",
            "active:scale-[0.98]",
            pathname === route.href && "text-foreground bg-primary/5",
            route.color
          )}
        >
          <div className="relative h-5 w-5 shrink-0">
            <Image
              src={route.icon}
              alt={route.label}
              fill
              className="object-contain"
            />
          </div>
          <span className="truncate">
            {route.label}
          </span>
        </Link>
      ))}
    </div>
  );
};
