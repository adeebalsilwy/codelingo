import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Revalidate the learn page and its subpages
    revalidatePath('/learn');
    revalidatePath('/learn/[unitId]');
    revalidatePath('/learn/[unitId]/[chapterId]');
    revalidatePath('/lesson/[lessonId]');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLEAR_CACHE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 