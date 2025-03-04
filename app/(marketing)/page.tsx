import Image from "next/image";
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
export default async function Home() {
  const courses = await getCourses();
  // const { dir, language } = useI18n();
  // const isRtl = dir === "rtl";
  return (
    <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col items-center justify-center p-4 gap-8">
      <HeroSection courses={courses} />
     
    </div>
  );
}
