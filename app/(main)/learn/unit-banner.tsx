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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300" dir={dir}>
      <div className="flex items-start justify-between flex-wrap md:flex-nowrap gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`
              h-12 w-12 rounded-full flex items-center justify-center
              ${progress === 100 
                ? 'bg-[#58CC02]/20 text-[#58CC02]' 
                : 'bg-[#235390]/20 text-[#235390] dark:bg-blue-500/20 dark:text-blue-400'}
            `}>
              {progress === 100 ? (
                <Award className="h-6 w-6" />
              ) : (
                <BookOpenCheck className="h-6 w-6" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#235390] dark:text-white mb-1">{title}</h2>
              {description && (
                <p className="text-gray-600 dark:text-gray-300 mb-3">{description}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <BookOpen className="h-5 w-5 text-[#235390] dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {lessonsCount} {dictionary['chapters.lessons_plural'] || 'lessons'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <BarChart className="h-5 w-5 text-[#235390] dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {completedLessons}/{lessonsCount} {dictionary['chapters.completed'] || 'completed'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <Clock className="h-5 w-5 text-[#235390] dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">
                {estimatedTime} {dictionary['units.minutes'] || 'min'}
              </span>
            </div>
          </div>
          
          {showProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {dictionary['app.progress'] || 'Progress'}
                </span>
                <span className="text-sm font-semibold text-[#235390] dark:text-blue-400">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#58CC02] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {lessonsLeft > 0 && (
          <div className="text-center bg-[#235390]/10 dark:bg-blue-500/20 p-4 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold text-[#235390] dark:text-blue-400">
                {lessonsLeft}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {dictionary['units.challenges'] || 'challenges'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
