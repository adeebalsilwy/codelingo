import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { getCourses } from "@/db/queries";
import HeroSection from "./hero-section";
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
import { useI18n } from "@/app/i18n/client";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { cookies } from 'next/headers';

export default async function MarketingPage() {
  const { userId } = await auth();
  
  // // Redirect signed-in users to learn page
  // if (userId) {
  //   redirect("/");
  // }
  
  // Get courses for display
  const courses = await getCourses() || [];
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-6 bg-white">
      <HeroSection courses={courses.slice(0, 3)} />
    </main>
  );
}
