import { eq, asc, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs";
import { cache } from "react";

import db, { checkDatabaseConnection } from "@/db/client";
import { 
  challengeProgress,
  chapters,
  courses, 
  lessons, 
  units, 
  userProgress,
  userSubscription,
  userCourseProgress
} from "@/db/schema";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(operation: () => Promise<T>, operationName: string): Promise<T> => {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed for ${operationName}:`, error);
      
      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAY);
      }
    }
  }
  
  throw lastError;
};

const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error during ${operation}:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
    details: error.details
  });
  
  if (error.message?.includes('connection')) {
    throw new Error(`Database connection error during ${operation}. Please check your database configuration.`);
  }
  
  throw new Error(`Database operation failed: ${operation}. ${error.message || 'Unknown error'}`);
};

// تجنب استخدام cache مع استدعاءات auth
export const getUserProgress = async () => {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.warn("Database connection is not available");
      return null;
    }

    const { userId } = auth();
    if (!userId) {
      return null;
    }

    const data = await db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      with: {
        activeCourse: true,
        lastActiveUnit: true,
        lastLesson: true,
        courseProgresses: {
          with: {
            course: true
          }
        }
      }
    });

    if (!data) {
      const newUserProgress = await db.insert(userProgress).values({
        userId,
        userName: "User",
        userImageSrc: "/mascot.svg",
        hearts: 5,
        points: 0,
      }).returning();

      return newUserProgress[0];
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProgress:", error);
    return null; // إرجاع null بدلاً من إعادة توجيه الخطأ
  }
};

export const getUserCourseProgress = async (courseId: number) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return null;
    }

    const data = await db.query.userCourseProgress.findFirst({
      where: and(
        eq(userCourseProgress.userId, userId),
        eq(userCourseProgress.courseId, courseId)
      ),
      with: {
        course: {
          with: {
            units: {
              with: {
                lessons: {
                  with: {
                    challenges: {
                      with: {
                        challengeProgress: {
                          where: eq(challengeProgress.userId, userId)
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!data) {
      return null;
    }

    // Calculate total challenges and completed challenges
    let totalChallenges = 0;
    let completedChallenges = 0;

    data.course.units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        lesson.challenges.forEach(challenge => {
          totalChallenges++;
          if (challenge.challengeProgress?.some(progress => progress.completed)) {
            completedChallenges++;
          }
        });
      });
    });

    // Calculate progress percentage
    const progress = totalChallenges > 0
      ? Math.round((completedChallenges / totalChallenges) * 100)
      : 0;

    // Update progress in database if it has changed
    if (progress !== data.progress) {
      await db.update(userCourseProgress)
        .set({ progress })
        .where(and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.courseId, courseId)
        ));
    }

    return {
      ...data,
      progress,
      totalChallenges,
      completedChallenges
    };
  } catch (error) {
    console.error("Error in getUserCourseProgress:", error);
    return null;
  }
};

export const getAllUserCourseProgresses = async () => {
  try {
    const { userId } = auth();

    if (!userId) {
      return [];
    }

    const data = await db.query.userCourseProgress.findMany({
      where: eq(userCourseProgress.userId, userId),
      with: {
        course: true,
      },
    });

    return data;
  } catch (error) {
    console.error("Error in getAllUserCourseProgresses:", error);
    return [];
  }
};

/**
 * Calculate course progress for a specific user
 */
export const calculateCourseProgress = async (userId: string, courseId: number): Promise<number> => {
  try {
    console.log(`Calculating progress for user ${userId} in course ${courseId}`);
    
    // Get all lessons in the course through units
    const courseData = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        units: {
          with: {
            lessons: {
              with: {
                challenges: {
                  with: {
                    challengeProgress: {
                      where: eq(challengeProgress.userId, userId)
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!courseData || !courseData.units || courseData.units.length === 0) {
      console.log(`No course data found for course ${courseId}`);
      return 0;
    }

    // Calculate total lessons and completed lessons
    let totalLessons = 0;
    let completedLessons = 0;

    courseData.units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        totalLessons++;
        
        // A lesson is completed if all its challenges are completed
        const isLessonCompleted = lesson.challenges.length > 0 && 
          lesson.challenges.every(challenge => 
            challenge.challengeProgress && 
            challenge.challengeProgress.some(progress => progress.completed)
          );
        
        if (isLessonCompleted) {
          completedLessons++;
        }
      });
    });

    const progressPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    console.log(`Course ${courseId} progress: ${progressPercentage}% (${completedLessons}/${totalLessons} lessons)`);
    
    return progressPercentage;
  } catch (error) {
    console.error(`Error calculating course progress for user ${userId} in course ${courseId}:`, error);
    return 0;
  }
};

/**
 * Update course progress for a specific user
 */
export const updateUserCourseProgress = async (courseId: number, data: {
  lastActiveUnitId?: number;
  lastLessonId?: number;
  progress?: number;
  points?: number;
  completed?: boolean;
}) => {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return null;
    }
    
    // Calculate current progress if not provided
    let updatedData = { ...data };
    if (updatedData.progress === undefined) {
      const calculatedProgress = await calculateCourseProgress(userId, courseId);
      updatedData.progress = calculatedProgress;
      updatedData.completed = calculatedProgress === 100;
    }
    
    const existingProgress = await db.query.userCourseProgress.findFirst({
      where: and(
        eq(userCourseProgress.userId, userId),
        eq(userCourseProgress.courseId, courseId)
      ),
    });
    
    if (existingProgress) {
      await db
        .update(userCourseProgress)
        .set({ 
          ...updatedData,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(userCourseProgress.userId, userId),
            eq(userCourseProgress.courseId, courseId)
          )
        );
    } else {
      await db
        .insert(userCourseProgress)
        .values({
          userId,
          courseId,
          ...updatedData,
        });
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateUserCourseProgress:", error);
    return null;
  }
};

export const updateLastActiveUnit = async (unitId: number) => {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return null;
    }
    
    const userProgressData = await getUserProgress();
    if (!userProgressData?.activeCourseId) {
      return null;
    }
    
    await db
      .update(userProgress)
      .set({ 
        lastActiveUnitId: unitId,
      })
      .where(eq(userProgress.userId, userId));
    
    await updateUserCourseProgress(userProgressData.activeCourseId, {
      lastActiveUnitId: unitId
    });
      
    return true;
  } catch (error) {
    console.error("Error in updateLastActiveUnit:", error);
    return null;
  }
};

export const getUnits = async () => {
  try {
    const { userId } = auth();
    if (!userId) {
      return [];
    }

    const userProgressData = await getUserProgress();
    if (!userProgressData?.activeCourseId) {
      return [];
    }

    const data = await db.query.units.findMany({
      where: eq(units.courseId, userProgressData.activeCourseId),
      orderBy: [asc(units.order)],
      with: {
        course: true,
        lessons: {
          with: {
            challenges: {
              with: {
                challengeProgress: {
                  where: eq(challengeProgress.userId, userId)
                }
              }
            }
          }
        }
      }
    });

    // Process lessons completion status and add courseName
    return data.map(unit => ({
      ...unit,
      courseName: unit.course.title,
      lessons: unit.lessons.map(lesson => ({
        ...lesson,
        completed: lesson.challenges.every(challenge => 
          challenge.challengeProgress?.some(progress => progress.completed)
        )
      }))
    }));
  } catch (error) {
    console.error("Error in getUnits:", error);
    return [];
  }
};

export const getChapters = async (unitId: number) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return [];
    }

    const data = await db.query.chapters.findMany({
      where: eq(chapters.unitId, unitId),
      orderBy: [asc(chapters.order)],
      with: {
        unit: {
          with: {
            course: true
          }
        },
        lessons: {
          with: {
            challenges: {
              with: {
                challengeProgress: {
                  where: eq(challengeProgress.userId, userId)
                }
              }
            }
          }
        }
      }
    });

    // Process lessons completion status
    return data.map(chapter => ({
      ...chapter,
      lessons: chapter.lessons.map(lesson => ({
        ...lesson,
        completed: lesson.challenges.every(challenge => 
          challenge.challengeProgress?.some(progress => progress.completed)
        )
      }))
    }));
  } catch (error) {
    console.error("Error in getChapters:", error);
    return [];
  }
};

// استخدام cache للوظائف التي لا تتطلب auth
export const getCourses = cache(async () => {
  try {
    const data = await db.query.courses.findMany();
    return data;
  } catch (error) {
    console.error("Error in getCourses:", error);
    return [];
  }
});

export const getCourseById = cache(async (courseId: number) => {
  try {
    const data = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        units: {
          orderBy: (units, { asc }) => [asc(units.order)],
          with: {
            lessons: {
              orderBy: (lessons, { asc }) => [asc(lessons.order)],
            },
          },
        },
      },
    });

    return data;
  } catch (error) {
    console.error("Error in getCourseById:", error);
    return null;
  }
});

export const getCourseProgress = async () => {
  try {
    const { userId } = auth();
    const userProgressData = await getUserProgress();

    if (!userId || !userProgressData?.activeCourseId) {
      return null;
    }

    const unitsInActiveCourse = await db.query.units.findMany({
      orderBy: (units, { asc }) => [asc(units.order)],
      where: eq(units.courseId, userProgressData.activeCourseId),
      with: {
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order)],
          with: {
            unit: true,
            challenges: {
              with: {
                challengeProgress: {
                  where: eq(challengeProgress.userId, userId),
                },
              },
            },
          },
        },
      },
    });

    type Lesson = {
      id: number;
      title: string;
      order: number;
      unit: {
        id: number;
        title: string;
        description: string;
        order: number;
      };
      challenges: {
        challengeProgress?: { completed: boolean }[];
      }[];
    };

    let targetLessons: Lesson[] = [];

    if (userProgressData.lastActiveUnitId) {
      const activeUnit = unitsInActiveCourse.find(unit => unit.id === userProgressData.lastActiveUnitId);
      if (activeUnit) {
        targetLessons = activeUnit.lessons;
      }
    }

    if (targetLessons.length === 0) {
      targetLessons = unitsInActiveCourse.flatMap(unit => unit.lessons);
    }
    
    const firstUncompletedLesson = targetLessons
      .find((lesson) => {
        return lesson.challenges.some((challenge) => {
          return !challenge.challengeProgress 
            || challenge.challengeProgress.length === 0 
            || challenge.challengeProgress.some((progress) => progress.completed === false)
        });
      });

    return {
      activeLesson: firstUncompletedLesson,
      activeLessonId: firstUncompletedLesson?.id,
    };
  } catch (error) {
    console.error("Error in getCourseProgress:", error);
    return null;
  }
};

// إزالة cache من getLesson لأنها تستخدم auth
export const getLesson = async (id?: number) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return null;
    }

    const courseProgress = await getCourseProgress();

    const lessonId = id || courseProgress?.activeLessonId;

    if (!lessonId) {
      return null;
    }

    const data = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        challenges: {
          orderBy: (challenges, { asc }) => [asc(challenges.order)],
          with: {
            challengeOptions: true,
            challengeProgress: {
              where: eq(challengeProgress.userId, userId),
            },
          },
        },
      },
    });

    if (!data || !data.challenges) {
      return null;
    }

    const normalizedChallenges = data.challenges.map((challenge) => {
      const completed = challenge.challengeProgress 
        && challenge.challengeProgress.length > 0
        && challenge.challengeProgress.every((progress) => progress.completed)

      return { ...challenge, completed };
    });

    return { ...data, challenges: normalizedChallenges }
  } catch (error) {
    console.error("Error in getLesson:", error);
    return null;
  }
};

export const getLessonPercentage = async () => {
  try {
    const { userId } = auth();
    if (!userId) {
      return 0;
    }

    const userProgressData = await getUserProgress();
    if (!userProgressData?.activeCourseId) {
      return 0;
    }

    const units = await getUnits();
    if (!units || units.length === 0) {
      return 0;
    }

    let totalLessons = 0;
    let completedLessons = 0;

    units.forEach(unit => {
      unit.lessons.forEach(lesson => {
        totalLessons++;
        if (lesson.completed) {
          completedLessons++;
        }
      });
    });

    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  } catch (error) {
    console.error("Error in getLessonPercentage:", error);
    return 0;
  }
};

// إزالة cache من getUserSubscription لأنها تستخدم auth
export const getUserSubscription = async () => {
  try {
    const { userId } = auth();

    if (!userId) return null;

    const data = await db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
    });

    if (!data) return null;

    const DAY_IN_MS = 86_400_000;
    const isActive = 
      data.stripePriceId &&
      data.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return {
      ...data,
      isActive: !!isActive,
    };
  } catch (error) {
    console.error("Error in getUserSubscription:", error);
    return null;
  }
};

export const getTopTenUsers = async () => {
  try {
    const { userId } = auth();

    if (!userId) {
      return [];
    }

    const data = await db.query.userProgress.findMany({
      orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
      limit: 10,
      columns: {
        userId: true,
        userName: true,
        userImageSrc: true,
        points: true,
      },
    });

    return data;
  } catch (error) {
    console.error("Error in getTopTenUsers:", error);
    return [];
  }
};

export const setActiveCourse = async (courseId: number) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return null;
    }

    // Get or create user progress
    let userProgressData = await getUserProgress();
    
    if (!userProgressData) {
      userProgressData = (await db.insert(userProgress).values({
        userId,
        userName: "User",
        userImageSrc: "/mascot.svg",
        hearts: 5,
        points: 0,
        activeCourseId: courseId,
      }).returning())[0];
    } else {
      // Update active course
      userProgressData = (await db
        .update(userProgress)
        .set({ 
          activeCourseId: courseId,
          updatedAt: new Date(),
        })
        .where(eq(userProgress.userId, userId))
        .returning())[0];
    }

    // Get or create user course progress
    let userCourseProgressData = await db.query.userCourseProgress.findFirst({
      where: and(
        eq(userCourseProgress.userId, userId),
        eq(userCourseProgress.courseId, courseId)
      ),
    });

    if (!userCourseProgressData) {
      userCourseProgressData = (await db.insert(userCourseProgress).values({
        userId,
        courseId,
        progress: 0,
        points: 0,
      }).returning())[0];
    }

    // Get course details
    const courseData = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    return {
      ...userProgressData,
      activeCourse: courseData,
      courseProgress: userCourseProgressData,
    };
  } catch (error) {
    console.error("Error in setActiveCourse:", error);
    return null;
  }
}; 