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
  const { t } = useI18n();
  const { isAdmin, loading } = useIsAdmin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routes = [
    {
      icon: "/learn.svg",
      label: t('nav.learn'),
      href: "/learn",
    },
    {
      icon: "/leaderboard.svg",
      label: t('nav.leaderboard'),
      href: "/leaderboard",
    },
    {
      icon: "/quests.svg",
      label: t('nav.quests'),
      href: "/quests",
    },
    {
      icon: "/shop.svg",
      label: t('nav.shop'),
      href: "/shop",
    },
    {
      icon: "/code.svg",
      label: t('nav.codeEditor'),
      href: "/code-editor",
    },
    {
      icon: "/mascot.svg",
      label: t('nav.chat'),
      href: "/chat",
    },
  ];

  // Only add admin route if we're mounted and admin status is confirmed
  if (mounted && isAdmin) {
    routes.push({
      icon: "/next.svg",
      label: t('nav.admin'),
      href: "/admin",
    });
  }

  if (!mounted) {
    return (
      <div className={cn(
        "flex h-full lg:flex-col lg:space-x-0 lg:space-y-4 items-center justify-center",
        className
      )}>
        <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex h-full lg:flex-col lg:space-x-0 lg:space-y-4",
      className
    )}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center justify-center lg:justify-start text-muted-foreground text-xs lg:text-sm font-medium p-1.5 lg:p-3 hover:text-primary hover:bg-primary/10 rounded-lg transition-all",
            pathname === route.href && "text-primary bg-primary/10"
          )}
        >
          <div className="relative h-5 w-5 lg:mr-2">
            <Image
              src={route.icon}
              alt={route.label}
              fill
              className="object-contain"
            />
          </div>
          <span className="hidden lg:block">
            {route.label}
          </span>
        </Link>
      ))}
    </div>
  );
};
