export interface Challenge {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  lessonId: number;
}

export interface Lesson {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  order: number;
  unitId: number;
  chapterId: number;
  challenges: Challenge[];
}

export interface Chapter {
  id: number;
  title: string;
  description: string | null;
  order: number;
  unitId: number;
  lessons: Lesson[];
}

export interface Unit {
  id: number;
  title: string;
  description: string | null;
  order: number;
  courseId: number;
  chapters: Chapter[];
  courseName: string;
  lessons: Lesson[];
  course: {
    id: number;
    title: string;
  };
}

export interface CourseProgress {
  activeLesson?: Lesson;
  activeLessonId?: number;
  lastLessonId?: number;
}

export interface UserProgress {
  activeCourseId: number;
  points: number;
  streak: number;
  lastLessonId?: number;
} 