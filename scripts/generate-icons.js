const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// تأكد من وجود المجلدات المطلوبة
const publicDir = path.join(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// قائمة بأحجام الأيقونات المطلوبة
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// مسار الشعار الأصلي
const sourceLogoPath = path.join(__dirname, '../public/images/logo-android.png');

// التحقق من وجود الشعار الأصلي
if (!fs.existsSync(sourceLogoPath)) {
  console.error('الشعار الأصلي غير موجود في المسار:', sourceLogoPath);
  console.log('يرجى التأكد من وجود ملف logo-android.png في مجلد public/images');
  process.exit(1);
}

// توليد الأيقونات بأحجام مختلفة
async function generateIcons() {
  console.log('بدء توليد الأيقونات...');

  try {
    // قراءة الشعار الأصلي
    const sourceBuffer = fs.readFileSync(sourceLogoPath);

    // توليد الأيقونات لكل حجم
    for (const size of iconSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(sourceBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`تم إنشاء أيقونة بحجم ${size}x${size}`);
    }

    // إنشاء أيقونات إضافية للـ iOS
    await sharp(sourceBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log('تم إنشاء أيقونة apple-touch-icon.png');

    // إنشاء أيقونات للـ favicon
    await sharp(sourceBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    
    await sharp(sourceBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    
    console.log('تم إنشاء أيقونات الـ favicon');

    // إنشاء ملف favicon.ico
    await sharp(sourceBuffer)
      .resize(32, 32)
      .toFormat('ico')
      .toFile(path.join(publicDir, 'favicon.ico'));
    
    console.log('تم إنشاء ملف favicon.ico');

    console.log('تم الانتهاء من توليد جميع الأيقونات بنجاح!');
  } catch (error) {
    console.error('حدث خطأ أثناء توليد الأيقونات:', error);
    process.exit(1);
  }
}

// تنفيذ الوظيفة
generateIcons(); 