const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to clean
const pathsToClean = [
  '.next',
  '.next-standalone',
  'node_modules/.cache'
];

// Clean directories
for (const dirPath of pathsToClean) {
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dirPath}...`);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Successfully removed ${dirPath}`);
    } catch (err) {
      console.error(`Error removing ${dirPath}:`, err);
    }
  } else {
    console.log(`Directory ${dirPath} does not exist, skipping...`);
  }
}

// Run npm install
console.log('Running npm install...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('npm install completed successfully');
} catch (err) {
  console.error('Error during npm install:', err);
  process.exit(1);
}

// Run build
console.log('Running npm run build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (err) {
  console.error('Error during build:', err);
  process.exit(1);
}

console.log('Clean and rebuild process completed successfully!'); 