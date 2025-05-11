import "dotenv/config";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
    console.log("🔍 Checking seeded data...");
    
    // Check courses
    const coursesQuery = `SELECT id, title, image_src FROM courses`;
    const courses = await sql(coursesQuery);
    
    console.log("Courses:", courses.length);
    console.table(courses);
    
    // Check units
    const unitsQuery = `SELECT id, title, course_id, "order" FROM units`;
    const units = await sql(unitsQuery);
    
    console.log("Units:", units.length);
    console.table(units);
    
    // Check chapters
    const chaptersQuery = `SELECT id, title, unit_id, "order" FROM chapters`;
    const chapters = await sql(chaptersQuery);
    
    console.log("Chapters:", chapters.length);
    console.table(chapters.slice(0, 5)); // Just showing the first 5 for brevity
    
    // Check lessons
    const lessonsQuery = `SELECT id, title, unit_id, chapter_id, "order" FROM lessons`;
    const lessons = await sql(lessonsQuery);
    
    console.log("Lessons:", lessons.length);
    console.table(lessons.slice(0, 5)); // Just showing the first 5 for brevity
    
    // Check challenges
    const challengesQuery = `SELECT id, lesson_id, type, "order" FROM challenges`;
    const challenges = await sql(challengesQuery);
    
    console.log("Challenges:", challenges.length);
    console.table(challenges.slice(0, 5)); // Just showing the first 5 for brevity
    
    console.log("✅ Data check completed!");
    
  } catch (error) {
    console.error("❌ Error checking data:", error);
    process.exit(1);
  }
}

main(); 