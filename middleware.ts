import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Runtime configuration for middleware
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to add CORS headers
const addCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Total-Count, Content-Range, Range, Accept, X-Requested-With');
  response.headers.set('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count, Content-Length');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
};

// Configure Clerk middleware with our custom functionality
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/admin/check",
    "/api/webhook",
    "/api/webhook/stripe",

    "/learn",
    "/chat",
    "/code-editor",
    "/courses",
    "/guide"
  ],
  async afterAuth(auth, req) {
    // For API routes, add no-cache headers to prevent caching
    if (req.nextUrl.pathname.startsWith('/api')) {
      // Handle OPTIONS requests for CORS
      if (req.method === 'OPTIONS') {
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

      // For other API requests
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    // For admin routes, make sure only admins can access
   
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS' && req.nextUrl.pathname.startsWith('/api/')) {
      return addCorsHeaders(new NextResponse(null, { status: 204 }));
    }
    
    // Get the response from the auth middleware
    const response = NextResponse.next();
    
    // Add CORS headers for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      addCorsHeaders(response);
    }
    
    // Check if there are any stored cookies for course progress
    const activeCourseId = req.cookies.get("activeCourseId")?.value;
    
    // Check for course ID in the search params (higher priority than cookie)
    const url = new URL(req.nextUrl);
    const courseIdParam = url.searchParams.get("courseId");
    
    // Detect if this is the base /learn route or a unit route
    const isBaseLearnRoute = req.nextUrl.pathname === "/learn";
    const isUnitLearnRoute = req.nextUrl.pathname.startsWith("/learn/");
    
    // If we're on a learning-related route
    if (isBaseLearnRoute || isUnitLearnRoute) {
      // Create a new response to add cookies
      const newResponse = NextResponse.next();
      
      // Add the CORS headers to the new response too
      if (req.nextUrl.pathname.startsWith('/api/')) {
        addCorsHeaders(newResponse);
      }
      
      // If we have a course ID from the URL, update the cookie
      if (courseIdParam) {
        console.log(`Setting activeCourseId cookie from URL param: ${courseIdParam}`);
        newResponse.cookies.set("activeCourseId", courseIdParam, { 
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        return newResponse;
      } 
      // Otherwise, if we have a stored cookie, make sure it's set in the response
      else if (activeCourseId) {
        console.log(`Using existing activeCourseId cookie: ${activeCourseId}`);
        newResponse.cookies.set("activeCourseId", activeCourseId, { 
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        return newResponse;
      }
    }
    
    return response;
  }
});

// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}; 