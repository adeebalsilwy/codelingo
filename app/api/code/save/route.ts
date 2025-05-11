import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import db from '@/db/drizzle';
import { codeSnippets } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, description, code, language, isPublic } = await request.json();

    // Validate input
    if (!title || !code || !language) {
      return NextResponse.json(
        { error: 'Title, code, and language are required' },
        { status: 400 }
      );
    }

    // Save code snippet to database
    const [snippet] = await db.insert(codeSnippets).values({
      title,
      description: description || '',
      code,
      language,
      userId,
      isPublic: isPublic || false,
    }).returning();

    return NextResponse.json({
      success: true,
      snippet,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 