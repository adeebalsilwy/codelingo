import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/db/client";
import { chapters } from "@/db/schema";
import { isAdmin } from "@/lib/admin-server";
import { auth } from "@clerk/nextjs";

// Set dynamic to force dynamic rendering
export const dynamic = 'force-dynamic';

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Total-Count',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export const GET = async (
  req: Request,
  { params }: { params: { chapterId: string } },
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapterId = parseInt(params.chapterId);
    
    if (isNaN(chapterId)) {
      return new NextResponse("Invalid chapter ID", { status: 400 });
    }

    const chapter = await db.query.chapters.findFirst({
      where: eq(chapters.id, chapterId),
      with: {
        unit: {
          with: {
            course: true
          }
        }
      }
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("[CHAPTER_GET]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
};

export const PUT = async (
  req: Request,
  { params }: { params: { chapterId: string } },
) => {
  try {
    // Verify admin status
    if (!await isAdmin()) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const chapterId = parseInt(params.chapterId);
    
    if (isNaN(chapterId)) {
      return new NextResponse("Invalid chapter ID", { status: 400 });
    }

    // Find current chapter to ensure it exists
    const currentChapter = await db.query.chapters.findFirst({
      where: eq(chapters.id, chapterId)
    });

    if (!currentChapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    
    // Create update object with existing values as fallback
    const updateData = {
      title: body.title || currentChapter.title,
      description: body.description || currentChapter.description,
      content: body.content !== undefined ? body.content : currentChapter.content,
      videoYoutube: body.videoYoutube,
      unitId: body.unitId || currentChapter.unitId,
      order: body.order || currentChapter.order
    };

    // Update chapter
    const updatedChapter = await db.update(chapters)
      .set(updateData)
      .where(eq(chapters.id, chapterId))
      .returning();

    if (!updatedChapter || updatedChapter.length === 0) {
      return new NextResponse("Failed to update chapter", { status: 500 });
    }

    return NextResponse.json(updatedChapter[0]);
  } catch (error) {
    console.error("[CHAPTER_PUT]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { chapterId: string } },
) => {
  try {
    // Verify admin status
    if (!await isAdmin()) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const chapterId = parseInt(params.chapterId);
    
    if (isNaN(chapterId)) {
      return new NextResponse("Invalid chapter ID", { status: 400 });
    }

    // Find current chapter to ensure it exists
    const currentChapter = await db.query.chapters.findFirst({
      where: eq(chapters.id, chapterId)
    });

    if (!currentChapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // Delete chapter
    await db.delete(chapters)
      .where(eq(chapters.id, chapterId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHAPTER_DELETE]", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
};