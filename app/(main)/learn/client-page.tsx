'use client';

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Flame, Trophy, Star, ChevronRight, ChevronLeft, Lock, Gift, Zap, CheckCircle, BookOpen, Code, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/app/i18n/client";

interface Unit {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: Array<{
    id: number;
    title: string;
    completed: boolean;
    type?: 'practice' | 'challenge' | 'quiz';
  }>;
  courseName: string;
}

interface UserProgress {
  userId: string;
  userName: string;
  userImageSrc: string;
  activeCourseId: number;
  hearts: number;
  points: number;
  lastActiveUnitId: number | null;
  lastLessonId: number | null;
  activeCourse?: {
    title: string;
    imageSrc: string;
  };
}

interface CourseProgress {
  activeLesson?: {
    id: number;
    title: string;
  };
  lastActiveUnitId?: number;
  lastLessonId?: number;
}

interface ClientLearningPageProps {
  units: Unit[];
  userProgress: UserProgress;
  courseProgress: CourseProgress | null;
  lessonPercentage: number;
}

const LessonCircle = ({ isCompleted, isActive, isLocked, number, type = 'practice', onClick }: { 
  isCompleted: boolean; 
  isActive: boolean;
  isLocked: boolean;
  number: number;
  type?: 'practice' | 'challenge' | 'quiz';
  onClick: () => void;
}) => {
  const { t } = useI18n();
  
  const getTypeIcon = () => {
    switch(type) {
      case 'challenge':
        return <Terminal className="w-6 h-6" />;
      case 'quiz':
        return <Code className="w-6 h-6" />;
      default:
        return <span className="text-xl font-bold">{number}</span>;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`
        w-16 h-16 rounded-full border-4 flex items-center justify-center
        transform transition-all duration-300 cursor-pointer
        ${isCompleted 
          ? 'border-[#58CC02] bg-[#58CC02] text-white scale-100 hover:scale-110' 
          : isActive
            ? 'border-[#58CC02] bg-white scale-110 hover:scale-120'
            : isLocked
              ? 'border-gray-300 bg-gray-200 scale-90 cursor-not-allowed'
              : 'border-gray-200 bg-gray-100 scale-90 hover:scale-100'
        }
      `}
    >
      {isCompleted ? (
        <CheckCircle className="w-8 h-8 fill-white" />
      ) : isLocked ? (
        <Lock className="w-6 h-6 text-gray-400" />
      ) : (
        <div className={`${isActive ? 'text-[#58CC02]' : 'text-gray-400'}`}>
          {getTypeIcon()}
        </div>
      )}
    </div>
  );
};

const VerticalLine = ({ isCompleted }: { isCompleted: boolean }) => (
  <div className={`
    absolute left-1/2 -translate-x-1/2 w-1 h-24
    ${isCompleted ? 'bg-[#58CC02]' : 'bg-gray-200'}
  `} />
);

const ClientLearningPage = ({
  units: initialUnits,
  userProgress: initialUserProgress,
  courseProgress: initialCourseProgress,
  lessonPercentage: initialLessonPercentage,
}: ClientLearningPageProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language, dir } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [units, setUnits] = useState<Unit[]>(initialUnits || []);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(initialUserProgress || null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(initialCourseProgress || null);
  const [lessonPercentage, setLessonPercentage] = useState(initialLessonPercentage || 0);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total progress for a unit
  const calculateUnitProgress = useCallback((unit: Unit) => {
    if (!unit.lessons || unit.lessons.length === 0) return 0;
    const completedLessons = unit.lessons.filter(lesson => lesson.completed).length;
    return Math.round((completedLessons / unit.lessons.length) * 100);
  }, []);

  // Initialize state with props
  useEffect(() => {
    if (initialUnits) {
      const processedUnits = initialUnits.map(unit => ({
        ...unit,
        progress: calculateUnitProgress(unit)
      }));
      setUnits(processedUnits);
    }
    if (initialUserProgress) setUserProgress(initialUserProgress);
    if (initialCourseProgress) setCourseProgress(initialCourseProgress);
    if (typeof initialLessonPercentage === 'number') setLessonPercentage(initialLessonPercentage);
    setIsLoading(false);
    setMounted(true);
  }, [initialUnits, initialUserProgress, initialCourseProgress, initialLessonPercentage, calculateUnitProgress]);

  // Function to refresh data
  const refreshData = useCallback(async () => {
    if (!mounted) return;
    
    try {
      setIsLoading(true);
      
      const [progressResponse, courseProgressResponse] = await Promise.all([
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
      
      if (!progressResponse.ok || !courseProgressResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const [progressData, courseProgressData] = await Promise.all([
        progressResponse.json(),
        courseProgressResponse.json()
      ]);
      
      if (progressData) setUserProgress(progressData);
      if (courseProgressData) {
        setCourseProgress(courseProgressData);
        // Update units with course progress data
        if (courseProgressData.units) {
          const processedUnits = courseProgressData.units.map((unit: Unit) => ({
            ...unit,
            progress: calculateUnitProgress(unit)
          }));
          setUnits(processedUnits);
        }
      }

      // Calculate overall lesson percentage
      const totalLessons = units.reduce((acc, unit) => acc + unit.lessons.length, 0);
      const completedLessons = units.reduce((acc, unit) => 
        acc + unit.lessons.filter(lesson => lesson.completed).length, 0
      );
      const newPercentage = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
      setLessonPercentage(newPercentage);

    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [mounted, units, calculateUnitProgress]);

  // Handle confetti effect
  const triggerConfetti = useCallback(async () => {
    if (typeof window === 'undefined' || !mounted) return;
    
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error('Error showing confetti:', error);
    }
  }, [mounted]);

  // Function to check if a lesson is locked
  const isLessonLocked = useCallback((unitIndex: number, lessonIndex: number) => {
    if (unitIndex === 0 && lessonIndex === 0) return false; // First lesson is always unlocked
    
    const unit = units[unitIndex];
    const previousUnit = units[unitIndex - 1];
    
    // If it's the first lesson in a unit, check if previous unit is completed
    if (lessonIndex === 0) {
      return previousUnit && !previousUnit.lessons.every(lesson => lesson.completed);
    }
    
    // Check if previous lesson in current unit is completed
    return !unit.lessons[lessonIndex - 1].completed;
  }, [units]);

  // Handle lesson completion and navigation
  const handleLessonClick = useCallback(async (unitId: number, lessonId: number, isLocked: boolean) => {
    if (isLocked || !mounted) return;
    
    try {
      // Update user progress
      await fetch('/api/user-course-progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: userProgress?.activeCourseId,
          lastActiveUnitId: unitId,
          lastLessonId: lessonId
        })
      });
      
      setShowConfetti(true);
      triggerConfetti();
      router.push(`/learn/${unitId}/${lessonId}`);
      setTimeout(refreshData, 1000);
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  }, [router, refreshData, mounted, triggerConfetti, userProgress]);

  useEffect(() => {
    if (showConfetti) {
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [showConfetti]);

  // Refresh data on mount and window focus
  useEffect(() => {
    if (mounted) {
      refreshData();
      
      const handleFocus = () => refreshData();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [mounted, refreshData]);

  if (!mounted || isLoading || !userProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  const sortedUnits = [...units].sort((a, b) => a.order - b.order);
  const currentUnit = sortedUnits.find((unit) =>
    unit.lessons.some((lesson) => !lesson.completed)
  ) || sortedUnits[0];

  // Get the direction chevron based on language direction
  const DirectionChevron = dir === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">{t('app.loading')}</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300" dir={dir}>
        {/* Settings Bar */}
        
        {/* Header */}
        <header className="fixed top-0 w-full bg-[#235390] dark:bg-gray-800 text-white z-50 shadow-md transition-colors duration-300">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/courses">
                <Button variant="ghost" className="text-white hover:bg-white/10 transition-colors duration-300">
                  <DirectionChevron className="h-6 w-6" />
                  {t('app.back')}
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-white/15">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-bold">{userProgress.hearts}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-white/15">
                  <Flame className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold">{userProgress.points}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-white/15">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <span className="font-bold">{lessonPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-8 px-4 max-w-3xl mx-auto">
          {sortedUnits.map((unit, unitIndex) => {
            const isCurrentUnit = unit.id === currentUnit?.id;
            const isUnitCompleted = unit.lessons.every(lesson => lesson.completed);
            const isUnitLocked = unitIndex > 0 && !sortedUnits[unitIndex - 1].lessons.every(lesson => lesson.completed);
            
            return (
              <div key={unit.id} className="mb-12 relative">
                {unitIndex > 0 && (
                  <VerticalLine isCompleted={sortedUnits[unitIndex - 1].lessons.every(lesson => lesson.completed)} />
                )}
                
                <div className={`
                  p-6 rounded-xl shadow-lg mb-8
                  ${isCurrentUnit ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}
                  ${isUnitLocked ? 'opacity-50' : 'opacity-100'}
                `}>
                  <h2 className="text-2xl font-bold mb-4">{unit.title}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{unit.description}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {unit.lessons.map((lesson, lessonIndex) => {
                      const isLocked = isLessonLocked(unitIndex, lessonIndex);
                      const isActive = lesson.id === courseProgress?.activeLesson?.id;
                      
                      return (
                        <div key={lesson.id} className="flex flex-col items-center gap-2">
                          <LessonCircle
                            isCompleted={lesson.completed}
                            isActive={isActive}
                            isLocked={isLocked}
                            number={lessonIndex + 1}
                            type={lesson.type}
                            onClick={() => handleLessonClick(unit.id, lesson.id, isLocked)}
                          />
                          <span className="text-sm text-center font-medium text-gray-600 dark:text-gray-300">
                            {lesson.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </Suspense>
  );
};

export default ClientLearningPage; 