'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

type Course = {
  id: number;
  title: string;
  imageSrc: string;
};

const CoursesPage = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!userId) {
          router.push('/');
          return;
        }

        const response = await fetch('/api/courses/list');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId, router]);

  const handleCourseSelect = async (courseId: number) => {
    try {
      if (!userId) {
        router.push('/');
        return;
      }

      setSelecting(true);
      setError(null);

      const response = await fetch('/api/user-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          hearts: 5,
          points: 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update course progress');
      }

      await router.push("/learn");
      router.refresh();
    } catch (error) {
      console.error('Error selecting course:', error);
      setError('Failed to select course. Please try again.');
      toast.error('Failed to select course. Please try again.');
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-white bg-primary px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => handleCourseSelect(course.id)}
            disabled={selecting}
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <h2 className="text-xl font-bold mb-2">{course.title}</h2>
            <div className="relative w-32 h-32">
              <Image
                src={course.imageSrc}
                alt={course.title}
                fill
                className="object-contain"
              />
            </div>
            {selecting && (
              <div className="mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CoursesPage;
