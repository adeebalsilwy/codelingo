import { NextRequest, NextResponse } from "next/server";
import { getUnits, getUserProgress, getCourseProgress, getLessonPercentage } from "@/db/queries";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Check if all required functions are available
    if (!getUnits || !getUserProgress || !getCourseProgress || !getLessonPercentage) {
      throw new Error('Required database functions are not available');
    }

    // Fetch all data in parallel with error handling
    const [unitsResult, userProgressResult, courseProgressResult, lessonPercentageResult] = await Promise.allSettled([
      getUnits(),
      getUserProgress(),
      getCourseProgress(),
      getLessonPercentage()
    ]);

    // Prepare response data with proper error handling
    const responseData = {
      units: unitsResult.status === 'fulfilled' ? unitsResult.value : [],
      userProgress: userProgressResult.status === 'fulfilled' ? userProgressResult.value : null,
      courseProgress: courseProgressResult.status === 'fulfilled' ? courseProgressResult.value : null,
      lessonPercentage: lessonPercentageResult.status === 'fulfilled' ? lessonPercentageResult.value : 0
    };

    // Check if we have minimum required data
    if (!responseData.userProgress) {
      console.error("[PROGRESS_GET] User progress data is missing");
      return NextResponse.json(
        { error: "Failed to load user progress" },
        { status: 404 }
      );
    }

    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    headers.set('Pragma', 'no-cache');

    return NextResponse.json(responseData, {
      headers,
      status: 200
    });
  } catch (error) {
    console.error("[PROGRESS_GET]", error);
    
    // Return a structured error response
    return NextResponse.json({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, { 
      status: 500 
    });
  }
} 