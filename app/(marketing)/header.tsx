'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader } from "lucide-react";
import { 
  ClerkLoaded, 
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useI18n } from "@/app/i18n/client";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/lib/admin-client";

export const Header = () => {
  const { dir, language } = useI18n();
  const isRtl = dir === "rtl";
  const isAdminUser = useIsAdmin();

  return (
    <header className="h-20 w-full border-b-2 border-slate-200 px-4">
      <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-x-3",
            isRtl ? "order-1 lg:order-none" : ""
          )}
        >
          <Image src="/logo1.jpg" height={40} width={40} alt="Edu PRO Logo" className="rounded-lg" />
          <h1 className="text-2xl font-extrabold text-primary tracking-wide hidden sm:block">
            Edu PRO
          </h1>
        </Link>
      
        <div className={cn(
          "flex items-center gap-4",
          isRtl ? "order-0 lg:order-none" : ""
        )}>
          <div className="flex justify-center gap-4 pt-4">
            <SignedIn>
              <Link href="/learn">
                <Button size="sm" variant="secondary">
                  {language === 'ar' ? 'متابعة التعلم' : 'Continue Learning'}
                </Button>
              </Link>
              {isAdminUser && (
                <Link href="/admin">
                  <Button size="sm" variant="primary">
                    {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
                  </Button>
                </Link>
              )}
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" afterSignInUrl="/learn" afterSignUpUrl="/learn">
                <Button size="sm" variant="primary">
                  {language === 'ar' ? 'ابدأ التعلم' : 'Start Learning'}
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
          <LanguageSwitcher />

          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
              />
            </SignedIn>
            <SignedOut>
              <SignInButton
                mode="modal"
                afterSignInUrl="/learn"
                afterSignUpUrl="/learn"
              >
                <Button 
                  size="lg" 
                  variant="ghost"
                  className={cn(
                    language === 'ar' ? 'font-arabic' : '',
                    "sm:flex hidden"
                  )}
                >
                  {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Button>
              </SignInButton>
              <SignInButton
                mode="modal"
                afterSignInUrl="/learn"
                afterSignUpUrl="/learn"
              >
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="sm:hidden flex"
                >
                  {language === 'ar' ? 'د' : 'L'}
                </Button>
              </SignInButton>
            </SignedOut>
          </ClerkLoaded>
        </div>

      </div>
    </header>
  );
};
