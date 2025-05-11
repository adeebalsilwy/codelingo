import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

// Runtime conGGGfiguration for middleware
export const runtime = 'experimental-edge';
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
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/sso-callback(.*)",
    "/api(.*)",
    "/courses",
    "/pricing",
    "/api/webhooks(.*)",
    "/about",
    "/privacy",
    "/terms",
    "/contact",
  ],
  // Routes that can be accessed if the user has metadata for them
  afterAuth(auth, req) {
    // If the user is not signed in and the route is not public, redirect to sign-in
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // If trying to access admin and not an admin, redirect to home
    // if (req.nextUrl.pathname.startsWith("/admin")) {
    //   try {
    //     // تحسين التحقق من صلاحيات الأدمن
    //     // استخدام public_metadata بدلاً من metadata
    //     const isAdmin = auth.sessionClaims?.public_metadata?.isAdmin === true;
        
    //     console.log(`[middleware] Admin access attempt by ${auth.userId}, isAdmin:`, isAdmin);
        
    //     if (!isAdmin) {
    //       console.log(`[middleware] Redirecting non-admin user ${auth.userId} from admin area`);
    //       return NextResponse.redirect(new URL("/", req.url));
    //     }
    //   } catch (error) {
    //     console.error("[middleware] Error checking admin status:", error);
    //     return NextResponse.redirect(new URL("/", req.url));
    //   }
    // }
    
    return NextResponse.next();
  },
});

// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 