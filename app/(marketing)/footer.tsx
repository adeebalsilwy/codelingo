'use client';

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useI18n } from "@/app/i18n/client";
import Link from "next/link";

const courses = [
  {
    name: { en: "Python", ar: "بايثون" },
    description: { 
      en: "Learn Python Programming",
      ar: "تعلم برمجة بايثون"
    },
    icon: "/python-course.png",
    path: "/learn/python"
  },
  {
    name: { en: "JavaScript", ar: "جافاسكريبت" },
    description: { 
      en: "Master JavaScript Development",
      ar: "أتقن تطوير جافاسكريبت"
    },
    icon: "/javascript-course.png",
    path: "/learn/javascript"
  },
  {
    name: { en: "Java", ar: "جافا" },
    description: { 
      en: "Java Programming Fundamentals",
      ar: "أساسيات برمجة جافا"
    },
    icon: "/java-course.png",
    path: "/learn/java"
  }
];

export const Footer = () => {
  const { dir, language } = useI18n();
  const isRtl = dir === "rtl";

  return (
    <footer className="w-full border-t-2 border-slate-200 dark:border-slate-800 py-6 sm:py-8 px-2 sm:px-4">
      <div className="max-w-screen-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">
          {language === 'ar' ? 'الدورات المتاحة' : 'Available Courses'}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => (
            <Link 
              key={course.path} 
              href={course.path}
              className="group hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 border border-gray-100 dark:border-gray-700">
                <div className="relative h-32 sm:h-40">
                  <Image 
                    src={course.icon}
                    alt={course.name[language as keyof typeof course.name]}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-semibold text-base sm:text-lg">
                    {course.name[language as keyof typeof course.name]}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    {course.description[language as keyof typeof course.description]}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-6 sm:mt-8">
          <p className="mb-1 sm:mb-2">
            {language === 'ar' ? 'تعلم البرمجة بسهولة مع إيدو برو' : 'Learn Programming Easily with Edu PRO'}
          </p>
          <p>
            © {new Date().getFullYear()} Edu PRO
          </p>
        </div>
      </div>
    </footer>
  );
};
