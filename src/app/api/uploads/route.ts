import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only images are allowed" },
        { status: 400 },
      );
    }

    // Normalize JFIF → jpg (Safari/iPad is unreliable with .jfif URLs)
    let ext = path.extname(file.name).toLowerCase() || ".jpg";
    if (ext === ".jfif" || ext === ".jfi") ext = ".jpg";
    const filename = `products/${randomUUID()}${ext}`;

    // Production (Vercel): store in Blob — local disk is not persistent
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url });
    }

    // Local development fallback
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Image uploads need Vercel Blob. In Vercel → Storage → Create Blob Store, then redeploy.",
        },
        { status: 503 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(
      /*turbopackIgnore: true*/ process.cwd(),
      "public",
      "uploads",
    );
    await mkdir(uploadDir, { recursive: true });
    const localName = `${randomUUID()}${ext}`;
    await writeFile(path.join(uploadDir, localName), bytes);

    return NextResponse.json({ url: `/uploads/${localName}` });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Upload failed unexpectedly",
      },
      { status: 500 },
    );
  }
}
