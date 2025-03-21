'use client';

import { Settings } from "lucide-react";
import { useI18n } from "@/app/i18n/client";
import { useIsAdmin } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  title: string;
};

export const Header = ({ title }: Props) => {
  const { language } = useI18n();
  const { isAdmin } = useIsAdmin();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold">
        {title}
      </h1>
      {isAdmin && (
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <Settings className="h-5 w-5 stroke-2" />
            <span className="ml-2 hidden sm:inline">
              {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
            </span>
          </Button>
        </Link>
      )}
    </div>
  );
};
