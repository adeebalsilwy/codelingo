const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure required directories exist
const publicDir = path.join(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// List of required icon sizes
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Path to the original logo
const sourceLogoPath = path.join(__dirname, '../public/images/logo-android.png');

// Check if the original logo exists
if (!fs.existsSync(sourceLogoPath)) {
  console.error('Original logo not found at path:', sourceLogoPath);
  console.log('Please make sure logo-android.png exists in the public/images folder');
  process.exit(1);
}

// Generate icons in different sizes
async function generateIcons() {
  console.log('Starting icon generation...');

  try {
    // Read the original logo
    const sourceBuffer = fs.readFileSync(sourceLogoPath);
    
    // Generate icons for each size
    for (const size of iconSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(sourceBuffer)
        .resize(size, size)
        .toFile(outputPath);
      
      console.log(`Generated icon: ${size}x${size}`);
    }
    
    console.log('Icon generation completed successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

// Execute the function
generateIcons(); 