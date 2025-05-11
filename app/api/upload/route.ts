import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log("[API_UPLOAD] File upload requested");
    
    // تحقق من طريقة الاستدعاء
    if (request.method !== 'POST') {
      return new NextResponse(JSON.stringify({ error: "Method not allowed - use POST" }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // استخراج FormData من الطلب
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // التحقق من وجود ملف
    if (!file) {
      console.error("[API_UPLOAD] No file received in request");
      return new NextResponse(JSON.stringify({ error: "No file received" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // تحويل الملف إلى بايتس
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // التأكد من وجود مجلد التحميل
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    if (!existsSync(uploadDir)) {
      console.log("[API_UPLOAD] Creating uploads directory:", uploadDir);
      await mkdir(uploadDir, { recursive: true });
    }

    // توليد اسم فريد للملف
    const timestamp = Date.now();
    const originalFileName = file.name.replace(/\s+/g, '-');
    const fileName = `${timestamp}-${originalFileName}`;
    const filePath = path.join(uploadDir, fileName);

    console.log(`[API_UPLOAD] Writing file to ${filePath}`);
    
    // كتابة الملف - تحويل Buffer إلى Uint8Array لتوافق TypeScript
    await writeFile(filePath, new Uint8Array(buffer));
    
    // إعادة رابط الصورة العام
    const publicUrl = `/uploads/${fileName}`;
    console.log(`[API_UPLOAD] File uploaded successfully, public URL: ${publicUrl}`);
    
    return new NextResponse(JSON.stringify({ 
      url: publicUrl,
      success: true,
      fileName,
      originalName: file.name
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("[API_UPLOAD] Error during file upload:", error);
    return new NextResponse(JSON.stringify({ 
      error: "Error uploading file",
      details: error instanceof Error ? error.message : "Unknown error"
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// دعم CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}