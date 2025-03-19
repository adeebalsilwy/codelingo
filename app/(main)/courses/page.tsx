import { getCourses, getUserProgress } from "@/db/queries";
import { List } from "./list";

const CoursesPage = async () => {
  try {
    const coursesData = getCourses();
    const userProgressData = getUserProgress();

    const [courses, userProgress] = await Promise.all([
      coursesData,
      userProgressData,
    ]);

    return (
      <div className="h-full max-w-[912px] px-3 mx-auto">
        <h1 className="text-2xl font-bold text-neutral-700">
          Language Courses
        </h1>
        <List
          courses={courses}
          activeCourseId={userProgress?.activeCourseId}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="h-full max-w-[912px] px-3 mx-auto flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-neutral-700 mb-2">
          Something went wrong
        </h1>
        <p className="text-muted-foreground">
          We could not load the courses. Please try again later.
        </p>
      </div>
    );
  }
};

export default CoursesPage;
