import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

async function main() {
  try {
    console.log("🔧 Updating import statements from db/drizzle to db/client...");
    
    // Find all TypeScript files in the project
    const files = await glob('**/*.{ts,tsx}', {
      ignore: ['node_modules/**', '.next/**', 'scripts/update-imports.ts']
    });
    
    let updatedFilesCount = 0;
    
    for (const file of files) {
      const filePath = path.join(process.cwd(), file);
      
      // Skip if the file doesn't exist or isn't readable
      if (!fs.existsSync(filePath)) {
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if the file imports from db/drizzle
      if (content.includes('from "@/db/drizzle"') || content.includes('from "../db/drizzle"')) {
        console.log(`Processing: ${file}`);
        
        // Replace the imports
        const updatedContent = content
          .replace(/from "\.\.\/db\/drizzle"/g, 'from "../db/client"')
          .replace(/from "@\/db\/drizzle"/g, 'from "@/db/client"');
        
        if (content !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent, 'utf8');
          updatedFilesCount++;
        }
      }
    }
    
    console.log(`✅ Updated import statements in ${updatedFilesCount} files!`);
    
  } catch (error) {
    console.error("❌ Error updating import statements:", error);
    process.exit(1);
  }
}

main(); 