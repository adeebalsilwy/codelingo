'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import { useI18n } from "@/app/i18n/client";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useIsAdmin } from "@/lib/admin-client";

interface HeroSectionProps {
  courses: any[];
}

export default function HeroSection({ courses }: HeroSectionProps) {
  const { language } = useI18n();
  const isAdminUser = useIsAdmin();

  return (
    <>
      <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8">
        <Image src="/hero-programming.svg" fill alt={language === 'ar' ? 'صورة البرمجة' : 'Programming Hero'} />
      </div>
      
      <div className="flex flex-col items-center gap-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl lg:text-6xl font-bold text-neutral-800 max-w-[720px] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Edu PRO: {`{`}
            <span className="font-extrabold">
              {language === 'ar' ? 'تعلم البرمجة' : 'Learn Programming'}
            </span>
            {`}`}
          </h1>
          <p className="text-lg text-neutral-600 max-w-[640px] leading-relaxed">
            {language === 'ar' 
              ? 'أتقن لغات البرمجة من خلال الدروس التفاعلية وتمارين البرمجة العملية والمشاريع الواقعية.'
              : 'Master programming languages through interactive lessons, hands-on coding exercises, and real-world projects.'}
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <SignedIn>
              <Link href="/learn">
                <Button size="lg" variant="primary" className="text-lg px-8">
                  {language === 'ar' ? 'متابعة التعلم' : 'Continue Learning'}
                </Button>
              </Link>
              {isAdminUser && (
                <Link href="/admin">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
                  </Button>
                </Link>
              )}
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal" afterSignInUrl="/learn" afterSignUpUrl="/learn">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  {language === 'ar' ? 'ابدأ التعلم' : 'Start Learning'}
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1000px]">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col gap-4 border border-neutral-200 hover:border-primary/20 hover:scale-105"
            >
              <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                <Image 
                  src={course.imageSrc || "/course-placeholder.png"} 
                  fill
                  className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  alt={course.title}
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-neutral-800">{course.title}</h3>
                {course.description && (
                  <p className="text-neutral-600 text-sm line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 mt-auto pt-4">
                <div className="flex items-center gap-1 text-sm text-neutral-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.lessonsCount || 0} {language === 'ar' ? 'درس' : 'Lessons'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-neutral-600">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration || '2h'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 