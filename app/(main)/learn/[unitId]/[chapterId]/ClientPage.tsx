'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { YouTubeEmbed } from "@/app/components/YouTubeEmbed";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";

interface Lesson {
  id: number;
  title: string;
  order: number;
  challenges: Array<{
    id: number;
  }>;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  content: string | null;
  video_youtube: string | null;
  unitId: number;
  order: number;
  unit: {
    id: number;
    title: string;
    description: string;
    courseId: number;
    order: number;
    course: {
      id: number;
      title: string;
      imageSrc: string;
    };
  };
  lessons: Lesson[];
}

interface ClientPageProps {
  currentChapter: Chapter;
}

const ClientPage = ({ currentChapter }: ClientPageProps) => {
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';

  return (
    <div className={cn(
      "flex flex-col gap-6",
      isRtl ? "rtl text-right" : ""
    )}>
      <div className={cn(
        "flex flex-col gap-4 bg-white rounded-xl p-8 shadow-sm",
        isRtl ? "text-right" : ""
      )}>
        <div className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground mb-2",
          isRtl ? "flex-row-reverse" : ""
        )}>
          <Link 
            href={`/learn/${currentChapter.unitId}`}
            className="hover:text-primary transition-colors"
          >
            <span>{currentChapter.unit.course.title}</span>
            <span className="mx-2">›</span>
            <span>{currentChapter.unit.title}</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold">{currentChapter.title}</h1>
        <div className={cn(
          "prose prose-stone dark:prose-invert",
          isRtl ? "prose-rtl" : ""
        )}>
          <div dangerouslySetInnerHTML={{ __html: currentChapter.description }} />
        </div>

        {currentChapter.video_youtube && (
          <div className="aspect-video mt-4">
            <YouTubeEmbed url={currentChapter.video_youtube} />
          </div>
        )}

        {currentChapter.content && (
          <div className={cn(
            "prose prose-stone dark:prose-invert mt-6",
            isRtl ? "prose-rtl" : ""
          )}>
            <div dangerouslySetInnerHTML={{ __html: currentChapter.content }} />
          </div>
        )}

        {currentChapter.lessons && currentChapter.lessons.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{t('lessons.title')}</h2>
            <div className="flex flex-col gap-2">
              {currentChapter.lessons.map((lesson) => (
                <Link key={lesson.id} href={`/lesson/${lesson.id}`} prefetch={false}>
                  <Button
                    variant="default"
                    className={cn(
                      "w-full font-normal",
                      isRtl ? "justify-end text-right" : "justify-start text-left"
                    )}
                  >
                    {lesson.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPage; 