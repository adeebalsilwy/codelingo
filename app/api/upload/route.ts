import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only MP4, WebM, OGG videos and PDF files are allowed." },
        { status: 400 }
      );
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 100MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const originalName = file.name;
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const filename = `${uuidv4()}${extension}`;

    const path = join(process.cwd(), "public", "contectchapter", filename);
    await writeFile(path, buffer);

    const fileUrl = `/contectchapter/${filename}`;
    return NextResponse.json({ success: true, fileUrl });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    );
  }
}