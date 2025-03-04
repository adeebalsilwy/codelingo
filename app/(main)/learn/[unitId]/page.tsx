import { redirect } from "next/navigation";
import { getChapters } from "@/db/queries";
import { ClientChaptersPage } from "./ClientPage";

interface PageProps {
  params: {
    unitId: string;
  };
}

const ChaptersPage = async ({ params }: PageProps) => {
  const unitId = parseInt(params.unitId);
  if (isNaN(unitId)) {
    redirect("/");
  }

  const chapters = await getChapters(unitId);
  if (!chapters || chapters.length === 0) {
    redirect("/");
  }

  const unit = chapters[0].unit;

  return <ClientChaptersPage unitId={unitId} unit={unit} chapters={chapters} />;
};

export default ChaptersPage;