// Upload a property photo for a given estimate. Multipart form upload.
//
// Body (FormData):
//   photo:       File (image/jpeg or image/png)
//   estimateId:  string
//   width:       string (parsed to int)
//   height:      string (parsed to int)
//   angleLabel?: string
//
// Returns: { id, publicUrl, width, height }

import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getStorage, keys } from "@/lib/storage";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const file = form.get("photo");
  const estimateId = String(form.get("estimateId") ?? "");
  const angleLabel = form.get("angleLabel");

  if (!(file instanceof Blob) || !estimateId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "invalid_file_size" }, { status: 400 });
  }

  const mime = file.type;
  if (mime !== "image/jpeg" && mime !== "image/png") {
    return NextResponse.json(
      { error: "unsupported_type", message: "Use JPEG or PNG" },
      { status: 415 },
    );
  }

  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    select: { id: true, userId: true },
  });
  if (!estimate || estimate.userId !== userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Normalize: bake in EXIF orientation (so phones-shot-in-portrait stop being
  // sideways), strip metadata, re-encode as JPEG. Without this the renderer
  // sees a rotated photo and can't reason about ground/sky/perspective.
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  let normalized: Buffer;
  let width: number;
  let height: number;
  try {
    const pipeline = sharp(rawBuffer).rotate(); // .rotate() with no args = honor EXIF
    const meta = await pipeline.metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;
    if (width < 64 || height < 64) {
      return NextResponse.json({ error: "invalid_dimensions" }, { status: 400 });
    }
    normalized = await pipeline.jpeg({ quality: 88 }).toBuffer();
  } catch (err) {
    console.error("[photos/upload] sharp image_processing_failed", err);
    return NextResponse.json(
      { error: "image_processing_failed", detail: String(err) },
      { status: 400 },
    );
  }

  // Create the row first to get a stable id, then upload to storage with
  // that id baked into the key. If the upload fails, we delete the row so
  // there's no phantom record with an empty storageKey.
  const photo = await db.propertyPhoto.create({
    data: {
      estimateId,
      storageKey: "",
      width,
      height,
      angleLabel:
        typeof angleLabel === "string" && angleLabel.length > 0
          ? angleLabel
          : null,
    },
  });

  const storage = getStorage();
  const key = keys.photo(estimateId, photo.id, "jpg");
  let publicUrl: string;
  try {
    await storage.put(key, normalized, { contentType: "image/jpeg" });
    // publicUrl is async on the supabase driver (signs the URL) and sync
    // on the local driver — await covers both.
    publicUrl = await storage.publicUrl(key);
  } catch (err) {
    console.error("[photos/upload] storage failure", err);
    // Don't leak a half-created row.
    await db.propertyPhoto.delete({ where: { id: photo.id } }).catch(() => {});
    return NextResponse.json(
      {
        error: "storage_failed",
        message:
          "Couldn't save the photo to storage. Check Supabase bucket + service role key.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }

  await db.propertyPhoto.update({
    where: { id: photo.id },
    data: { storageKey: key },
  });

  return NextResponse.json({
    id: photo.id,
    publicUrl,
    width,
    height,
    angleLabel: photo.angleLabel,
  });
}
