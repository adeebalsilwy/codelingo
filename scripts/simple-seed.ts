import "dotenv/config";
import { db } from "../db/client";
import { courses, units, chapters, lessons, challenges, challengeOptions } from "../db/schema";

async function main() {
  try {
    console.log("🌱 Starting simplified seeding process...");
    
    // Delete existing data in reverse order of dependencies
    console.log("Deleting existing data...");
    await db.delete(challengeOptions);
    await db.delete(challenges);
    await db.delete(lessons);
    await db.delete(chapters);
    await db.delete(units);
    await db.delete(courses);
    console.log("Existing data deleted successfully");
    
    // Create programming courses with minimum required fields
    const [cppCourse] = await db.insert(courses).values([
      {
        title: "برمجة ++C",
        imageSrc: "/cpp.svg"
      }
    ]).returning();

    console.log("Created C++ course:", cppCourse);

    // C++ Course Units with minimum required fields
    const cppUnit1 = await db.insert(units).values([
      {
        title: "أساسيات ++C",
        description: "تعلم المفاهيم الأساسية في لغة ++C",
        courseId: cppCourse.id,
        order: 1
      }
    ]).returning();

    console.log("Created C++ unit:", cppUnit1[0]);

    // C++ Chapters with minimum required fields
    const cppChapter1 = await db.insert(chapters).values([
      {
        title: "المتغيرات وأنواع البيانات",
        description: "تعلم المتغيرات وأنواع البيانات الأساسية",
        unitId: cppUnit1[0].id,
        order: 1
      }
    ]).returning();

    console.log("Created C++ chapter:", cppChapter1[0]);

    // C++ Lessons with minimum required fields
    const cppLesson1 = await db.insert(lessons).values([
      {
        title: "أنواع البيانات الأساسية",
        unitId: cppUnit1[0].id,
        chapterId: cppChapter1[0].id,
        order: 1
      }
    ]).returning();

    console.log("Created C++ lesson:", cppLesson1[0]);

    // C++ Challenges with minimum required fields
    const cppChallenge1 = await db.insert(challenges).values([
      {
        lessonId: cppLesson1[0].id,
        type: "SELECT",
        question: "ما هو نوع البيانات المناسب لتخزين عمر شخص؟",
        order: 1
      }
    ]).returning();

    console.log("Created C++ challenge:", cppChallenge1[0]);

    // C++ Challenge Options with minimum required fields
    const options = await db.insert(challengeOptions).values([
      {
        challengeId: cppChallenge1[0].id,
        text: "int",
        correct: true
      },
      {
        challengeId: cppChallenge1[0].id,
        text: "float",
        correct: false
      }
    ]).returning();

    console.log("Created challenge options:", options.length);
    
    console.log("✅ Simplified seeding completed successfully");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

main(); 