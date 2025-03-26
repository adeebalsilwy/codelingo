'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Lock, BookOpen, Star, Terminal, Code, Clock } from 'lucide-react';
import { useI18n } from '@/app/i18n/client';
import { cn } from '@/lib/utils';

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
        "p-4 border-2 rounded-xl relative",
        "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        completed ? "border-[#58CC02]" : "border-gray-200 dark:border-gray-700",
      )}
    >
      <div className="flex items-center gap-x-2">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div>
          <h3 className="font-semibold">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl">
          <p className="text-sm text-gray-500">
            {language === 'ar' ? 'أكمل الدرس السابق أولاً' : 'Complete previous lesson first'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LessonCard; 