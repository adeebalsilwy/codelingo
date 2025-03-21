import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { getCourses } from "@/db/queries";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courses = await getCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error("[COURSES_LIST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 