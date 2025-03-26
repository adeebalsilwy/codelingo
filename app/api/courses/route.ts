import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import db from "@/db/client";
import { isAdmin } from "@/lib/admin-server";
import { courses, userCourseProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs";

export const runtime = 'nodejs';

// Add OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Total-Count, Content-Range',
      'Access-Control-Max-Age': '86400',
    },
  });
}

const availableCourses = [
  {
    id: 1,
    title: 'HTML & CSS Fundamentals',
    imageSrc: '/courses/html-css.jpg',
    description: 'Learn the basics of web development with HTML and CSS',
  },
  {
    id: 2,
    title: 'JavaScript Essentials',
    imageSrc: '/courses/javascript.jpg',
    description: 'Master the fundamentals of JavaScript programming',
  },
  {
    id: 3,
    title: 'React Development',
    imageSrc: '/courses/react.jpg',
    description: 'Build modern web applications with React',
  },
  {
    id: 4,
    title: 'Node.js Backend',
    imageSrc: '/courses/nodejs.jpg',
    description: 'Create server-side applications with Node.js',
  }
];

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch courses with their units and lessons for progress calculation
    const data = await db.query.courses.findMany({
      with: {
        units: {
          with: {
            lessons: {
              with: {
                challenges: true
              }
            }
          }
        }
      }
    });

    // Get user course progress
    const userProgress = await db.query.userCourseProgress.findMany({
      where: eq(userCourseProgress.userId, userId)
    });

    // Transform the data to include progress
    const coursesWithProgress = data.map(course => {
      const progress = userProgress.find(p => p.courseId === course.id);
      
      // Calculate total lessons
      let totalLessons = 0;
      course.units.forEach(unit => {
        totalLessons += unit.lessons.length;
      });

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        imageSrc: course.imageSrc || "/course-placeholder.png",
        lessonsCount: totalLessons,
        progress: progress?.progress || 0,
        completed: progress?.completed || false
      };
    });

    return NextResponse.json(coursesWithProgress);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const data = await db.insert(courses).values({
      ...body,
    }).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error creating course:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
