import { redirect } from "next/navigation";
import { getChapters } from "@/db/queries";
import { UnitBanner } from "../unit-banner";
import Link from "next/link";

interface PageProps {
  params: {
    unitId: string;
  };
}

const ChaptersPage = async ({ params }: PageProps) => {
  try {
    const unitId = parseInt(params.unitId);
    if (isNaN(unitId)) {
      redirect("/");
    }

    const chapters = await getChapters(unitId);
    if (!chapters || chapters.length === 0) {
      redirect("/");
    }

    const unit = chapters[0]?.unit;
    if (!unit) {
      redirect("/");
    }

    return (
      <div className="flex flex-col gap-6">
        <UnitBanner
          title={unit.title || ""}
          description={unit.description || ""}
          unitId={unitId}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/learn/${unitId}/${chapter.id}`}
              className="p-6 border-2 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              <h3 className="text-xl font-bold mb-2">
                {chapter.title}
              </h3>
              <p className="text-muted-foreground">
                {chapter.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ChaptersPage:", error);
    redirect("/");
  }
};

export default ChaptersPage;