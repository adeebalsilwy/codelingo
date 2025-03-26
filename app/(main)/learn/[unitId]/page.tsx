import { redirect } from "next/navigation";
import { UnitBanner } from "../unit-banner";
import { getChapters, getUnits, getUserProgress } from "@/db/queries";
import { Suspense } from "react";
import { LessonGrid } from "./lesson-grid";
import { getDictionary, getDirection } from "@/app/i18n/server";
import { auth } from "@clerk/nextjs";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: {
    unitId: string;
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

async function UnitContent({ unitId }: { unitId: number }) {
  try {
    // Check authentication first
    const { userId } = auth();
    if (!userId) {
      redirect("/");
    }

    // Get user progress and active course - with cache busting
    const userProgress = await getUserProgress();
    if (!userProgress?.activeCourseId) {
      console.error('No active course found');
      redirect("/courses");
    }

    // Get all units for the active course - with cache busting
    const units = await getUnits();
    if (!units || units.length === 0) {
      console.error('No units found for active course');
      redirect("/courses");
    }

    // Validate unit ID is within available units
    const validUnitIds = units.map(unit => unit.id);
    if (!validUnitIds.includes(unitId)) {
      console.error(`Invalid unit ID: ${unitId}. Available units: ${validUnitIds.join(', ')}`);
      
      // Find the first incomplete unit or default to the first unit
      const firstIncompleteUnit = units.find(unit => 
        unit.lessons.some(lesson => !lesson.completed)
      );
      const redirectUnitId = firstIncompleteUnit?.id || units[0].id;
      
      redirect(`/learn/${redirectUnitId}`);
    }

    // Get current unit details
    const currentUnit = units.find((unit) => unit.id === unitId);
    if (!currentUnit) {
      console.error('Unit not found:', unitId);
      redirect("/learn");
    }

    // Get chapters for the unit - with cache busting
    const chapters = await getChapters(unitId);
    if (!chapters || chapters.length === 0) {
      console.error('No chapters found for unit:', unitId);
      redirect("/learn");
    }

    const completedLessons = currentUnit.lessons.filter(lesson => lesson.completed).length;
    const lessonsLeft = currentUnit.lessons.length - completedLessons;

    // Get language and direction (for server component)
    const dict = await getDictionary();
    const dir = await getDirection();
    const isRtl = dir === 'rtl';

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300" dir={dir}>
        {/* Header */}
        <header className="fixed top-0 w-full bg-[#235390] dark:bg-gray-800 text-white z-50 shadow-md transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/learn">
              <Button variant="ghost" className="text-white hover:bg-white/10 transition-colors duration-300">
                {isRtl ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                {dict['units.return']}
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{currentUnit.title}</h1>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 relative">
          {/* Unit Banner */}
          <div className="mb-8 pt-16">
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

export default async function UnitPage({ params }: PageProps) {
  const unitId = parseInt(params.unitId);
  
  if (isNaN(unitId)) {
    redirect("/learn");
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnitContent unitId={unitId} />
    </Suspense>
  );
}