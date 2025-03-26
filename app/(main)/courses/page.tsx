'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

interface Course {
  id: number;
  title: string;
  imageSrc: string;
  description?: string;
  units: {
    id: number;
    title: string;
    lessons: {
      id: number;
      title: string;
      completed: boolean;
    }[];
  }[];
}

interface CourseProgress {
  courseId: number;
  progress: number;
  completed: boolean;
  lastActiveUnitId: number | null;
  lastLessonId: number | null;
}

interface UserProgress {
  activeCourseId: number | null;
  [key: string]: any;
}

const CoursesPage = () => {
  const router = useRouter();
  const { language, dir } = useI18n();
  const { isLoaded, isSignedIn } = useAuth();
  const isRtl = dir === 'rtl';
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [userProgressData, setUserProgressData] = useState<UserProgress | null>(null);
  const [userCourseProgresses, setUserCourseProgresses] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
      toast.error(
        language === 'ar'
          ? 'يجب تسجيل الدخول للوصول إلى الدورات'
          : 'You must be logged in to access courses'
      );
    }
  }, [isLoaded, isSignedIn, router, language]);

  // Function to fetch all necessary data
  const fetchData = async () => {
    try {
      // Don't fetch if not authenticated
      if (!isSignedIn) {
        return;
      }

      setIsLoading(true);
      setError(null);
      
      // Fetch all data in parallel with better error handling
      try {
        const [coursesResponse, userProgressResponse, progressesResponse] = await Promise.all([
          fetch('/api/courses', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }),
          fetch('/api/user-progress', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }),
          fetch('/api/user-course-progress', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          })
        ]);

        // Check individual responses with detailed error messages
        if (!coursesResponse.ok) {
          const errorText = await coursesResponse.text();
          throw new Error(`Failed to fetch courses: ${coursesResponse.status} - ${errorText}`);
        }
        if (!userProgressResponse.ok) {
          const errorText = await userProgressResponse.text();
          throw new Error(`Failed to fetch user progress: ${userProgressResponse.status} - ${errorText}`);
        }
        if (!progressesResponse.ok) {
          const errorText = await progressesResponse.text();
          throw new Error(`Failed to fetch course progress: ${progressesResponse.status} - ${errorText}`);
        }

        // Parse responses with individual error handling
        const courses = await coursesResponse.json().catch(() => {
          throw new Error('Failed to parse courses data');
        });

        const userProgress = await userProgressResponse.json().catch(() => {
          throw new Error('Failed to parse user progress data');
        });

        const progresses = await progressesResponse.json().catch(() => {
          throw new Error('Failed to parse course progress data');
        });

        // Validate data structure
        if (!Array.isArray(courses)) {
          throw new Error('Invalid courses data format');
        }
        if (!userProgress || typeof userProgress !== 'object') {
          throw new Error('Invalid user progress data format');
        }
        if (!Array.isArray(progresses)) {
          throw new Error('Invalid course progress data format');
        }

        setCoursesData(courses);
        setUserProgressData(userProgress);
        setUserCourseProgresses(progresses);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        toast.error(language === 'ar' 
          ? `فشل في تحميل البيانات: ${errorMessage}` 
          : `Failed to load data: ${errorMessage}`
        );

        // Retry logic for network errors
        if (errorMessage.includes('Network error')) {
          setTimeout(() => {
            fetchData();
          }, 3000); // Retry after 3 seconds
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount and when language or auth state changes
  useEffect(() => {
    if (isSignedIn) {
      fetchData();
    }
  }, [language, isSignedIn]);

  // Don't render anything while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title={language === 'ar' ? 'الكورسات' : 'Courses'} hasLogo />
        <div className="flex">
          <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isSignedIn) {
    return null;
  }

  // Function to get course progress
  const getCourseProgress = (courseId: number): CourseProgress => {
    const progress = userCourseProgresses.find(p => p.courseId === courseId);
    if (!progress) {
      return { courseId, progress: 0, completed: false, lastActiveUnitId: null, lastLessonId: null };
    }

    // Calculate progress based on completed lessons across all units
    const course = coursesData.find(c => c.id === courseId);
    if (!course?.units) return progress;

    // Calculate total lessons and completed lessons across all units
    let totalLessons = 0;
    let completedLessons = 0;

    course.units.forEach(unit => {
      // Only count lessons directly in the unit
      if (unit.lessons) {
        totalLessons += unit.lessons.length;
        completedLessons += unit.lessons.filter(lesson => lesson.completed).length;
      }
    });

    // Calculate progress percentage
    const calculatedProgress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      ...progress,
      progress: calculatedProgress,
      completed: calculatedProgress === 100
    };
  };

  // Function to get unit progress
  const getUnitProgress = (unit: Course['units'][0]) => {
    if (!unit.lessons || unit.lessons.length === 0) return 0;
    const completedLessons = unit.lessons.filter(lesson => lesson.completed).length;
    return Math.round((completedLessons / unit.lessons.length) * 100);
  };

  // Handle course selection
  const handleCourseSelect = async (courseId: number) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Set the active course and get updated progress
      const response = await fetch("/api/courses/set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        throw new Error('Failed to set active course');
      }

      const updatedProgress = await response.json();
      
      // Update local state with the new progress data
      setUserProgressData(updatedProgress);
      
      // Clear any cached data
      await fetch('/api/clear-cache', { method: 'POST' });
      
      // Navigate to the appropriate page based on last active lesson/unit
      let redirectUrl = `/learn?courseId=${courseId}&t=${Date.now()}`;
      
      if (updatedProgress.lastLessonId) {
        redirectUrl = `/lesson/${updatedProgress.lastLessonId}?courseId=${courseId}&t=${Date.now()}`;
      } else if (updatedProgress.lastActiveUnitId) {
        redirectUrl = `/learn/${updatedProgress.lastActiveUnitId}?courseId=${courseId}&t=${Date.now()}`;
      }
      
      router.push(redirectUrl);
      
      toast.success(
        language === 'ar' 
          ? 'تم تحديد الكورس بنجاح'
          : 'Course selected successfully'
      );
    } catch (error) {
      console.error('Error selecting course:', error);
      toast.error(
        language === 'ar' 
          ? 'فشل في تحديد الكورس'
          : 'Failed to select course'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title={language === 'ar' ? 'الكورسات' : 'Courses'} hasLogo />
        <div className="flex">
          <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title={language === 'ar' ? 'الكورسات' : 'Courses'} hasLogo />
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Sidebar - Only visible on mobile */}
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />
          <div className={cn(
            "fixed inset-y-0 z-50 flex w-72 flex-col bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300",
            isRtl ? "right-0" : "left-0"
          )}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {language === 'ar' ? 'القائمة' : 'Menu'}
                </h2>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <span className="sr-only">Close sidebar</span>
                  ✕
                </button>
              </div>
            </div>
            {/* Mobile Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Add your sidebar content here */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 py-8 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            {/* Courses Header */}
            <div className="mb-8">
              <h1 className={cn(
                "text-3xl font-bold text-gray-900 dark:text-white mb-2",
                isRtl ? "text-right" : "text-left"
              )}>
                {language === 'ar' ? 'الدورات المتاحة' : 'Available Courses'}
              </h1>
              <p className={cn(
                "text-gray-600 dark:text-gray-300",
                isRtl ? "text-right" : "text-left"
              )}>
                {language === 'ar' 
                  ? 'اختر دورة للبدء في رحلة التعلم الخاصة بك'
                  : 'Choose a course to start your learning journey'}
              </p>
            </div>

            {/* Courses Grid with Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {coursesData.map((course) => {
                const progress = getCourseProgress(course.id);
                const isActive = userProgressData?.activeCourseId === course.id;
                
                return (
                  <Card
                    key={course.id}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300",
                      "hover:shadow-lg hover:scale-[1.02]",
                      "border-2",
                      isActive 
                        ? "ring-2 ring-[#235390] bg-[#235390]/5 border-[#235390]" 
                        : "hover:ring-2 hover:ring-primary/50 border-gray-200 dark:border-gray-700",
                      isProcessing && "opacity-70 pointer-events-none"
                    )}
                    onClick={() => handleCourseSelect(course.id)}
                  >
                    {/* Course Image with Overlay */}
                    <div className="relative aspect-video">
                      <Image
                        src={course.imageSrc || "/course-placeholder.png"}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {(progress.completed || progress.progress > 0) && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-4xl font-bold mb-1">{progress.progress}%</div>
                            <div className="text-sm font-medium">
                              {language === 'ar' ? 'تقدم الدورة' : 'Course Progress'}
                            </div>
                          </div>
                        </div>
                      )}
                      {isActive && (
                        <div className={cn(
                          "absolute top-3 px-3 py-1.5 bg-[#235390] text-white text-sm font-medium rounded-full",
                          "shadow-lg backdrop-blur-sm",
                          isRtl ? "left-3" : "right-3"
                        )}>
                          {language === 'ar' ? 'نشط' : 'Active'}
                        </div>
                      )}
                    </div>

                    {/* Course Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className={cn(
                          "text-xl font-bold text-gray-900 dark:text-white mb-2",
                          "line-clamp-2",
                          isRtl ? "text-right" : "text-left"
                        )}>
                          {course.title}
                        </h3>
                        <p className={cn(
                          "text-gray-600 dark:text-gray-300 text-sm",
                          "line-clamp-2",
                          isRtl ? "text-right" : "text-left"
                        )}>
                          {course.description || (language === 'ar' ? `تعلم ${course.title}` : `Learn ${course.title}`)}
                        </p>
                      </div>

                      {/* Course Stats */}
                      <div className={cn(
                        "flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400",
                        isRtl ? "flex-row-reverse" : "flex-row"
                      )}>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.units?.reduce((total, unit) => total + unit.lessons.length, 0) || 0} {language === 'ar' ? 'درس' : 'lessons'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                      
                      {/* Progress Section */}
                      <div className="space-y-2 pt-2">
                        <div className={cn(
                          "flex items-center justify-between text-sm",
                          isRtl ? "flex-row-reverse" : ""
                        )}>
                          <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {language === 'ar' ? 'تقدمك' : 'Your progress'}
                          </span>
                          <span className="font-bold text-[#235390] dark:text-blue-400">
                            {progress.progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#58CC02] transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                        {progress.completed && (
                          <div className={cn(
                            "flex items-center gap-2 text-sm text-[#58CC02] font-medium",
                            isRtl ? "justify-end" : ""
                          )}>
                            <span>🎉</span>
                            <span>
                              {language === 'ar' ? 'مكتمل' : 'Completed'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursesPage;
