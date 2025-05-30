'use client';

import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n/client";
import { BookOpen } from "lucide-react";

interface ChapterCardProps {
  id: number;
  title: string;
  description: string;
  numberOfLessons: number;
  isRtl: boolean;
}

export const ChapterCard = ({
  id,
  title,
  description,
  numberOfLessons,
  isRtl,
}: ChapterCardProps) => {
  const { t } = useI18n();
  
  return (
    <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 group">
      <div className="p-6 block">
        <div className={cn(
          "flex justify-between items-start mb-2",
          isRtl ? "flex-row-reverse" : ""
        )}>
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className={cn(
            "flex items-center gap-1 text-muted-foreground",
            isRtl ? "flex-row-reverse" : ""
          )}>
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">
              {numberOfLessons} {numberOfLessons === 1 
                ? t('chapters.lessons') 
                : t('chapters.lessons_plural')}
            </span>
          </div>
        </div>
        <p className={cn(
          "text-muted-foreground mb-4",
          isRtl ? "text-right" : ""
        )}>
          {description}
        </p>
        <div className={cn(
          "flex items-center text-primary font-medium",
          isRtl ? "justify-start" : "justify-end"
        )}>
          <span className="group-hover:translate-x-1 transition-transform duration-200">
            {isRtl ? '←' : '→'}
          </span>
        </div>
      </div>
    </div>
  );
}; 