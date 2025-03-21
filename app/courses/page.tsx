import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getCourses } from "@/db/queries";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

const CoursesPage = async () => {
  const { userId } = auth();
  
  if (!userId) {
    return redirect("/");
  }

  const courses = await getCourses();

  const handleCourseSelect = async (courseId: number) => {
    // تحديث الدورة النشطة للمستخدم
    await db
      .update(userProgress)
      .set({ 
        activeCourseId: courseId,
        // إعادة تعيين التقدم عند تغيير الدورة
        hearts: 5,
        points: 0
      })
      .where(eq(userProgress.userId, userId));

    // إعادة التوجيه إلى صفحة التعلم
    redirect("/learn");
  };

  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => handleCourseSelect(course.id)}
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-slate-100 transition"
          >
            <h2 className="text-xl font-bold mb-2">{course.title}</h2>
            <div className="relative w-32 h-32">
              <Image
                src={course.imageSrc}
                alt={course.title}
                fill
                className="object-contain"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CoursesPage; 