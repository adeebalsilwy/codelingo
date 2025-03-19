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
    <footer className="w-full border-t-2 border-slate-200 py-8 px-4">
      {/* <div className="max-w-screen-lg mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          {language === 'ar' ? 'الدورات المتاحة' : 'Available Courses'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link 
              key={course.path} 
              href={course.path}
              className="group hover:scale-105 transition-transform duration-200"
            >
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-3">
                <div className="relative h-40">
                  <Image 
                    src={course.icon}
                    alt={course.name[language as keyof typeof course.name]}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {course.name[language as keyof typeof course.name]}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {course.description[language as keyof typeof course.description]}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center text-sm text-neutral-500 mt-8">
          <p className="mb-2">
            {language === 'ar' ? 'تعلم البرمجة بسهولة مع كودلينجو' : 'Learn Programming Easily with CodeLingo'}
          </p>
          <p>
            © {new Date().getFullYear()} CodeLingo
          </p>
        </div>
      </div> */}
    </footer>
  );
};
