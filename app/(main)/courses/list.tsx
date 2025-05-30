"use client";

import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { courses, userProgress } from "@/db/schema";
import { upsertUserProgress } from "@/actions/user-progress";
import { useI18n } from "@/app/i18n/client";

import { Card } from "./card";

type Props = {
  courses: typeof courses.$inferSelect[];
  activeCourseId?: typeof userProgress.$inferSelect.activeCourseId;
};

export const List = ({ courses, activeCourseId }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";

  const onClick = async (id: number) => {
    if (pending) return;

    if (id === activeCourseId) {
      return router.push("/learn");
    }

    startTransition(async () => {
      try {
        await upsertUserProgress(id);
        router.push("/learn");
      } catch (error: any) {
        if (error.message === "Course is empty") {
          toast.error(isRtl ? "هذه الدورة لا تحتوي على دروس بعد" : "This course has no lessons yet");
        } else if (error.message === "Course not found") {
          toast.error(isRtl ? "لم يتم العثور على الدورة" : "Course not found");
        } else if (error.message === "Unauthorized") {
          toast.error(isRtl ? "يرجى تسجيل الدخول للوصول إلى الدورة" : "Please login to access the course");
        } else {
          toast.error(isRtl ? "حدث خطأ ما" : "Something went wrong");
        }
      }
    });
  };

  if (!courses.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-neutral-700 mb-2">
          {isRtl ? "لا توجد دورات متاحة حالياً" : "No courses available"}
        </h2>
        <p className="text-muted-foreground">
          {isRtl ? "يرجى المحاولة مرة أخرى لاحقاً" : "Please check back later"}
        </p>
      </div>
    );
  }

  return (
    <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          imageSrc={course.imageSrc || '/courses.svg'}
          onClick={onClick}
          disabled={pending}
          active={course.id === activeCourseId}
        />
      ))}
      {pending && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">
              {isRtl ? "جاري التحميل..." : "Loading..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
