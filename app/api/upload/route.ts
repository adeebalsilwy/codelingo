import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { isAdmin } from "@/lib/admin-server";

// Set dynamic to force dynamic rendering
export const dynamic = 'force-dynamic';

// Add an OPTIONS handler for CORS preflight requests
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

export async function POST(req: Request) {
  try {
    console.log("[UPLOAD] Starting file upload process");
    
    // Check if user is admin - this is required for security
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      console.log("[UPLOAD] Unauthorized - Not admin");
      return NextResponse.json(
        { error: "Unauthorized. Only admins can upload files." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("[UPLOAD] No file uploaded");
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    console.log(`[UPLOAD] File received: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Get file extension and check if it's valid
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.mp4', '.webm'];
    const ext = path.extname(fileName);
    
    if (!validExtensions.includes(ext)) {
      console.log(`[UPLOAD] Invalid file type: ${ext}`);
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${validExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Limit file size to 50MB
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.log(`[UPLOAD] File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Create buffer from file
    console.log("[UPLOAD] Creating buffer from file");
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate unique filename with timestamp and clean original name
    const timestamp = Date.now();
    const cleanFileName = file.name
      .replaceAll(" ", "_")
      .replaceAll(/[^a-zA-Z0-9_.-]/g, "");
    const uniqueFileName = `${timestamp}-${cleanFileName}`;
    
    // Set path to public/uploads directory
    const publicPath = path.join(process.cwd(), "public/uploads");
    console.log(`[UPLOAD] Public path: ${publicPath}`);
    
    // Ensure the uploads directory exists
    if (!existsSync(publicPath)) {
      console.log(`[UPLOAD] Creating uploads directory: ${publicPath}`);
      await mkdir(publicPath, { recursive: true });
      console.log("[UPLOAD] Created uploads directory");
    }
    
    const filePath = path.join(publicPath, uniqueFileName);
    
    // Write file to disk
    console.log(`[UPLOAD] Writing file to: ${filePath}`);
    await writeFile(filePath, new Uint8Array(buffer));
    console.log(`[UPLOAD] File saved successfully: ${filePath}`);
    
    // Return success response with the file URL
    const fileUrl = `/uploads/${uniqueFileName}`;
    console.log(`[UPLOAD] File URL: ${fileUrl}`);
    
    return NextResponse.json({ 
      url: fileUrl,
      fileName: uniqueFileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      success: true 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error: any) {
    console.error("[UPLOAD] Error uploading file:", error);
    return NextResponse.json(
      { 
        error: "Error uploading file", 
        message: error.message || "Unknown error occurred",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}