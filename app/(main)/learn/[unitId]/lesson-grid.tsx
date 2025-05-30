'use client';

import { LessonCard } from './lesson-card';
import { BookOpen, Beaker, Trophy, ChevronDown, BookOpenCheck, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '@/app/i18n/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Lesson {
  id: number;
  title: string;
  completed: boolean;
  challenges: any[];
  unit?: {
    id: number;
    title: string;
  };
}

interface Chapter {
  id: number;
  title: string;
  description?: string | null;
  content?: string | null;
  videoYoutube?: string | null;
  lessons: Lesson[];
  unitId: number;
}

interface LessonGridProps {
  chapters: Chapter[];
}

export const LessonGrid = ({ chapters }: LessonGridProps) => {
  const { t, dir } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams?.get('courseId');
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Auto refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  // Refresh data when component mounts and when route changes
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      router.refresh();
    }
  }, [mounted, router]);

  // Toggle chapter expansion state
  const toggleChapter = (chapterId: number) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  // Navigate to chapter content
  const goToChapter = (unitId: number, chapterId: number) => {
    if (!courseId) return;
    router.push(`/learn/${unitId}/${chapterId}?courseId=${courseId}`);
  };

  // Navigate to unit
  const goToUnit = (unitId: number) => {
    if (!courseId) return;
    router.push(`/learn/${unitId}?courseId=${courseId}`);
  };

  // Check if lesson is locked based on previous lessons completion
  const isLessonLocked = (chapter: Chapter, lessonIndex: number) => {
    // First lesson in first chapter is always unlocked
    if (lessonIndex === 0 && chapters.indexOf(chapter) === 0) return false;

    // If the lesson is completed, it's not locked
    if (chapter.lessons[lessonIndex].completed) return false;

    // Check if previous lesson in same chapter is completed
    if (lessonIndex > 0) {
      const previousLesson = chapter.lessons[lessonIndex - 1];
      if (previousLesson.completed) return false;
      return true;
    }

    // If it's first lesson in chapter (except first chapter), check if all lessons in previous chapter are completed
    if (lessonIndex === 0 && chapters.indexOf(chapter) > 0) {
      const previousChapter = chapters[chapters.indexOf(chapter) - 1];
      return !previousChapter.lessons.some(lesson => lesson.completed);
    }

    return false;
  };

  // Function to check if all chapters are completed
  const isAllChaptersCompleted = () => {
    return chapters.every(chapter => 
      chapter.lessons.every(lesson => lesson.completed)
    );
  };

  // Determine the active lesson (first incomplete lesson)
  const getActiveLessonId = (chapter: Chapter) => {
    // Find first incomplete lesson that isn't locked
    for (let i = 0; i < chapter.lessons.length; i++) {
      if (!chapter.lessons[i].completed && !isLessonLocked(chapter, i)) {
        return chapter.lessons[i].id;
      }
    }
    return null;
  };

  // Navigate to lesson
  const handleLessonClick = (lessonId: number, isLocked: boolean) => {
    if (isLocked) {
      // Show message that lesson is locked
      toast.error(t('lessons.locked'));
      return;
    }
    
    // Navigate to lesson page with course ID
    router.push(`/lesson/${lessonId}?courseId=${courseId}`);
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Show completion message if all chapters are completed */}
      {isAllChaptersCompleted() && (
        <div className="bg-[#58CC02]/10 border-2 border-[#58CC02] rounded-xl p-6 text-center mb-8">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-[#58CC02] mb-2">
            {t('course.completed.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {t('course.completed.description')}
          </p>
        </div>
      )}

      {chapters.map((chapter) => {
        const isExpanded = expandedChapters[chapter.id] !== false;
        const activeLessonId = getActiveLessonId(chapter);
        const completedLessons = chapter.lessons.filter(lesson => lesson.completed).length;
        const progress = chapter.lessons.length > 0 
          ? Math.round((completedLessons / chapter.lessons.length) * 100) 
          : 0;
        
        return (
          <div
            key={chapter.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700"
          >
            {/* Chapter header with progress indicator */}
            <div className="p-3 sm:p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap sm:flex-nowrap gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div 
                    onClick={() => goToUnit(chapter.unitId)}
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer
                      transition-all duration-300 hover:scale-105
                      ${progress === 100 
                        ? 'bg-[#58CC02]/20 text-[#58CC02] hover:bg-[#58CC02]/30' 
                        : progress > 0 
                          ? 'bg-[#235390]/20 text-[#235390] hover:bg-[#235390]/30' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}
                    `}
                  >
                    {progress === 100 ? (
                      <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : progress > 50 ? (
                      <Beaker className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : (
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-[#235390] dark:text-white">{chapter.title}</h3>
                    <div className="flex items-center flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span>{chapter.lessons.length} {t('chapters.lessons_plural')}</span>
                      <span className="hidden xs:inline">•</span>
                      <span>{completedLessons} {t('chapters.completed')}</span>
                      <span className="hidden xs:inline">•</span>
                      <span>{progress}% {t('chapters.progress')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                  {/* Read Chapter Button */}
                  {(chapter.content || chapter.videoYoutube) && (
                    <Button
                      onClick={() => goToChapter(chapter.unitId, chapter.id)}
                      className="flex items-center gap-1 sm:gap-2 bg-[#235390] hover:bg-[#235390]/90 text-white h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                      size="sm"
                    >
                      <BookOpenCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{t('chapters.read')}</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                  
                  {/* Toggle Expand Button */}
                  <Button
                    variant="ghost"
                    onClick={() => toggleChapter(chapter.id)}
                    className="p-1 sm:p-2 h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center"
                    size="sm"
                  >
                    <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#58CC02] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Chapter description - only shown when expanded */}
              {isExpanded && chapter.description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-3 sm:mt-4">{chapter.description}</p>
              )}
            </div>

            {/* Lessons grid - only shown when expanded */}
            {isExpanded && (
              <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900/50">
                <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  {chapter.lessons.map((lesson, index) => {
                    const lessonType = index % 3 === 0 ? 'challenge' : index % 2 === 0 ? 'quiz' : 'practice';
                    const isLocked = isLessonLocked(chapter, index);
                    const isActive = !lesson.completed && lesson.id === activeLessonId;
                    const duration = 5 + (index % 3);

                    return (
                      <LessonCard
                        key={lesson.id}
                        id={lesson.id}
                        title={lesson.title}
                        completed={lesson.completed}
                        challengesCount={lesson.challenges.length}
                        locked={isLocked && !lesson.completed}
                        active={isActive}
                        type={lessonType}
                        duration={duration}
                        onClick={() => handleLessonClick(lesson.id, isLocked && !lesson.completed)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}; 