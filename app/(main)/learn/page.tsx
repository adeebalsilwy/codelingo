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

export default async function LearnPage({
  searchParams,
}: {
  searchParams: { courseId?: string }
}) {
  const dict = await getDictionary();
  let courseId = searchParams.courseId;

  // First, get the user progress to check for an active course
  const userProgress = await getUserProgress();
  
  // If no course ID is provided in the URL but we have an active course, use that instead
  if (!courseId && userProgress?.activeCourseId) {
    courseId = String(userProgress.activeCourseId);
    console.log(`No courseId provided, using active course: ${courseId}`);
  } else if (!courseId) {
    // If no course ID provided and no active course, redirect to courses page
    console.log('No courseId provided and no active course found');
    return redirect('/courses');
  }

  // Now we have a courseId (either from URL or user's active course)
  const [units, courseProgress, lessonPercentage] = (await Promise.all([
    getUnits(),
    getCourseProgress(),
    getLessonPercentage()
  ])) as unknown as [Unit[], CourseProgress | null, number];

  // Redirect if no user progress or active course (extra safety check)
  if (!userProgress?.activeCourseId) {
    console.log('No active course in user progress');
    return redirect('/courses');
  }

  // Calculate progress based on lessons in each unit
  const calculateUnitProgress = (unit: Unit) => {
    if (!unit.lessons || !Array.isArray(unit.lessons) || unit.lessons.length === 0) return 0;
    
    // Only count valid lessons
    const validLessons = unit.lessons.filter(lesson => lesson && typeof lesson === 'object');
    if (validLessons.length === 0) return 0;
    
    const completedLessons = validLessons.filter(lesson => 
      lesson && typeof lesson.completed === 'boolean' && lesson.completed
    ).length;
    
    return Math.round((completedLessons / validLessons.length) * 100);
  };

  // Calculate total course progress
  const totalLessons = units.reduce((total, unit) => {
    if (!unit.lessons || !Array.isArray(unit.lessons)) return total;
    return total + unit.lessons.filter(lesson => lesson && typeof lesson === 'object').length;
  }, 0);
  
  const completedLessons = units.reduce((total, unit) => {
    if (!unit.lessons || !Array.isArray(unit.lessons)) return total;
    return total + unit.lessons.filter(lesson => 
      lesson && typeof lesson.completed === 'boolean' && lesson.completed
    ).length;
  }, 0);
  
  const courseProgressPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  console.log(`Course progress: ${courseProgressPercentage}% (${completedLessons}/${totalLessons} lessons)`);

  // Filter units for the current course
  const courseUnits = units.filter(unit => unit.courseId === parseInt(courseId));
  
  if (courseUnits.length === 0) {
    console.log(`No units found for course ID: ${courseId}`);
    return redirect('/courses');
  }

  // Find last active unit from user progress
  let targetUnitId = userProgress.lastActiveUnitId;
  
  // If there's no last active unit or it doesn't belong to this course,
  // find the first incomplete lesson or the first unit
  if (!targetUnitId || !courseUnits.some(unit => unit.id === targetUnitId)) {
    // Find an incomplete unit
    const firstIncompleteUnit = courseUnits.find(unit => 
      calculateUnitProgress(unit) < 100
    );
    
    if (firstIncompleteUnit) {
      targetUnitId = firstIncompleteUnit.id;
    } else if (courseUnits.length > 0) {
      // If all units are complete, use the first one
      targetUnitId = courseUnits[0].id;
    }
  }

  // If we found a target unit, redirect to it
  if (targetUnitId) {
    console.log(`Redirecting to unit: ${targetUnitId} for course: ${courseId}`);
    return redirect(`/learn/${targetUnitId}?courseId=${courseId}`);
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
