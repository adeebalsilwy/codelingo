'use client';

import Link from "next/link";
import { Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";

type Props = {
  id: number;
  title: string;
  order: number;
  unitId: number;
  completed: boolean;
  isActive: boolean;
};

export const Lesson = ({
  id,
  title,
  order,
  unitId,
  completed,
  isActive,
}: Props) => {
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  
  useEffect(() => {
    // Get active course ID from cookie
    const courseIdCookie = getCookie('activeCourseId');
    if (courseIdCookie && typeof courseIdCookie === 'string') {
      setActiveCourseId(parseInt(courseIdCookie, 10));
    }
  }, []);
  
  const handleLessonClick = async () => {
    try {
      // Update the lastLessonId when a user clicks a lesson
      await fetch('/api/user-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitId: unitId,
          lessonId: id,
          courseId: activeCourseId, // Include the course ID if available
        }),
      });
    } catch (error) {
      console.error("Failed to update active lesson:", error);
    }
  };

  const Icon = completed ? Check : Play;

  return (
    <Link 
      href={`/lesson/${id}`} 
      onClick={handleLessonClick}
      className={cn(
        "flex items-center gap-x-2 py-2 px-4 text-sm border-b border-slate-200 last:border-none hover:bg-gray-50",
        isActive && "bg-sky-50 hover:bg-sky-50",
        completed && "text-gray-500 hover:text-black"
      )}
    >
      <Icon 
        size={20} 
        className={cn(
          "text-slate-500",
          isActive && "text-sky-500",
          completed && "text-emerald-500"
        )}
      />
      <div className="flex items-center gap-x-2">
        <p>
          {order}. {title}
        </p>
        {completed && (
          <span className="text-emerald-500 text-xs ml-2">
            COMPLETED
          </span>
        )}
      </div>
    </Link>
  );
}; 