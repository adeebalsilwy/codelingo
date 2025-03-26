import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { getDictionary } from "@/app/i18n/server";

import {
  getCourseProgress, 
  getLessonPercentage, 
  getUnits, 
  getUserProgress,
} from "@/db/queries";

import ClientLearningPage from "./client-page";
import { Unit, Chapter, Lesson, CourseProgress, UserProgress } from '@/types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type SearchParams = {
  courseId?: string;
};

type LearnPageProps = {
  searchParams: SearchParams;
};

export default async function LearnPage({
  searchParams
}: {
  searchParams: { courseId?: string }
}) {
  const dict = await getDictionary();
  const { courseId } = searchParams;

  if (!courseId) {
    redirect('/courses');
  }

  const [userProgress, units, courseProgress, lessonPercentage] = (await Promise.all([
    getUserProgress(),
    getUnits(),
    getCourseProgress(),
    getLessonPercentage()
  ])) as unknown as [UserProgress | null, Unit[], CourseProgress | null, number];

  // Redirect if no user progress or active course
  if (!userProgress?.activeCourseId) {
    redirect('/courses');
  }

  // Calculate progress based on lessons in each unit
  const calculateUnitProgress = (unit: Unit) => {
    if (!unit.lessons || unit.lessons.length === 0) return 0;
    const completedLessons = unit.lessons.filter(lesson => lesson.completed).length;
    return Math.round((completedLessons / unit.lessons.length) * 100);
  };

  // Calculate total course progress
  const totalLessons = units.reduce((total, unit) => total + unit.lessons.length, 0);
  const completedLessons = units.reduce((total, unit) => 
    total + unit.lessons.filter(lesson => lesson.completed).length, 0
  );
  const courseProgressPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  // Find last active lesson or first incomplete lesson
  const findLastOrIncompleteLesson = () => {
    for (const unit of units) {
      const unitProgress = calculateUnitProgress(unit);
      if (unitProgress < 100) {
        // Find first incomplete lesson in this unit
        const firstIncompleteLesson = unit.lessons.find(lesson => !lesson.completed);
        if (firstIncompleteLesson) {
          return {
            unitId: unit.id,
            lessonId: firstIncompleteLesson.id
          };
        }
      }
    }
    // If all lessons are completed, return the last lesson
    if (units.length > 0) {
      const lastUnit = units[units.length - 1];
      const lastLesson = lastUnit.lessons[lastUnit.lessons.length - 1];
      return {
        unitId: lastUnit.id,
        lessonId: lastLesson.id
      };
    }
    return null;
  };

  const activeLesson = findLastOrIncompleteLesson();

  if (activeLesson) {
    redirect(`/learn/${activeLesson.unitId}?courseId=${courseId}`);
  }

  // If no active lesson found (empty course)
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          {dict['lessons.none_available']}
        </h1>
        <p className="text-gray-500">
          {dict['lessons.course_empty']}
        </p>
      </div>
    </div>
  );
}
