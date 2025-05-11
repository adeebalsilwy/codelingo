import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Configure Clerk middleware with our custom functionality
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/admin/check",
    "/api/webhook",
    "/learn",
    "/learn/(.*)",
    "/chat",
    "/code-editor",
    "/courses",
    "/guide"
  ],
  afterAuth(auth, req) {
    // Get the response from the auth middleware
    const response = NextResponse.next();
    
    // Check if there are any stored cookies for course progress
    const activeCourseId = req.cookies.get("activeCourseId")?.value;
    
    // If we have a course ID and the user is going to the learn page, we can use it
    if (activeCourseId && req.nextUrl.pathname === "/learn") {
      // Clone the response and set the active course ID cookie
      const newResponse = NextResponse.next();
      newResponse.cookies.set("activeCourseId", activeCourseId, { 
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return newResponse;
    }
    
    return response;
  }
});

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    // Apply middleware to all routes except static files, images, etc
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)",
  ],
}; 