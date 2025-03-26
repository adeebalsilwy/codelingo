'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Lesson } from "./lesson";
import { getCookie } from "cookies-next";

type Props = {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: {
    id: number;
    title: string;
    completed: boolean;
    order: number;
  }[];
  activeLesson?: {
    id: number;
    title: string;
    order: number;
    unit: {
      id: number;
      title: string;
      description: string;
      order: number;
    };
  };
  activeLessonPercentage: number;
};

export const Unit = ({
  id,
  title,
  description,
  order,
  lessons,
  activeLesson,
  activeLessonPercentage,
}: Props) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  
  useEffect(() => {
    // Get active course ID from cookie
    const courseIdCookie = getCookie('activeCourseId');
    if (courseIdCookie && typeof courseIdCookie === 'string') {
      setActiveCourseId(parseInt(courseIdCookie, 10));
    }
  }, []);

  const isActive = activeLesson?.unit.id === id;
  const isActiveCompletion = isActive && activeLessonPercentage === 100;

  const handleToggle = async () => {
    setIsOpen((current) => !current);
    try {
      // When a user expands a unit, update the lastActiveUnitId
      if (!isOpen) {
        await fetch('/api/user-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            unitId: id,
            courseId: activeCourseId // Include the active course ID
          }),
        });
      }
    } catch (error) {
      console.error("Failed to update active unit:", error);
    }
  };

  return (
    <div className="border rounded-lg mb-4 bg-white shadow">
      <div className="p-4 flex items-start gap-x-4">
        <div
          className="min-h-[32px] min-w-[32px] rounded-full flex items-center justify-center"
          style={{
            backgroundImage: `
            radial-gradient(
              circle at center,
              transparent 0%,
              transparent 30%,
              ${isActiveCompletion ? "#22C55E" : isActive ? "#2563EB" : "#FFFFFF"} 30%,
              ${isActiveCompletion ? "#22C55E" : isActive ? "#2563EB" : "#FFFFFF"} 100%
            ),
            radial-gradient(
              circle at center,
              ${isActiveCompletion ? "#22C55E" : isActive ? "#2563EB" : "#FBBF24"} 0%,
              ${isActiveCompletion ? "#22C55E" : isActive ? "#2563EB" : "#FBBF24"} 30%,
              transparent 30%,
              transparent 100%
            )
          `,
          }}
        >
          <Image
            src={isActiveCompletion 
              ? "/check.svg"
              : isActive
                ? "/bolt.svg"
                : "/lock.svg"
            }
            alt="Unit status"
            height={20}
            width={20}
          />
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <h3 className="font-bold text-lg">
              Unit {order}
            </h3>
            <button
              onClick={handleToggle}
              type="button"
              className="rounded-full p-1 hover:bg-gray-100"
            >
              {isOpen 
                ? <ChevronUp className="h-4 w-4 text-slate-500" />
                : <ChevronDown className="h-4 w-4 text-slate-500" />
              }
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {isOpen && (
        <div>
          {lessons.map((lesson) => (
            <Lesson
              key={lesson.id}
              id={lesson.id}
              title={lesson.title}
              order={lesson.order}
              unitId={id}
              completed={lesson.completed}
              isActive={activeLesson?.id === lesson.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};
