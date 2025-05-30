'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BookOpen, Star, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/app/i18n/client';

interface Course {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  unitsCount?: number;
  lessonsCount?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface CourseCardProps {
  course: Course;
  isActive: boolean;
  progress: number;
  points: number;
  completed: boolean;
}

export const CourseCard = ({ course, isActive, progress, points, completed }: CourseCardProps) => {
  const router = useRouter();
  const { t, dir } = useI18n();

  const handleClick = async () => {
    try {
      if (isActive) {
        router.push('/learn');
      } else {
        const response = await fetch(`/api/courses/${course.id}/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to activate course');

        router.push('/learn');
        router.refresh();
      }
    } catch (error) {
      console.error('Error activating course:', error);
    }
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border-2 transition-all duration-300
      ${completed 
        ? 'border-[#58CC02] bg-[#58CC02]/5' 
        : isActive
          ? 'border-[#235390] bg-[#235390]/5 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-[#235390] hover:shadow-lg'
      }
    `}>
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={course.imageSrc}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {(completed || progress > 0) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-3xl font-bold mb-2">{progress}%</div>
              <div className="text-sm opacity-90">{t('units.progress')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#235390] dark:text-white">
            {course.title}
          </h3>
          {points > 0 && (
            <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-600 px-2 py-1 rounded-full">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">{points}</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
          {course.unitsCount && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.unitsCount} {t('units.title')}</span>
            </div>
          )}
          {course.lessonsCount && (
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>{course.lessonsCount} {t('lessons.title')}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleClick}
          className={`
            w-full flex items-center justify-center gap-2
            ${completed 
              ? 'bg-[#58CC02] hover:bg-[#58CC02]/90' 
              : isActive
                ? 'bg-[#235390] hover:bg-[#235390]/90'
                : 'bg-primary hover:bg-primary/90'
            }
          `}
        >
          <span>
            {completed 
              ? t('lessons.review')
              : isActive 
                ? t('lessons.continue') 
                : t('lessons.start')
            }
          </span>
          <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Active Badge */}
      {isActive && (
        <div className={`
          absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'}
          bg-[#235390] text-white text-sm font-medium px-3 py-1 rounded-full
        `}>
          {t('units.activeCourse')}
        </div>
      )}
    </div>
  );
}; 