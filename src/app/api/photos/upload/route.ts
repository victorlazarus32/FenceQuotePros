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
  // sideways), strip metadata, re-encode as JPEG. Without this the AI sees a
  // rotated photo and can't reason about ground/sky/perspective.
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
    return NextResponse.json(
      { error: "image_processing_failed", detail: String(err) },
      { status: 400 },
    );
  }

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
  await storage.put(key, normalized, { contentType: "image/jpeg" });

  await db.propertyPhoto.update({
    where: { id: photo.id },
    data: { storageKey: key },
  });

  return NextResponse.json({
    id: photo.id,
    publicUrl: storage.publicUrl(key),
    width,
    height,
    angleLabel: photo.angleLabel,
  });
}
