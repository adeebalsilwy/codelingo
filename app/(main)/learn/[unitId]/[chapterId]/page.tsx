import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getChapters } from "@/db/queries";
import {
  BookOpen,
  PlayCircle,
  ArrowRight,
  CheckCircle,
  BookOpenCheck,
} from "lucide-react";
import { YouTubeEmbed } from "@/app/components/YouTubeEmbed";

// ضبط سلوك الصفحة ليكون ديناميكي
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// تعريف معلمات الصفحة
type ChapterPageParams = {
    unitId: string;
    chapterId: string;
};

type PageProps = {
  params: Promise<ChapterPageParams>;
  searchParams: { [key: string]: string | string[] | undefined };
}

// استخدم نمط التصدير العادي بدلاً من التصدير الافتراضي
async function ChapterPage({ params, searchParams }: PageProps) {
  // Await the params since they're a Promise in Next.js 15
  const resolvedParams = await params;
  const unitId = parseInt(resolvedParams.unitId);
  const chapterId = parseInt(resolvedParams.chapterId);

  if (isNaN(unitId) || isNaN(chapterId)) {
    redirect("/");
  }

  const chapters = await getChapters(unitId);
  if (!chapters || chapters.length === 0) {
    redirect("/");
  }

  const currentChapter = chapters.find((chapter: any) => chapter.id === chapterId);
  if (!currentChapter) {
    redirect("/");
  }

  const currentChapterIndex = chapters.findIndex(
    (chapter: any) => chapter.id === chapterId
  );
  const nextChapter = chapters[currentChapterIndex + 1];
  const previousChapter = chapters[currentChapterIndex - 1];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Side - Chapter Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Breadcrumb */}
              <div className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link
                    href={`/learn/${unitId}`}
                    className="hover:text-primary transition-colors font-medium"
                  >
                    {currentChapter.unit.course.title}
                  </Link>
                  <span>›</span>
                  <Link
                    href={`/learn/${unitId}`}
                    className="hover:text-primary transition-colors font-medium"
                  >
                    {currentChapter.unit.title}
                  </Link>
                </div>
              </div>

              {/* Chapter Header */}
              <div className="p-8 border-b">
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {currentChapter.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{currentChapter.lessons.length} دروس</span>
                  </div>
                  {currentChapter.videoYoutube && (
                    <div className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" />
                      <span>يتضمن فيديو تعليمي</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chapter Description */}
              <div className="p-8 bg-gradient-to-b from-white to-gray-50/50">
                <div className="prose prose-slate max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: currentChapter.description,
                    }}
                  />
                </div>
              </div>

              {/* Video Section */}
              {currentChapter.videoYoutube && (
                <div className="px-8 pb-8">
                  <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                    <YouTubeEmbed url={currentChapter.videoYoutube} />
                  </div>
                </div>
              )}

              {/* Content Section */}
              {currentChapter.content && (
                <div className="px-8 pb-8">
                  <div className="prose prose-slate max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: currentChapter.content,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="p-8 border-t bg-gradient-to-b from-gray-50/50 to-white">
                <div className="flex justify-between items-center">
                  {previousChapter && (
                    <Link href={`/learn/${unitId}/${previousChapter.id}`}>
                      <Button
                        variant="secondaryOutline"
                        className="flex items-center gap-2"
                      >
                        <ArrowRight className="h-4 w-4 rotate-180" />
                        الفصل السابق
                      </Button>
                    </Link>
                  )}
                  {nextChapter && (
                    <Link href={`/learn/${unitId}/${nextChapter.id}`}>
                      <Button className="flex items-center gap-2">
                        التالي
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Lessons */}
          <div className="xl:w-[400px]">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpenCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">دروس هذا الفصل</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentChapter.lessons.length} دروس متاحة
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {currentChapter.lessons.map((lesson: any, index: number) => (
                  <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                    <div className="group relative">
                      <Button
                        variant={lesson.completed ? "default" : "secondary"}
                        className="w-full justify-between items-center h-auto p-4 text-base font-normal border-2 hover:bg-primary/5"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full ${
                              lesson.completed
                                ? "bg-primary text-white"
                                : "bg-primary/10 text-primary"
                            } flex items-center justify-center font-semibold`}
                          >
                            {lesson.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-left font-medium">
                              {lesson.title}
                            </span>
                            {lesson.challenges.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {lesson.challenges.length} تحديات
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </Button>
                      {index !== currentChapter.lessons.length - 1 && (
                        <div className="absolute left-6 top-[52px] w-[2px] h-[20px] bg-primary/10" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterPage;