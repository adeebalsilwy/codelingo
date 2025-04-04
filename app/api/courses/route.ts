import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import db from "@/db/client";
import { isAdmin } from "@/lib/admin-server";
import { courses, userCourseProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs";

// Runtime configurations
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';

// Add OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Total-Count, Content-Range, Range',
      'Access-Control-Expose-Headers': 'Content-Range, X-Total-Count',
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

export async function GET(req: Request) {
  try {
    // Parse search parameters if any
    const url = new URL(req.url);
    const filterParam = url.searchParams.get('filter');
    const rangeParam = url.searchParams.get('range');
    const sortParam = url.searchParams.get('sort');
    
    // Default values
    let filter = {};
    let start = 0;
    let end = 9;
    let sortField = 'id';
    let sortOrder = 'DESC';
    
    // Parse filter
    if (filterParam) {
      try {
        filter = JSON.parse(filterParam);
      } catch (e) {
        console.error('Invalid filter parameter:', filterParam);
      }
    }
    
    // Parse range
    if (rangeParam) {
      try {
        const range = JSON.parse(rangeParam);
        start = range[0] || 0;
        end = range[1] || 9;
      } catch (e) {
        console.error('Invalid range parameter:', rangeParam);
      }
    }
    
    // Parse sort
    if (sortParam) {
      try {
        const sort = JSON.parse(sortParam);
        sortField = sort[0] || 'id';
        sortOrder = sort[1] || 'DESC';
      } catch (e) {
        console.error('Invalid sort parameter:', sortParam);
      }
    }
    
    // Authentication - fix for sync issues
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Build query based on filter
    const conditions = [];
    
    if (filter && typeof filter === 'object') {
      if ('title' in filter && filter.title) {
        conditions.push(like(courses.title, `%${filter.title}%`));
      }
      
      if ('id' in filter && filter.id) {
        let numericId: number;
        try {
          numericId = typeof filter.id === 'string' ? parseInt(filter.id) : 
                      typeof filter.id === 'number' ? filter.id : parseInt(String(filter.id));
          
          if (!isNaN(numericId)) {
            conditions.push(eq(courses.id, numericId));
          }
        } catch (e) {
          console.error('Invalid id filter:', filter.id);
        }
      }
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Fetch courses with applied filters and pagination
    const data = await db.query.courses.findMany({
      where: whereClause,
      offset: start,
      limit: end - start + 1,
      orderBy: [sortOrder === 'ASC' 
        ? asc(courses[sortField as keyof typeof courses] as any) 
        : desc(courses[sortField as keyof typeof courses] as any)],
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

    // Get total count for pagination
    const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(whereClause || sql`TRUE`);

    const totalCount = Number(totalCountQuery[0].count);

    // If this is an admin request (has range parameter), return with Content-Range header
    if (rangeParam) {
      return NextResponse.json(data, {
        headers: {
          'Content-Range': `courses ${start}-${end}/${totalCount}`,
          'X-Total-Count': totalCount.toString(),
          'Access-Control-Expose-Headers': 'Content-Range, X-Total-Count'
        }
      });
    }

    // Otherwise, transform for normal user view with progress info
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
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Authentication - fix for sync issues
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Admin check - must use await
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.title) {
      return new NextResponse("Title is required", { status: 400 });
    }
    
    if (!body.imageSrc) {
      return new NextResponse("Image source is required", { status: 400 });
    }
    
    // Insert course
    const data = await db.insert(courses).values({
      title: body.title,
      description: body.description || '',
      imageSrc: body.imageSrc,
    }).returning();

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error creating course:", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
