import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getChapters } from "@/db/queries";
import { BookOpen, PlayCircle, ArrowRight } from "lucide-react";
import { YouTubeEmbed } from "@/app/components/YouTubeEmbed";

interface PageProps {
  params: {
    unitId: string;
    chapterId: string;
  };
}

const ChapterPage = async ({ params }: PageProps) => {
  const unitId = parseInt(params.unitId);
  const chapterId = parseInt(params.chapterId);

  if (isNaN(unitId) || isNaN(chapterId)) {
    redirect("/");
  }

  const chapters = await getChapters(unitId);
  if (!chapters || chapters.length === 0) {
    redirect("/");
  }

  const currentChapter = chapters.find((chapter) => chapter.id === chapterId);
  if (!currentChapter) {
    redirect("/");
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 p-6">
      {/* Left Side - Chapter Content */}
      <div className="flex-1">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Breadcrumb */}
          <div className="px-6 py-4 border-b bg-slate-50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href={`/learn/${unitId}`} className="hover:text-primary transition-colors">
                {currentChapter.unit.course.title}
              </Link>
              <span>›</span>
              <Link href={`/learn/${unitId}`} className="hover:text-primary transition-colors">
                {currentChapter.unit.title}
              </Link>
            </div>
          </div>

          {/* Chapter Title and Description */}
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{currentChapter.title}</h1>
            <div className="prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentChapter.description }} />
            </div>
          </div>

          {/* Video Section */}
          {currentChapter.video_youtube && (
            <div className="px-6 pb-6">
              <div className="aspect-video rounded-lg overflow-hidden">
                <YouTubeEmbed url={currentChapter.video_youtube} />
              </div>
            </div>
          )}

          {/* Content Section */}
          {currentChapter.content && (
            <div className="px-6 pb-6">
              <div className="prose prose-slate max-w-none">
                <div dangerouslySetInnerHTML={{ __html: currentChapter.content }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Lessons */}
      <div className="xl:w-[380px]">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            دروس هذا الفصل
          </h2>
          <div className="space-y-3">
            {currentChapter.lessons.map((lesson, index) => (
              <Link key={lesson.id} href={`/lesson/${lesson.id}`}>
                <div className="group relative">
                  <Button
                    variant="secondary"
                    className="w-full justify-between items-center h-auto p-4 text-base font-normal border-2 hover:bg-secondary/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-left">{lesson.title}</span>
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
  );
};

export default ChapterPage;