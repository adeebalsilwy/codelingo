'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Lock, BookOpen, Star, Terminal, Code, Clock } from 'lucide-react';
import { useI18n } from '@/app/i18n/client';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';

interface LessonCardProps {
  id: number;
  title: string;
  description?: string;
  locked: boolean;
  completed: boolean;
  onClick: () => void;
  challengesCount: number;
  active: boolean;
  type: string;
  duration: number;
  language?: string;
}

export const LessonCard = ({
  id,
  title,
  description,
  locked,
  completed,
  onClick,
  challengesCount,
  active,
  type,
  duration,
  language = 'ar'
}: LessonCardProps) => {
  const router = useRouter();
  const { t, dir } = useI18n();

  const handleClick = () => {
    if (!locked) {
      onClick();
    }
  };

  const getIcon = () => {
    if (completed) return <CheckCircle className="h-5 w-5 text-white" />;
    if (locked) return <Lock className="h-5 w-5 text-gray-400" />;
    
    return (
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700" />
    );
  };

  return (
    <div 
      onClick={() => !locked && handleClick()}
      className={cn(
        "p-3 sm:p-4 border-2 rounded-xl relative",
        "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        completed ? "border-[#58CC02]" : "border-gray-200 dark:border-gray-700",
        active ? "bg-blue-50 dark:bg-blue-900/20" : ""
      )}
    >
      
      <div className="flex items-center gap-x-2">
     

        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm sm:text-base">
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
          <div className="flex items-center mt-1 gap-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {type === 'challenge' && <Terminal className="h-3 w-3 sm:h-4 sm:w-4" />}
            {type === 'quiz' && <Star className="h-3 w-3 sm:h-4 sm:w-4" />}
            {type === 'practice' && <Code className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span>{t(`lessons.${type}`) || type}</span>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>{duration} {t('lessons.min')}</span>
            </div>
          </div>
        </div>
      </div>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl">
          <p className="text-xs sm:text-sm text-gray-500 px-2 text-center">
            {language === 'ar' ? 'أكمل الدرس السابق أولاً' : 'Complete previous lesson first'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonCard; 