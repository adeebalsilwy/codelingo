'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAdmin } from "@/lib/admin";
import { useI18n } from "@/app/i18n/client";

type Props = {
  title: string;
};

export const Header = ({ title }: Props) => {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const { language } = useI18n();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      setIsAdminUser(adminStatus);
    };
    checkAdminStatus();
  }, []);

  return (
    <div className="sticky top-0 bg-white pb-3 lg:pt-[28px] lg:mt-[-28px] flex items-center justify-between border-b-2 mb-5 text-neutral-400 lg:z-50">
      <Link href="/courses">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-5 w-5 stroke-2 text-neutral-400" />
        </Button>
      </Link>
      <h1 className="font-bold text-lg">
        {title}
      </h1>
      {isAdminUser ? (
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <Settings className="h-5 w-5 stroke-2" />
            <span className="ml-2 hidden sm:inline">
              {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
            </span>
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
};
