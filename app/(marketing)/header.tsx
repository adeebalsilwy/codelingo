'use client';

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

export const Header = () => {
  const { dir, language } = useI18n();
  const isRtl = dir === "rtl";

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
          <Image src="/mascot.svg" height={40} width={40} alt="CodeLingo Mascot" />
          <h1 className="text-2xl font-extrabold text-green-600 tracking-wide hidden sm:block">
            CodeLingo
          </h1>
        </Link>

        <div className={cn(
          "flex items-center gap-4",
          isRtl ? "order-0 lg:order-none" : ""
        )}>
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
