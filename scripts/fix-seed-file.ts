import "dotenv/config";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  try {
    console.log("🔧 Fixing seed-programming.ts file...");
    
    const seedFilePath = path.join(__dirname, 'seed-programming.ts');
    let seedContent = fs.readFileSync(seedFilePath, 'utf8');
    
    // Replace all instances of lessons with description field
    // The lessons table should have:
    // {
    //   title: "...",
    //   unitId: ...,
    //   chapterId: ...,
    //   order: ...
    // }
    
    console.log("Modifying lessons entries to remove description field...");
    
    // Use regex to find and modify lesson entries
    const lessonEntryRegex = /{\s*title:\s*"[^"]+"\s*,(\s*description:\s*"[^"]*"\s*,)?\s*unitId:[^,]+,\s*chapterId:[^,]+,\s*order:\s*\d+\s*}/g;
    
    // Function to process each lesson entry
    const processLessonEntry = (match: string) => {
      if (match.includes('description:')) {
        return match.replace(/,\s*description:\s*"[^"]*"\s*,/, ', ');
      }
      return match;
    };
    
    // Replace all lesson entries
    seedContent = seedContent.replace(lessonEntryRegex, processLessonEntry);
    
    // Write the modified content back to the file
    fs.writeFileSync(seedFilePath, seedContent, 'utf8');
    
    console.log("✅ Seed file has been fixed. Description fields have been removed from lesson entries.");
    
  } catch (error) {
    console.error("❌ Error fixing seed file:", error);
    process.exit(1);
  }
}

main(); 