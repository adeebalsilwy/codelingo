import { NextResponse } from "next/server";
import { sql, and, or, like, desc, asc } from "drizzle-orm";
import db from "@/db/client";
import { isAdmin } from "@/lib/admin-server";
import { courses, userCourseProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs";

// Runtime configurations to prevent caching
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
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
    const fetchAllParam = url.searchParams.get('fetchAll'); 
    
    console.log(`[API] GET /courses - Filter: ${filterParam}, Range: ${rangeParam}, Sort: ${sortParam}, FetchAll: ${fetchAllParam}`);
    
    // Default values
    let filter = {};
    let start = 0;
    let end = 9;
    let sortField = 'id';
    let sortOrder = 'DESC';
    const fetchAll = fetchAllParam === 'true';
    
    // Parse filter
    if (filterParam) {
      try {
        filter = JSON.parse(filterParam);
        console.log(`[API] Parsed filter:`, filter);
      } catch (e) {
        console.error('Invalid filter parameter:', filterParam, e);
      }
    }
    
    // Parse range
    if (rangeParam) {
      try {
        const range = JSON.parse(rangeParam);
        start = range[0] || 0;
        end = range[1] || 9;
        console.log(`[API] Using range: ${start}-${end}`);
      } catch (e) {
        console.error('Invalid range parameter:', rangeParam, e);
      }
    }
    
    // Parse sort
    if (sortParam) {
      try {
        const sort = JSON.parse(sortParam);
        sortField = sort[0] || 'id';
        sortOrder = sort[1] || 'DESC';
        console.log(`[API] Using sort: ${sortField} ${sortOrder}`);
      } catch (e) {
        console.error('Invalid sort parameter:', sortParam, e);
      }
    }
    
    // Skip authentication check - allow all operations
    const userId = "bypass-auth";

    // Build query based on filter
    const conditions = [];
    
    if (filter && typeof filter === 'object') {
      // Handle title filter (partial match)
      if ('title' in filter && filter.title) {
        conditions.push(like(courses.title, `%${filter.title}%`));
      }
      
      // Handle ID filter (exact match)
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
      
      // Handle full-text search (q parameter)
      if ('q' in filter && filter.q) {
        conditions.push(or(
          like(courses.title, `%${filter.q}%`),
          like(courses.description, `%${filter.q}%`)
        ));
      }
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Validate sortField against schema to prevent SQL injection
    const validSortFields = ['id', 'title', 'description', 'imageSrc', 'createdAt', 'updatedAt'];
    if (!validSortFields.includes(sortField)) {
      sortField = 'id'; // Fallback to default
    }
    
    try {
      // Prepare query options
      const queryOptions: any = {
        where: whereClause,
        orderBy: [sortOrder.toUpperCase() === 'ASC' 
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
      };
      
      // Add pagination only if not fetching all
      if (!fetchAll) {
        queryOptions.offset = start;
        queryOptions.limit = end - start + 1;
      }
      
      console.log(`[API] Executing query with ${fetchAll ? 'NO PAGINATION' : `pagination: offset=${start}, limit=${end - start + 1}`}`);
      
      // Fetch courses with applied filters and pagination
      const data = await db.query.courses.findMany(queryOptions);

      console.log(`[API] Found ${data.length} courses`);

      // Get total count for pagination
      const totalCountQuery = await db.select({ count: sql<number>`count(*)` })
        .from(courses)
        .where(whereClause || sql`TRUE`);

      const totalCount = Number(totalCountQuery[0].count);
      
      console.log(`[API] Total count: ${totalCount}, Fetch all: ${fetchAll}`);

      // If this is an admin request (has range parameter), return with Content-Range header
      if (rangeParam) {
        const effectiveEnd = fetchAll ? (totalCount - 1) : Math.min(end, totalCount - 1);
        const contentRange = `courses ${start}-${effectiveEnd}/${totalCount}`;
        
        console.log(`[API] Returning with Content-Range: ${contentRange}`);
        
        return NextResponse.json(data, {
          headers: {
            'Content-Range': contentRange,
            'X-Total-Count': totalCount.toString(),
            'Access-Control-Expose-Headers': 'Content-Range, X-Total-Count',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      }

      // Otherwise, transform for normal user view with progress info
      // Get user course progress
      const userProgress = await db.query.userCourseProgress.findMany({
        where: eq(userCourseProgress.userId, userId)
      });

      // Transform the data to include progress
      const coursesWithProgress = data.map((course: any) => {
        const progress = userProgress.find(p => p.courseId === course.id);
        
        // Calculate total lessons
        let totalLessons = 0;
        if (course.units && Array.isArray(course.units)) {
          course.units.forEach((unit: any) => {
            totalLessons += unit.lessons?.length || 0;
          });
        }

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          imageSrc: course.imageSrc || "/courses.svg",
          lessonsCount: totalLessons,
          progress: progress?.progress || 0,
          completed: progress?.completed || false
        };
      });

      return NextResponse.json(coursesWithProgress, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    } catch (dbError) {
      console.error("[API] Database error when fetching courses:", dbError);
      return new NextResponse(`Database Error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}

export async function POST(req: Request) {
  try {
    console.log("[API] POST /courses - Starting course creation");
    
    // Skip authentication and admin checks - allow all operations

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log(`[API] POST /courses - Request body parsed:`, body);
    } catch (error) {
      console.error("[API] POST /courses - Failed to parse request body:", error);
      return new NextResponse(`Invalid request body - ${error instanceof Error ? error.message : 'JSON parsing error'}`, { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
    
    // Validate required fields
    if (!body.title) {
      console.log("[API] POST /courses - Validation failed: Title is required");
      return new NextResponse("Title is required", { 
        status: 400,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
    
    // Process image data
    let imageSrc = '/courses.svg';
    
    if (body.imageSrc) {
      // Check if imageSrc is a string or an object with src
      if (typeof body.imageSrc === 'string' && body.imageSrc.trim() !== '') {
        imageSrc = body.imageSrc;
        console.log(`[API] POST /courses - Using image from string: ${imageSrc}`);
      } else if (typeof body.imageSrc === 'object') {
        // Try to extract src from object
        if (body.imageSrc.src && typeof body.imageSrc.src === 'string' && body.imageSrc.src.trim() !== '') {
          imageSrc = body.imageSrc.src;
          console.log(`[API] POST /courses - Using image from object.src: ${imageSrc}`);
        } else if (body.imageSrc.url && typeof body.imageSrc.url === 'string' && body.imageSrc.url.trim() !== '') {
          imageSrc = body.imageSrc.url;
          console.log(`[API] POST /courses - Using image from object.url: ${imageSrc}`);
        } else if (body.imageSrc.rawFile) {
          // For raw files, we should have processed these already, but just in case
          console.log(`[API] POST /courses - Received rawFile but these should be processed by dataProvider`);
          // Keep default image in this case
        }
      }
    }
    
    // Final check to ensure imageSrc is not empty
    if (!imageSrc || imageSrc.trim() === '') {
      imageSrc = '/courses.svg';
      console.log(`[API] POST /courses - Empty imageSrc, falling back to default image`);
    }
    
    console.log(`[API] POST /courses - Using final image: ${imageSrc}`);
    
    try {
      // Insert course
      console.log(`[API] POST /courses - Inserting new course into database:`, {
        title: body.title,
        description: body.description || '',
        imageSrc: imageSrc
      });
      
      const data = await db.insert(courses).values({
        title: body.title,
        description: body.description || '',
        imageSrc: imageSrc,
      }).returning();

      console.log(`[API] Course created successfully with ID: ${data[0].id}`);

      return NextResponse.json(data[0], {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    } catch (dbError) {
      console.error("[API] POST /courses - Database error:", dbError);
      return new NextResponse(`Database Error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }
  } catch (error) {
    console.error("[API] POST /courses - Unhandled error:", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}

export async function DELETE(req: Request) {
  try {
    console.log("[API] DELETE /courses - Processing delete request");
    
    // Get URL parameters for single delete
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    // Handle single delete case
    if (id) {
      const courseId = parseInt(id);
      
      if (isNaN(courseId)) {
        return new NextResponse("Invalid course ID", { status: 400 });
      }

      console.log(`[API] DELETE /courses - Deleting single course with ID: ${courseId}`);
      
      // Find current course to ensure it exists
      const currentCourse = await db.query.courses.findFirst({
        where: eq(courses.id, courseId)
      });

      if (!currentCourse) {
        return new NextResponse("Course not found", { status: 404 });
      }

      // Delete course
      await db.delete(courses).where(eq(courses.id, courseId));
      
      console.log(`[API] DELETE /courses - Successfully deleted course with ID: ${courseId}`);
      return new NextResponse(null, { status: 204 });
    }
    
    // Handle bulk delete
    try {
      const body = await req.json();
      
      if (Array.isArray(body.ids) && body.ids.length > 0) {
        console.log(`[API] DELETE /courses - Bulk delete for IDs: ${body.ids.join(', ')}`);
        
        // Convert all IDs to integers
        const courseIds = body.ids.map((id: any) => parseInt(id)).filter((id: number) => !isNaN(id));
        
        if (courseIds.length === 0) {
          return new NextResponse("No valid course IDs provided", { status: 400 });
        }
        
        // Filter courses table where id in the list of IDs
        for (const courseId of courseIds) {
          await db.delete(courses).where(eq(courses.id, courseId));
        }
        
        console.log(`[API] DELETE /courses - Successfully deleted ${courseIds.length} courses`);
        return new NextResponse(null, { status: 204 });
      } else {
        return new NextResponse("No course IDs provided", { status: 400 });
      }
    } catch (parseError) {
      console.error("[API] DELETE /courses - Failed to parse request body:", parseError);
      
      // For DELETE without a body, just return a 204
      if (parseError instanceof SyntaxError && parseError.message.includes('Unexpected end of JSON input')) {
        console.log("[API] DELETE /courses - Empty request body, responding with OK");
        return new NextResponse(null, { status: 204 });
      }
      
      return new NextResponse(`Invalid request body: ${parseError instanceof Error ? parseError.message : 'JSON parsing error'}`, { 
        status: 400 
      });
    }
  } catch (error) {
    console.error("[API] DELETE /courses - Unhandled error:", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}
