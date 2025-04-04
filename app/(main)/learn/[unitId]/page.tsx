import { redirect } from "next/navigation";
import { UnitBanner } from "../unit-banner";
import { getChapters, getUnits, getUserProgress, updateLastActiveUnit } from "@/db/queries";
import { Suspense } from "react";
import { LessonGrid } from "./lesson-grid";
import { getDictionary, getDirection } from "@/app/i18n/server";
import { auth } from "@clerk/nextjs";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

interface PageProps {
  params: {
    unitId: string;
  };
  searchParams: {
    courseId?: string;
  };
}

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-gray-500 dark:text-gray-400">Loading unit...</div>
      </div>
    </div>
  );
}

export default async function UnitPage({ params, searchParams }: PageProps) {
  const unitId = parseInt(params.unitId);
  const courseId = searchParams.courseId;
  
  if (isNaN(unitId)) {
    return redirect("/learn");
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnitContent unitId={unitId} courseId={courseId} />
    </Suspense>
  );
}

async function UnitContent({ unitId, courseId }: { unitId: number, courseId?: string }) {
  try {
    // Check authentication first
    const { userId } = await auth();
    if (!userId) {
      redirect("/");
    }

    // Ensure unitId is a number
    if (typeof unitId !== 'number' || isNaN(unitId)) {
      console.error('Invalid unit ID: not a number');
      redirect("/courses");
    }

    // Get user progress and active course
    const userProgress = await getUserProgress();
    
    // If no course ID is provided, use the active course from user progress
    if (!courseId && userProgress?.activeCourseId) {
      courseId = String(userProgress.activeCourseId);
      console.log(`No courseId provided, using active course: ${courseId}`);
    } else if (!courseId && !userProgress?.activeCourseId) {
      console.error('No courseId provided and no active course found');
      redirect("/courses");
    }

    // Get all units
    const units = await getUnits();
    if (!units || units.length === 0) {
      console.error('No units found');
      redirect("/courses");
    }

    // Filter units for the specified course if provided
    const courseUnits = courseId 
      ? units.filter(unit => unit.courseId === parseInt(courseId!))
      : units;

    if (courseUnits.length === 0) {
      console.error(`No units found for course ID: ${courseId}`);
      redirect("/courses");
    }

    // Validate unit ID is within available units for this course
    const validUnitIds = courseUnits.map(unit => unit.id);
    if (!validUnitIds.includes(unitId)) {
      console.error(`Invalid unit ID: ${unitId} for course: ${courseId}. Available units: ${validUnitIds.join(', ')}`);
      
      // Find the first incomplete unit or default to the first unit
      const firstIncompleteUnit = courseUnits.find(unit => 
        unit.lessons.some(lesson => !lesson.completed)
      );
      const redirectUnitId = firstIncompleteUnit?.id || courseUnits[0].id;
      
      redirect(`/learn/${redirectUnitId}?courseId=${courseId}`);
    }

    // Update last active unit in database
    await updateLastActiveUnit(unitId);

    // Get current unit details
    const currentUnit = courseUnits.find((unit) => unit.id === unitId);
    if (!currentUnit) {
      console.error('Unit not found:', unitId);
      redirect(`/learn?courseId=${courseId}`);
    }

    // Get chapters for the unit
    const chapters = await getChapters(unitId);
    if (!chapters || chapters.length === 0) {
      console.error('No chapters found for unit:', unitId);
      redirect(`/learn?courseId=${courseId}`);
    }

    // Calculate completed lessons
    const validLessons = currentUnit.lessons
      ? currentUnit.lessons.filter(lesson => lesson && typeof lesson === 'object')
      : [];
    
    const completedLessons = validLessons.filter(lesson => 
      lesson && typeof lesson.completed === 'boolean' && lesson.completed
    ).length;
    
    const lessonsLeft = validLessons.length - completedLessons;
    
    console.log(`Unit ${unitId} progress: ${completedLessons}/${validLessons.length} lessons completed`);

    // Get language and direction
    const dict = await getDictionary();
    const dir = await getDirection();
    const isRtl = dir === 'rtl';

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir={dir}>
       
      
      <Header  hasLogo title={""} />
        <header className="fixed top-0  bg-[#235390] dark:bg-gray-800 text-white z-50 shadow-md transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
            <Link href={`/learn?courseId=${courseId}`}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 transition-colors duration-300 p-1 sm:p-2">
                {isRtl ? <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" /> : <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />}
                <span className="hidden sm:inline ml-1">{dict['units.return']}</span>
              </Button>
            </Link>
            <h1 className="text-base sm:text-xl font-bold truncate max-w-[200px] sm:max-w-sm">{currentUnit.title}</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 relative">
          {/* Unit Banner */}
          <div className="mb-4 sm:mb-8 pt-14 sm:pt-16">
            <UnitBanner
              title={currentUnit.title}
              description={currentUnit.description}
              lessonsCount={currentUnit.lessons.length}
              completedLessons={completedLessons}
              lessonsLeft={lessonsLeft}
              showProgress={true}
              estimatedTime={30}
              dir={dir}
              dictionary={dict}
            />
          </div>
          
          {/* Chapters Grid */}
          <div className="relative">
            <LessonGrid chapters={chapters} />
          </div>
        </div>
      </div>
     
    );
  } catch (error) {
    console.error("Error in UnitContent:", error);
    redirect("/learn");
  }
}