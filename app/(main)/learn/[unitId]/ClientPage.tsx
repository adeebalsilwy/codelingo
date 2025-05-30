'use client';

import Link from "next/link";
import { useI18n } from "@/app/i18n/client";
import Image from "next/image";
import { ChapterCard } from "@/app/components/ChapterCard";
import { cn } from "@/lib/utils";

interface ClientChaptersPageProps {
  unitId: number;
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
  chapters: Array<{
    id: number;
    title: string;
    description: string;
    content: string | null;
    video_youtube: string | null;
    unitId: number;
    order: number;
    _count?: {
      lessons: number;
    };
  }>;
}

export const ClientChaptersPage = ({ unitId, unit, chapters }: ClientChaptersPageProps) => {
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';

  return (
    <div className={cn("flex flex-col gap-y-4", isRtl ? "rtl" : "")}>
      <div className="flex items-center gap-x-2">
        <Image
          src="/units.svg"
          alt={t('units.title')}
          height={32}
          width={32}
        />
        <h1 className="text-2xl font-bold">
          {unit.title}
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapters.map((chapter) => (
          <Link key={chapter.id} href={`/learn/${unitId}/${chapter.id}`} prefetch={false}>
            <ChapterCard
              id={chapter.id}
              title={chapter.title}
              description={chapter.description}
              numberOfLessons={chapter._count?.lessons || 0}
              isRtl={isRtl}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};