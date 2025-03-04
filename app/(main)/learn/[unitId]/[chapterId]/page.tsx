import { redirect } from "next/navigation";
import { getChapters } from "@/db/queries";
import ClientPage from "./ClientPage";
import { notFound } from "next/navigation";

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
    return redirect("/");
  }

  try {
    const chapters = await getChapters(unitId);
    
    if (!chapters || chapters.length === 0) {
      return notFound();
    }

    const currentChapter = chapters.find((chapter) => chapter.id === chapterId);
    
    if (!currentChapter) {
      return notFound();
    }

    return <ClientPage currentChapter={currentChapter} />;
  } catch (error) {
    console.error('Error in ChapterPage:', error);
    return notFound();
  }
};

export default ChapterPage;