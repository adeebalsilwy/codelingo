import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/admin-server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function GET() {
  try {
    // Check if in development mode - always return true for admin
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      console.log("[ADMIN_CHECK] Development mode detected, returning isAdmin: true");
      return NextResponse.json(
        { isAdmin: true, devMode: true },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Make sure to await the auth call
    const { userId } = await auth();
    
    // If no userId, return 401 Unauthorized with more helpful message
    if (!userId) {
      return NextResponse.json(
        { isAdmin: false, message: "Authentication required" },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }

    // Check admin status
    const isAdmin = await checkIsAdmin(userId);
    
    // Return 200 OK with isAdmin status
    return NextResponse.json(
      { isAdmin },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error("[ADMIN_CHECK]", error);
    
    // If it's an authentication error, return 401
    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json(
        { isAdmin: false, error: "Authentication error" },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
    }
    
    // For other errors, return 500 Internal Server Error
    return NextResponse.json(
      { isAdmin: false, error: "Failed to check admin status" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }
} 