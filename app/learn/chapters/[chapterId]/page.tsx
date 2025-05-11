import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import db from "@/db/client";
import { chapters } from "@/db/schema";
import { eq } from "drizzle-orm";
import { YouTubeEmbed } from "@/app/components/YouTubeEmbed";

export default async function Page({
  params,
}: {
  params: { chapterId: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const chapter = await db.query.chapters.findFirst({
    where: eq(chapters.id, parseInt(params.chapterId)),
    with: {
      unit: {
        with: {
          course: true
        }
      }
    }
  });

  if (!chapter) {
    return redirect("/learn");
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">{chapter.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {chapter.unit.course.title} &gt; {chapter.unit.title}
          </p>
          <div className="prose prose-stone dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: chapter.description }} />
          </div>
        </div>

        {chapter.videoYoutube && (
          <div className="aspect-video">
            <YouTubeEmbed url={chapter.videoYoutube} />
          </div>
        )}

        {chapter.content && (
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
          </div>
        )}
      </div>
    </div>
  );
} 