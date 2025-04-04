'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import { useI18n } from "@/app/i18n/client";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroSectionProps {
  courses: any[];
}

export default function HeroSection({ courses }: HeroSectionProps) {
  const { language } = useI18n();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse bg-gray-200 rounded-lg h-[180px] w-[180px] sm:h-[240px] sm:w-[240px] mb-6 sm:mb-8"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-8 sm:h-12 w-[250px] sm:w-[300px] mb-3 sm:mb-4"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-6 sm:h-8 w-[200px] sm:w-[250px] mb-6 sm:mb-8"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-8 sm:h-10 w-[150px] sm:w-[180px]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] lg:w-[424px] lg:h-[424px] mb-6 sm:mb-8">
        <Image src="/hero-programming.svg" fill alt={language === 'ar' ? 'صورة البرمجة' : 'Programming Hero'} />
      </div>
      
      <div className="flex flex-col items-center gap-y-4 sm:gap-y-8 text-center">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl lg:text-6xl font-bold text-neutral-800 max-w-[720px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Edu PRO: {`{`}
            <span className="font-extrabold">
              {language === 'ar' ? 'تعلم البرمجة' : 'Learn Programming'}
            </span>
            {`}`}
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 max-w-[640px] leading-relaxed px-2 sm:px-0">
            {language === 'ar' 
              ? 'أتقن لغات البرمجة من خلال الدروس التفاعلية وتمارين البرمجة العملية والمشاريع الواقعية.'
              : 'Master programming languages through interactive lessons, hands-on coding exercises, and real-world projects.'}
          </p>
          <div className="flex justify-center gap-4 pt-3 sm:pt-4">
            <SignedOut>
              <SignInButton mode="modal" afterSignInUrl="/learn" afterSignUpUrl="/learn">
                <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 h-10 sm:h-auto">
                  {language === 'ar' ? 'ابدأ التعلم' : 'Start Learning'}
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {courses && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-[1000px] px-2 sm:px-4 lg:px-0">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 sm:p-4 lg:p-6 flex flex-col gap-3 sm:gap-4 border border-neutral-200 hover:border-primary/20 hover:scale-105"
              >
                <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                  <Image 
                    src={course.imageSrc || "/course-placeholder.png"} 
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                    alt={course.title}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-bold text-base sm:text-lg lg:text-xl text-neutral-800">{course.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 