import { FC } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Award, BookOpenCheck, BarChart, Clock } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  lessonsCount?: number;
  completedLessons?: number;
  lessonsLeft?: number;
  showProgress?: boolean;
  estimatedTime?: number;
  dir?: string;
  dictionary?: Record<string, string>;
}

export const UnitBanner: FC<Props> = ({
  title = "",
  description = "",
  lessonsCount = 0,
  completedLessons = 0,
  lessonsLeft = 0,
  showProgress = true,
  estimatedTime = 30,
  dir = 'ltr',
  dictionary = {},
}) => {
  const progress = lessonsCount > 0 ? Math.round((completedLessons / lessonsCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300" dir={dir}>
      <div className="flex items-start justify-between flex-wrap md:flex-nowrap gap-3 sm:gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className={`
              h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center
              ${progress === 100 
                ? 'bg-[#58CC02]/20 text-[#58CC02]' 
                : 'bg-[#235390]/20 text-[#235390] dark:bg-blue-500/20 dark:text-blue-400'}
            `}>
              {progress === 100 ? (
                <Award className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <BookOpenCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-[#235390] dark:text-white mb-0.5 sm:mb-1">{title}</h2>
              {description && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-1 sm:mb-3 line-clamp-2 sm:line-clamp-none">{description}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-[#235390] dark:text-blue-400" />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {lessonsCount} {dictionary['chapters.lessons_plural'] || 'lessons'}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-[#235390] dark:text-blue-400" />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {completedLessons}/{lessonsCount} {dictionary['chapters.completed'] || 'completed'}
              </span>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 col-span-2 sm:col-span-1">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#235390] dark:text-blue-400" />
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {estimatedTime} {dictionary['units.minutes'] || 'min'}
              </span>
            </div>
          </div>
          
          {showProgress && (
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {dictionary['app.progress'] || 'Progress'}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#235390] dark:text-blue-400">
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#58CC02] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {lessonsLeft > 0 && (
          <div className="text-center bg-[#235390]/10 dark:bg-blue-500/20 p-2 sm:p-4 rounded-lg w-20 sm:w-auto flex-shrink-0">
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <Star className="h-6 w-6 sm:h-8 sm:w-8 fill-yellow-400 text-yellow-400" />
              <span className="text-xl sm:text-2xl font-bold text-[#235390] dark:text-blue-400">
                {lessonsLeft}
              </span>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {dictionary['units.challenges'] || 'challenges'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
