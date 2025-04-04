import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Configure Clerk middleware with our custom functionality
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/admin/check",
    "/api/webhook",
    "/learn",
    "/chat",
    "/code-editor",
    "/courses",
    "/guide"
  ],
  async afterAuth(auth, req) {
    // Get the response from the auth middleware
    const response = NextResponse.next();
    
    // Add CORS headers for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Total-Count, Content-Range');
      response.headers.set('Access-Control-Max-Age', '86400');
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
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Total-Count, Content-Range');
        newResponse.headers.set('Access-Control-Max-Age', '86400');
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