'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Star, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

/**
 * واجهات البيانات الرئيسية للكورسات والتقدم
 * Main data interfaces for courses and progress
 */
interface Course {
  id: number;
  title: string;
  imageSrc: string;
  description?: string;
  units: {
    id: number;
    title: string;
    lessons: {
      id: number;
      title: string;
      completed: boolean;
    }[];
  }[];
  userCourseProgress?: {
    progress: number;
    completed: boolean;
    lastActiveUnitId?: number | null;
    lastLessonId?: number | null;
  }[];
}

interface CourseProgress {
  courseId: number;
  progress: number;
  completed: boolean;
  lastActiveUnitId: number | null;
  lastLessonId: number | null;
}

interface UserProgress {
  activeCourseId: number | null;
  [key: string]: any;
}

/**
 * واجهة للطلبات المتكررة
 * Interface for retry fetch options
 */
interface RetryFetchOptions {
  url: string;
  options: RequestInit;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * صفحة الكورسات الرئيسية
 * Main courses page component
 */
const CoursesPage = () => {
  const router = useRouter();
  const { language, dir } = useI18n();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const isRtl = dir === 'rtl';
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [userProgressData, setUserProgressData] = useState<UserProgress | null>(null);
  const [userCourseProgresses, setUserCourseProgresses] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  /**
   * تسجيل طلبات API
   * Log API calls for debugging and monitoring
   */
  const logAPICall = useCallback((endpoint: string, status: string, details?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${endpoint} - ${status}`;
    console.log(logMessage, details || '');
    
    // For serious errors, we could send logs to a server
    if (status === 'ERROR' && process.env.NODE_ENV === 'production') {
      // In a production environment, you might want to send this to a logging service
      // Example: sendToLoggingService(endpoint, status, details);
    }
  }, []);

  /**
   * وظيفة طلب موثوقة مع إعادة المحاولة
   * Reliable fetch function with retry capability
   */
  const fetchWithRetry = useCallback(async (
    url: string, 
    options: RequestInit, 
    retryCount = 0,
    maxRetries = 2
  ): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok && retryCount < maxRetries) {
        const status = response.status;
        const retryDelay = Math.min(1000 * 2 ** retryCount, 5000);
        
        logAPICall(url, `RETRY ${retryCount + 1}/${maxRetries}`, { status });
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Retry
        return fetchWithRetry(url, options, retryCount + 1, maxRetries);
      }
      
      return response;
    } catch (error) {
      if (retryCount < maxRetries) {
        const retryDelay = Math.min(1000 * 2 ** retryCount, 5000);
        
        logAPICall(url, `NETWORK_RETRY ${retryCount + 1}/${maxRetries}`, { error });
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Retry
        return fetchWithRetry(url, options, retryCount + 1, maxRetries);
      }
      
      throw error;
    }
  }, [logAPICall]);

  /**
   * جلب بيانات الكورسات والتقدم
   * Fetch all course data and progress information
   */
  const fetchData = useCallback(async () => {
    try {
      // Don't fetch if not authenticated or offline
      if (!isSignedIn) {
        return;
      }
      
      if (isOffline) {
        setError(language === 'ar' ? 'أنت غير متصل بالإنترنت' : 'You are offline');
        return;
      }

      setIsLoading(true);
      setError(null);
      retryCount.current = 0;
      
      logAPICall('fetchData', 'START');
      
      try {
        // Try to fetch courses
        let coursesData;
        let userProgressData;
        let progressesData = [];
        
        const fetchOptions = {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
        };
        
        // First try the main courses endpoint
        try {
          logAPICall('/api/courses', 'REQUEST');
          const response = await fetchWithRetry('/api/courses', fetchOptions);
          
          logAPICall('/api/courses', `RESPONSE ${response.status}`);
          
          if (response.ok) {
            coursesData = await response.json();
            logAPICall('/api/courses', 'SUCCESS', { count: coursesData?.length || 0 });
          } else {
            const errorText = await response.text();
            logAPICall('/api/courses', 'ERROR', { status: response.status, text: errorText });
            throw new Error(`Failed to fetch from main endpoint: ${response.status}`);
          }
        } catch (error) {
          // If main endpoint fails, try backup endpoint
          logAPICall('/api/courses/list', 'FALLBACK_REQUEST');
          const response = await fetchWithRetry('/api/courses/list', fetchOptions);
          
          logAPICall('/api/courses/list', `RESPONSE ${response.status}`);
          
          if (response.ok) {
            coursesData = await response.json();
            logAPICall('/api/courses/list', 'SUCCESS', { count: coursesData?.length || 0 });
          } else {
            const errorText = await response.text();
            logAPICall('/api/courses/list', 'ERROR', { status: response.status, text: errorText });
            throw new Error(`Failed to fetch from backup endpoint: ${response.status}`);
          }
        }
        
        // Now fetch user progress
        try {
          logAPICall('/api/user-progress', 'REQUEST');
          const response = await fetchWithRetry('/api/user-progress', fetchOptions);
          
          logAPICall('/api/user-progress', `RESPONSE ${response.status}`);
          
          if (response.ok) {
            userProgressData = await response.json();
            logAPICall('/api/user-progress', 'SUCCESS');
          } else {
            const errorText = await response.text();
            logAPICall('/api/user-progress', 'ERROR', { status: response.status, text: errorText });
            throw new Error(`Failed to fetch user progress: ${response.status}`);
          }
        } catch (error) {
          logAPICall('/api/user-progress', 'FATAL_ERROR', { error });
          throw error;
        }
        
        // Fetch all course progresses at once to get data for all courses, not just active
        try {
          logAPICall('/api/user-course-progress', 'REQUEST');
          const response = await fetchWithRetry('/api/user-course-progress', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'X-Fetch-All-Courses': 'true' // Add header to indicate we want all courses
            }
          });
          
          logAPICall('/api/user-course-progress', `RESPONSE ${response.status}`);
          
          if (response.ok) {
            progressesData = await response.json();
            logAPICall('/api/user-course-progress', 'SUCCESS', { count: progressesData?.length || 0 });
          } else {
            const errorText = await response.text();
            logAPICall('/api/user-course-progress', 'ERROR', { status: response.status, text: errorText });
            console.warn(`Failed to fetch course progress: ${response.status}. Will try individual fetches.`);
          }
        } catch (error) {
          logAPICall('/api/user-course-progress', 'FATAL_ERROR', { error });
          console.warn('Error fetching course progresses. Will try individual fetches:', error);
        }

        // Validate data
        if (!Array.isArray(coursesData)) {
          const error = new Error('Invalid courses data format');
          logAPICall('data validation', 'ERROR', { coursesData });
          throw error;
        }
        
        if (!userProgressData || typeof userProgressData !== 'object') {
          const error = new Error('Invalid user progress data format');
          logAPICall('data validation', 'ERROR', { userProgressData });
          throw error;
        }
        
        logAPICall('fetchData', 'COMPLETE', { 
          courses: coursesData.length, 
          hasUserProgress: !!userProgressData,
          progresses: progressesData.length 
        });

        // If we don't have progress data for all courses, fetch it individually
        if (progressesData.length < coursesData.length) {
          // Create a map of courses that already have progress data
          const existingProgressCourseIds = new Set(progressesData.map((p: any) => p.courseId));
          
          // Create promises to fetch progress data for courses without existing progress
          const missingProgressPromises = coursesData
            .filter(course => !existingProgressCourseIds.has(course.id))
            .map(async (course) => {
              try {
                logAPICall(`/api/user-course-progress for course ${course.id}`, 'REQUEST');
                const response = await fetchWithRetry('/api/user-course-progress', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                  },
                  body: JSON.stringify({ 
                    courseId: course.id,
                    forceCalculate: true // Add parameter to force calculation
                  })
                });
                
                if (response.ok) {
                  const data = await response.json();
                  logAPICall(`/api/user-course-progress for course ${course.id}`, 'SUCCESS');
                  return data;
                }
                return null;
              } catch (error) {
                logAPICall(`/api/user-course-progress for course ${course.id}`, 'ERROR', { error });
                return null;
              }
            });
          
          // Wait for all missing progress data to be fetched
          const missingProgressResults = await Promise.all(missingProgressPromises);
          const validMissingProgresses = missingProgressResults.filter(Boolean);
          
          // Add the missing progress data to the existing progress data
          if (validMissingProgresses.length > 0) {
            progressesData = [...progressesData, ...validMissingProgresses];
            logAPICall('fetchData', 'FETCHED_MISSING_PROGRESSES', { 
              count: validMissingProgresses.length 
            });
          }
        }

        // Merge the course progress data with the courses data
        if (Array.isArray(progressesData) && progressesData.length > 0 && Array.isArray(coursesData)) {
          const progressMap = new Map();
          progressesData.forEach(progress => {
            if (progress && progress.courseId) {
              progressMap.set(progress.courseId, progress);
            }
          });

          // Update courses with progress data
          coursesData = coursesData.map(course => {
            const progress = progressMap.get(course.id);
            if (progress) {
              return {
                ...course,
                userCourseProgress: [{
                  progress: progress.progress,
                  completed: progress.completed,
                  lastActiveUnitId: progress.lastActiveUnitId,
                  lastLessonId: progress.lastLessonId
                }]
              };
            }
            return course;
          });

          console.log('Courses with progress:', coursesData.map(c => ({
            id: c.id,
            title: c.title,
            progress: c.userCourseProgress?.[0]?.progress || 0
          })));
        }

        // Direct API calls for each non-active course if no progress or zero progress
        const activeCourseId = userProgressData?.activeCourseId;
        const nonActiveCoursesWithNoProgress = coursesData.filter(course => {
          // If it's not the active course and has no progress data
          const hasNoProgress = !course.userCourseProgress || 
                                course.userCourseProgress.length === 0 || 
                                course.userCourseProgress[0].progress === 0;
          return course.id !== activeCourseId && hasNoProgress;
        });
        
        if (nonActiveCoursesWithNoProgress.length > 0) {
          console.log(`Found ${nonActiveCoursesWithNoProgress.length} non-active courses with no progress - fetching data...`);
          
          // Update coursesData and userCourseProgresses with direct fetch results
          for (const course of nonActiveCoursesWithNoProgress) {
            try {
              const response = await fetchWithRetry('/api/user-course-progress', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache',
                  'X-Force-Calculate': 'true' // Special header to force calculation
                },
                body: JSON.stringify({ courseId: course.id })
              });
              
              if (response.ok) {
                const data = await response.json();
                console.log(`Direct API call: Course ${course.id} has ${data.progress}% progress`);
                
                // Update in progressesData
                const progressIndex = progressesData.findIndex((p: any) => p.courseId === course.id);
                if (progressIndex >= 0) {
                  progressesData[progressIndex] = data;
                } else {
                  progressesData.push(data);
                }
                
                // Update in coursesData
                coursesData = coursesData.map(c => {
                  if (c.id === course.id) {
                    return {
                      ...c,
                      userCourseProgress: [{
                        progress: data.progress,
                        completed: data.completed,
                        lastActiveUnitId: data.lastActiveUnitId,
                        lastLessonId: data.lastLessonId
                      }]
                    };
                  }
                  return c;
                });
              }
            } catch (error) {
              console.error(`Error in direct progress fetch for course ${course.id}:`, error);
            }
          }
        }

        // Update state
        setCoursesData(coursesData);
        setUserProgressData(userProgressData);
        setUserCourseProgresses(progressesData);
      } catch (error) {
        logAPICall('fetchData', 'FAILED', { error });
        console.error('Error fetching data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(errorMessage);
        toast.error(language === 'ar' 
          ? `فشل في تحميل البيانات: ${errorMessage}` 
          : `Failed to load data: ${errorMessage}`
        );

        // Check if we've already tried several times
        if (retryCount.current >= maxRetries) {
          logAPICall('fetchData', 'MAX_RETRIES_REACHED');
          toast.error(language === 'ar' 
            ? 'تم الوصول للحد الأقصى من المحاولات، يرجى المحاولة لاحقًا' 
            : 'Maximum retry limit reached, please try again later'
          );
          return;
        }

        // Retry logic for network errors
        if (errorMessage.includes('Network error') || 
            errorMessage.includes('Failed to fetch') || 
            errorMessage.includes('NetworkError')) {
          retryCount.current += 1;
          const retryDelay = Math.min(1000 * 2 ** retryCount.current, 10000);
          
          toast.info(language === 'ar' 
            ? `جارٍ إعادة المحاولة (${retryCount.current}/${maxRetries})...` 
            : `Retrying (${retryCount.current}/${maxRetries})...`
          );
          
          logAPICall('fetchData', `AUTO_RETRY ${retryCount.current}/${maxRetries}`);
          
          setTimeout(() => {
            if (mounted) {
            fetchData();
            }
          }, retryDelay);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, language, isOffline, logAPICall, maxRetries, mounted, fetchWithRetry]);

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      console.log("User not signed in, redirecting to homepage");
      router.push('/');
      toast.error(
        language === 'ar'
          ? 'يجب تسجيل الدخول للوصول إلى الدورات'
          : 'You must be logged in to access courses'
      );
    }
  }, [isLoaded, isSignedIn, router, language]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success(
        language === 'ar'
          ? 'تم استعادة الاتصال'
          : 'Connection restored'
      );
      
      // Automatically refresh data when connection is restored
      if (mounted && isSignedIn) {
      fetchData();
    }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast.error(
        language === 'ar'
          ? 'انقطع الاتصال بالإنترنت'
          : 'You are offline'
      );
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial status
    setIsOffline(!window.navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language, mounted, isSignedIn, fetchData]);

  // Component mounted effect (after fetchData is defined)
  useEffect(() => {
    setMounted(true);
    
    // فحص الـ mounted فورًا ومحاولة تحميل البيانات
    if (isSignedIn) {
      console.log("Component mounted, initiating data fetch...");
      fetchData();
    }
    
    return () => setMounted(false);
  }, [isSignedIn, fetchData]);

  // Fetch data on language change
  useEffect(() => {
    if (mounted && isSignedIn) {
      console.log("Language changed, refreshing data...");
      fetchData();
    }
  }, [language, mounted, isSignedIn, fetchData]);

  // Manually fetch course progress for each course if needed
  const fetchCourseProgress = useCallback(async () => {
    if (!isSignedIn || coursesData.length === 0) return;
    
    try {
      console.log("Manually fetching course progress for all courses...");
      
      // First, check which courses need progress data
      const coursesNeedingProgress = coursesData.filter(course => 
        // Either no userCourseProgress property or it's empty
        !course.userCourseProgress || course.userCourseProgress.length === 0
      );
      
      if (coursesNeedingProgress.length === 0) {
        console.log("All courses already have progress data");
        return;
      }
      
      console.log(`Fetching progress for ${coursesNeedingProgress.length} courses...`);
      
      // Create promises for fetching progress of all courses in parallel
      const progressPromises = coursesNeedingProgress.map(async (course) => {
        try {
          const response = await fetchWithRetry(`/api/user-course-progress`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ courseId: course.id })
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Fetched progress for course ${course.id}: ${data.progress}%`);
            return data;
          }
          console.log(`Failed to fetch progress for course ${course.id}`);
          return null;
        } catch (error) {
          console.error(`Error fetching progress for course ${course.id}:`, error);
    return null;
  }
      });
      
      const results = await Promise.all(progressPromises);
      const newProgresses = results.filter(Boolean);
      
      if (newProgresses.length > 0) {
        console.log(`Fetched ${newProgresses.length} new course progresses`);
        
        // Update state with new progresses
        setUserCourseProgresses(prevProgresses => {
          // Create a map of existing progresses by courseId
          const existingMap = new Map(prevProgresses.map(p => [p.courseId, p]));
          
          // Update or add new progresses
          newProgresses.forEach(progress => {
            existingMap.set(progress.courseId, progress);
          });
          
          // Convert map back to array
          return Array.from(existingMap.values());
        });
        
        // Refresh courses with new progress data
        setCoursesData(prevCourses => 
          prevCourses.map(course => {
            const newProgress = newProgresses.find(p => p.courseId === course.id);
            if (newProgress) {
              return {
                ...course,
                userCourseProgress: [{
                  progress: newProgress.progress,
                  completed: newProgress.completed,
                  lastActiveUnitId: newProgress.lastActiveUnitId,
                  lastLessonId: newProgress.lastLessonId
                }]
              };
            }
            return course;
          })
        );
      }
    } catch (error) {
      console.error("Error fetching course progress:", error);
    }
  }, [isSignedIn, coursesData, fetchWithRetry]);

  // Use effect to fetch course progress after courses are loaded
  useEffect(() => {
    if (mounted && isSignedIn && coursesData.length > 0 && !isLoading) {
      // Check if we're missing progress data for any courses
      const missingProgressCount = coursesData.filter(course => 
        !course.userCourseProgress || course.userCourseProgress.length === 0
      ).length;
      
      if (missingProgressCount > 0) {
        console.log(`Missing progress data for ${missingProgressCount} courses - fetching now...`);
        fetchCourseProgress();
      }
    }
  }, [mounted, isSignedIn, coursesData.length, isLoading, fetchCourseProgress]);

  // Fetch progress for a specific course directly when needed
  const fetchProgressForCourse = useCallback(async (courseId: number): Promise<CourseProgress | null> => {
    if (!isSignedIn) return null;
    
    try {
      const response = await fetchWithRetry(`/api/user-course-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ courseId })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update course progresses state
        setUserCourseProgresses(prev => {
          const newProgresses = [...prev];
          const index = newProgresses.findIndex(p => p.courseId === courseId);
          if (index >= 0) {
            newProgresses[index] = data;
          } else {
            newProgresses.push(data);
          }
          return newProgresses;
        });
        
        // Update courses data with new progress
        setCoursesData(prevCourses => 
          prevCourses.map(course => {
            if (course.id === courseId) {
              return {
                ...course,
                userCourseProgress: [{
                  progress: data.progress,
                  completed: data.completed,
                  lastActiveUnitId: data.lastActiveUnitId,
                  lastLessonId: data.lastLessonId
                }]
              };
            }
            return course;
          })
        );
        
        return data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching progress for course ${courseId}:`, error);
      return null;
    }
  }, [isSignedIn, fetchWithRetry]);

  /**
   * حساب تقدم الكورس من البيانات المتاحة
   * Calculate course progress from available data
   */
  const getCourseProgress = (course: Course): CourseProgress => {
    // Debug info
    const isActive = userProgressData?.activeCourseId === course.id;
    console.log(`Calculating progress for course ${course.id}: ${course.title} (Active: ${isActive})`);
    
    // First check if we have progress in the userCourseProgresses state
    const progressFromState = userCourseProgresses.find(p => p.courseId === course.id);
    if (progressFromState) {
      console.log(`Using progress from state for course ${course.id}: ${progressFromState.progress}%`);
      return progressFromState;
    }
    
    // Then check if we have server progress data attached to the course
    if (course.userCourseProgress && course.userCourseProgress.length > 0) {
      const serverProgress = course.userCourseProgress[0];
      console.log(`Using server progress from course object for course ${course.id}: ${serverProgress.progress}%`);
      
      return {
        courseId: course.id,
        progress: serverProgress.progress,
        completed: serverProgress.completed,
        lastActiveUnitId: serverProgress.lastActiveUnitId || null,
        lastLessonId: serverProgress.lastLessonId || null
      };
    }
    
    // If we're here and this is NOT the active course, fetch its progress data 
    // This is a fallback mechanism to ensure non-active courses get their progress
    if (!isActive && !isLoading && mounted) {
      console.log(`No progress data found for non-active course ${course.id}. Fetching...`);
      // Use a timeout to avoid blocking rendering
      setTimeout(() => {
        fetchProgressForCourse(course.id);
      }, 100);
    }
    
    // Otherwise calculate manually from lessons
    console.log(`Calculating manual progress for course ${course.id} from lessons data`);
    
    // Handle courses with no units
    if (!course.units || course.units.length === 0) {
      console.log(`Course ${course.id} has no units, progress 0%`);
      return {
        courseId: course.id,
        progress: 0,
        completed: false,
        lastActiveUnitId: null,
        lastLessonId: null
      };
    }
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    // Count all lessons across units
    course.units.forEach(unit => {
      if (unit.lessons && unit.lessons.length > 0) {
        unit.lessons.forEach(lesson => {
          totalLessons++;
          if (lesson.completed) {
            completedLessons++;
          }
        });
      }
    });
    
    // Calculate progress percentage
    const progress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;
    
    console.log(`Course ${course.id} manual progress: ${progress}% (${completedLessons}/${totalLessons} lessons)`);
    
    return {
      courseId: course.id,
      progress: progress,
      completed: progress === 100,
      lastActiveUnitId: null,
      lastLessonId: null
    };
  };

  /**
   * حساب تقدم وحدة معينة
   * Calculate progress for a specific unit
   */
  const getUnitProgress = useCallback((unit: Course['units'][0]): number => {
    // Defensive programming
    if (!unit || !unit.lessons || !Array.isArray(unit.lessons) || unit.lessons.length === 0) return 0;
    
    // Filter valid lessons first
    const validLessons = unit.lessons.filter(lesson => lesson && typeof lesson === 'object');
    if (validLessons.length === 0) return 0;
    
    const completedLessons = validLessons.filter(lesson => 
      lesson && typeof lesson.completed === 'boolean' && lesson.completed
    ).length;
    
    return Math.round((completedLessons / validLessons.length) * 100);
  }, []);

  /**
   * معالجة اختيار الكورس
   * Handle course selection
   */
  const handleCourseSelect = async (courseId: number) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    logAPICall('handleCourseSelect', 'START', { courseId });
    
    try {
      // Check for offline status
      if (isOffline) {
        throw new Error('offline');
      }
      
      // First, try to find the course in local data to check if it exists
      const courseExists = coursesData.some(c => c.id === courseId);
      if (!courseExists) {
        throw new Error('course_not_found');
      }
      
      logAPICall('handleCourseSelect', 'SETTING_ACTIVE', { courseId });
      
      // Local fetchWithRetry for this function
      const fetchWithRetry = async (
        url: string, 
        options: RequestInit, 
        retryCount = 0,
        maxRetries = 2
      ): Promise<Response> => {
        try {
          const response = await fetch(url, options);
          
          if (!response.ok && retryCount < maxRetries) {
            const status = response.status;
            const retryDelay = Math.min(1000 * 2 ** retryCount, 5000);
            
            logAPICall(url, `RETRY ${retryCount + 1}/${maxRetries}`, { status });
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            
            // Retry
            return fetchWithRetry(url, options, retryCount + 1, maxRetries);
          }
          
          return response;
        } catch (error) {
          if (retryCount < maxRetries) {
            const retryDelay = Math.min(1000 * 2 ** retryCount, 5000);
            
            logAPICall(url, `NETWORK_RETRY ${retryCount + 1}/${maxRetries}`, { error });
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            
            // Retry
            return fetchWithRetry(url, options, retryCount + 1, maxRetries);
          }
          
          throw error;
        }
      };
      
      // Set the active course and get updated progress
      const response = await fetchWithRetry("/api/courses/set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        logAPICall('/api/courses/set-active', 'ERROR', { status: response.status, text: errorText });
        throw new Error('set_active_failed');
      }

      const updatedProgress = await response.json();
      logAPICall('/api/courses/set-active', 'SUCCESS', updatedProgress);
      
      // Update local state with the new progress data
      setUserProgressData(prev => ({
        ...prev,
        ...updatedProgress,
        activeCourseId: courseId
      }));
      
      // Clear any cached data
      try {
        await fetchWithRetry('/api/clear-cache', { method: 'POST' }, 0, 1);
        logAPICall('/api/clear-cache', 'SUCCESS');
      } catch (error) {
        logAPICall('/api/clear-cache', 'WARNING', { error });
        // We don't want to fail the whole operation if just the cache clear fails
      }
      
      // أولاً، نحاول الحصول على الوحدة الأولى من الكورس المختار
      let firstUnitId: number | null = null;
      
      // البحث عن الكورس في البيانات المحلية
      const selectedCourse = coursesData.find(c => c.id === courseId);
      logAPICall('handleCourseSelect', 'COURSE_FOUND', { 
        title: selectedCourse?.title,
        hasUnits: !!selectedCourse?.units
      });
      
      if (selectedCourse?.units && Array.isArray(selectedCourse.units) && selectedCourse.units.length > 0) {
        // في حالة وجود وحدات في الكورس، نأخذ أول وحدة
        firstUnitId = selectedCourse.units[0].id;
        logAPICall('handleCourseSelect', 'FIRST_UNIT_FROM_LOCAL', { unitId: firstUnitId });
      } else {
        // في حالة عدم وجود وحدات في البيانات المحلية، نحاول الحصول عليها من الخادم
        logAPICall('handleCourseSelect', 'FETCHING_UNITS_FROM_API', { courseId });
        try {
          const unitsResponse = await fetchWithRetry(`/api/courses/${courseId}`, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          if (unitsResponse.ok) {
            const courseDetails = await unitsResponse.json();
            logAPICall('/api/courses/:id', 'SUCCESS', { 
              unitCount: courseDetails.units?.length || 0 
            });
            
            if (courseDetails.units && Array.isArray(courseDetails.units) && courseDetails.units.length > 0) {
              firstUnitId = courseDetails.units[0].id;
              logAPICall('handleCourseSelect', 'FIRST_UNIT_FROM_API', { unitId: firstUnitId });
            } else {
              logAPICall('handleCourseSelect', 'NO_UNITS_FOUND_IN_API');
            }
          } else {
            const errorText = await unitsResponse.text();
            logAPICall('/api/courses/:id', 'ERROR', { 
              status: unitsResponse.status, 
              text: errorText 
            });
          }
        } catch (error) {
          logAPICall('handleCourseSelect', 'UNITS_FETCH_ERROR', { error });
        }
      }
      
      // Check if this user has progress for this course
      const courseProgress = userCourseProgresses.find(p => p.courseId === courseId);
      logAPICall('handleCourseSelect', 'COURSE_PROGRESS', { 
        hasProgress: !!courseProgress,
        lastActiveUnitId: courseProgress?.lastActiveUnitId
      });
      
      // تحديد التوجيه بناءً على البيانات المتاحة
      let redirectUrl: string;
      
      if (courseProgress?.lastActiveUnitId) {
        // إذا كان هناك وحدة تعلم نشطة سابقاً، فاستخدمها
        redirectUrl = `/learn/${courseProgress.lastActiveUnitId}?courseId=${courseId}&t=${Date.now()}`;
        logAPICall('handleCourseSelect', 'REDIRECT_TO_LAST_UNIT', { 
          unitId: courseProgress.lastActiveUnitId 
        });
      } else if (firstUnitId) {
        // إذا وجدنا الوحدة الأولى، استخدمها
        redirectUrl = `/learn/${firstUnitId}?courseId=${courseId}&t=${Date.now()}`;
        logAPICall('handleCourseSelect', 'REDIRECT_TO_FIRST_UNIT', { unitId: firstUnitId });
      } else {
        // إذا لم نجد أي وحدة، فانتقل إلى صفحة التعلم مع معرف الكورس فقط
        redirectUrl = `/learn?courseId=${courseId}&t=${Date.now()}`;
        logAPICall('handleCourseSelect', 'REDIRECT_TO_LEARN_NO_UNIT');
      }
      
      // توجيه المستخدم
      logAPICall('handleCourseSelect', 'REDIRECTING', { url: redirectUrl });
      router.push(redirectUrl);
      
      toast.success(
        language === 'ar' 
          ? 'تم تحديد الكورس بنجاح'
          : 'Course selected successfully'
      );
    } catch (error) {
      logAPICall('handleCourseSelect', 'ERROR', { error });
      console.error('Error selecting course:', error);
      
      // More specific error messages based on error type
      let errorMessage: string;
      
      if (error instanceof Error) {
        if (error.message === 'offline') {
          errorMessage = language === 'ar' 
            ? 'أنت غير متصل بالإنترنت حاليًا'
            : 'You are currently offline';
        } else if (error.message === 'course_not_found') {
          errorMessage = language === 'ar' 
            ? 'الكورس غير موجود'
            : 'Course not found';
        } else if (error.message === 'set_active_failed') {
          errorMessage = language === 'ar' 
            ? 'فشل في تعيين الكورس كنشط'
            : 'Failed to set course as active';
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = language === 'ar' 
          ? 'خطأ غير معروف'
          : 'Unknown error';
      }
      
      toast.error(
        language === 'ar' 
          ? `فشل في تحديد الكورس: ${errorMessage}`
          : `Failed to select course: ${errorMessage}`
      );
    } finally {
      setIsProcessing(false);
      logAPICall('handleCourseSelect', 'COMPLETE');
    }
  };

  /**
   * تحديث البيانات يدوياً
   * Manually refresh data
   */
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      // Clear cache first
      await fetchWithRetry('/api/clear-cache', { method: 'POST' }, 0, 1);
      
      // Then fetch fresh data
      await fetchData();
      
      // After data is loaded, ensure we fetch progress for all courses
      setTimeout(() => {
        if (coursesData.length > 0) {
          console.log("Fetching progress for all courses after refresh...");
          coursesData.forEach((course, index) => {
            setTimeout(() => {
              fetchProgressForCourse(course.id);
            }, index * 200); // Stagger requests
          });
        }
      }, 500);
      
      toast.success(
        language === 'ar'
          ? 'تم تحديث البيانات بنجاح'
          : 'Data refreshed successfully'
      );
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error(
        language === 'ar'
          ? 'فشل في تحديث البيانات'
          : 'Failed to refresh data'
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchData, language, isRefreshing, fetchWithRetry, coursesData, fetchProgressForCourse]);

  // Don't render anything while checking auth
 

  // Redirect if not authenticated
  if (!isSignedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title={language === 'ar' ? 'الكورسات' : 'Courses'} hasLogo />
        <div className="flex">
          <main className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Sidebar - Only visible on mobile */}

        {/* Main Content */}
        <main className="flex-1 px-2 py-4 sm:px-4 md:py-8 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            {/* Courses Header */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
              <h1 className={cn(
                "text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white",
                isRtl ? "text-right" : "text-left"
              )}>
                {language === 'ar' ? 'الدورات المتاحة' : 'Available Courses'}
              </h1>
              <p className={cn(
                "text-sm sm:text-base text-gray-600 dark:text-gray-300",
                isRtl ? "text-right" : "text-left"
              )}>
                {language === 'ar' 
                  ? 'اختر دورة للبدء في رحلة التعلم الخاصة بك'
                  : 'Choose a course to start your learning journey'}
              </p>
            </div>
              
              {/* Refresh Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="flex items-center gap-2 self-start sm:self-center"
              >
                <RefreshCw className={cn("h-4 w-4", (isRefreshing || isLoading) && "animate-spin")} />
                {language === 'ar' ? 'تحديث' : 'Refresh'}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ms-0 sm:ms-3">
                    <p className="text-sm font-medium">
                      {language === 'ar' 
                        ? `حدث خطأ: ${error}`
                        : `Error occurred: ${error}`
                      }
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      className="p-0 h-auto text-sm font-medium text-red-700 dark:text-red-400 mt-1"
                    >
                      {language === 'ar' ? 'إعادة المحاولة' : 'Try again'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Offline Message */}
            {isOffline && (
              <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 sm:px-4 sm:py-3 rounded dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="flex-shrink-0 mb-2 sm:mb-0">
                    <WifiOff className="h-5 w-5" />
                  </div>
                  <div className="ms-0 sm:ms-3">
                    <p className="text-sm font-medium">
                      {language === 'ar' 
                        ? 'أنت غير متصل بالإنترنت حاليًا'
                        : 'You are currently offline'
                      }
                    </p>
                    <p className="text-sm">
                      {language === 'ar' 
                        ? 'اتصل بالإنترنت لعرض الدورات المتاحة'
                        : 'Connect to the internet to view available courses'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Courses Message */}
            {!isLoading && coursesData.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {language === 'ar' ? 'لا توجد دورات متاحة' : 'No courses available'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {language === 'ar' 
                    ? 'لا توجد دورات متاحة في الوقت الحالي، يرجى التحقق مرة أخرى لاحقًا'
                    : 'There are no courses available at the moment, please check back later'
                  }
                </p>
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                  {language === 'ar' ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
            )}

            {/* Courses Grid with Responsive Layout */}
            {!isLoading && coursesData.length > 0 && (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {coursesData.map((course) => {
                // Get the progress for this course
                const progress = getCourseProgress(course);
                const isActive = userProgressData?.activeCourseId === course.id;
                
                // If progress is 0, and this course doesn't have userCourseProgress data, 
                // trigger a fetch for its progress (but don't block rendering)
                if (progress.progress === 0 && 
                    (!course.userCourseProgress || course.userCourseProgress.length === 0) && 
                    !userCourseProgresses.some(p => p.courseId === course.id)) {
                  // Use a setTimeout to avoid blocking rendering
                  setTimeout(() => {
                    fetchProgressForCourse(course.id);
                  }, 100);
                }
                
                // Debug log for progress data
                console.log(`Rendering course ${course.id}: ${course.title}`);
                console.log(`Progress: ${progress.progress}%, Active: ${isActive}, From state: ${userCourseProgresses.some(p => p.courseId === course.id)}, From course: ${!!course.userCourseProgress}`);
                
                return (
                  <Card
                    key={course.id}
                    className={cn(
                      "group relative overflow-hidden transition-all duration-300",
                      "hover:shadow-lg hover:scale-[1.02]",
                      "border-2",
                      isActive 
                        ? "ring-2 ring-[#235390] bg-[#235390]/5 border-[#235390]" 
                        : "hover:ring-2 hover:ring-primary/50 border-gray-200 dark:border-gray-700",
                      isProcessing && "opacity-70 pointer-events-none"
                    )}
                    onClick={() => handleCourseSelect(course.id)}
                  >
                    {/* Course Image with Overlay */}
                    <div className="relative aspect-video">
                      <Image
                        src={course.imageSrc || "/course-placeholder.png"}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {(progress.completed || progress.progress > 0) && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-3xl sm:text-4xl font-bold mb-1">{progress.progress}%</div>
                            <div className="text-xs sm:text-sm font-medium">
                              {language === 'ar' ? 'تقدم الدورة' : 'Course Progress'}
                            </div>
                          </div>
                        </div>
                      )}
                      {isActive && (
                        <div className={cn(
                          "absolute top-2 sm:top-3 px-2 py-1 sm:px-3 sm:py-1.5 bg-[#235390] text-white text-xs sm:text-sm font-medium rounded-full",
                          "shadow-lg backdrop-blur-sm",
                          isRtl ? "left-2 sm:left-3" : "right-2 sm:right-3"
                        )}>
                          {language === 'ar' ? 'نشط' : 'Active'}
                        </div>
                      )}
                    </div>

                    {/* Course Content */}
                    <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
                      <div>
                        <h3 className={cn(
                          "text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2",
                          "line-clamp-2",
                          isRtl ? "text-right" : "text-left"
                        )}>
                          {course.title}
                        </h3>
                        <p className={cn(
                          "text-xs sm:text-sm text-gray-600 dark:text-gray-300",
                          "line-clamp-2",
                          isRtl ? "text-right" : "text-left"
                        )}>
                          {course.description || (language === 'ar' ? `تعلم ${course.title}` : `Learn ${course.title}`)}
                        </p>
                      </div>

                      {/* Course Stats */}
                      <div className={cn(
                        "flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400",
                        isRtl ? "flex-row-reverse" : "flex-row"
                      )}>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{course.units?.reduce((total, unit) => total + unit.lessons.length, 0) || 0} {language === 'ar' ? 'درس' : 'lessons'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                      
                      {/* Progress Section */}
                      <div className="space-y-1 sm:space-y-2 pt-1 sm:pt-2">
                        <div className={cn(
                          "flex items-center justify-between text-xs sm:text-sm",
                          isRtl ? "flex-row-reverse" : ""
                        )}>
                          <span className="text-gray-600 dark:text-gray-300 font-medium">
                            {language === 'ar' ? 'تقدمك' : 'Your progress'}
                          </span>
                          <span className="font-bold text-[#235390] dark:text-blue-400">
                            {progress.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#58CC02] transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                        {progress.completed && (
                          <div className={cn(
                            "flex items-center gap-2 text-xs sm:text-sm text-[#58CC02] font-medium",
                            isRtl ? "justify-end" : ""
                          )}>
                            <span>🎉</span>
                            <span>
                              {language === 'ar' ? 'مكتمل' : 'Completed'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursesPage;
