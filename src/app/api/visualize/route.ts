// Generate a fence visualization on a previously-uploaded photo.
//
// Body (JSON):
//   photoId:    string
//   maskBase64: string  (data:image/png;base64,... or raw base64)
//   fenceType:  FenceType
//   heightFeet: number
//   style?:     string
//   color?:     string
//   hasGate?:   boolean
//
// Synchronous: blocks for the duration of the inpaint call (~15–30s).
// Returns: { id, status, publicUrl, costCents }

import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getStorage, keys } from "@/lib/storage";
import { buildFencePrompt } from "@/lib/visualization/prompt";
import { getInpaintProvider } from "@/lib/visualization/provider";
import type { FenceType } from "@/lib/fence";

const FENCE_TYPES = [
  "chain_link",
  "wood_privacy",
  "wood_picket",
  "vinyl",
  "aluminum",
  "wrought_iron",
  "composite",
  "dura_fence",
  "concrete_wall",
  "concrete_column",
] as const;

const Body = z.object({
  photoId: z.string().min(1),
  maskBase64: z.string().min(64),
  fenceType: z.enum(FENCE_TYPES),
  heightFeet: z.number().min(2).max(20),
  style: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  hasGate: z.boolean().optional(),
});

const MAX_PER_ESTIMATE = parseInt(
  process.env.VISUALIZATION_MAX_PER_ESTIMATE ?? "10",
  10,
);

function decodeBase64Image(input: string): Buffer {
  const cleaned = input.replace(/^data:[^,]+,/, "");
  return Buffer.from(cleaned, "base64");
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "invalid_body", detail: String(err) },
      { status: 400 },
    );
  }

  const photo = await db.propertyPhoto.findUnique({
    where: { id: body.photoId },
    include: {
      estimate: { select: { id: true, userId: true } },
    },
  });
  if (!photo || photo.estimate.userId !== userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const existing = await db.fenceVisualization.count({
    where: { photo: { estimate: { id: photo.estimate.id } } },
  });
  if (existing >= MAX_PER_ESTIMATE) {
    return NextResponse.json(
      { error: "limit_reached", limit: MAX_PER_ESTIMATE },
      { status: 429 },
    );
  }

  const prompt = buildFencePrompt({
    fenceType: body.fenceType as FenceType,
    heightFeet: body.heightFeet,
    style: body.style,
    color: body.color,
    hasGate: body.hasGate,
  });

  const provider = await getInpaintProvider();

  const viz = await db.fenceVisualization.create({
    data: {
      photoId: photo.id,
      maskKey: "",
      prompt,
      status: "pending",
      provider: provider.name,
    },
  });

  const storage = getStorage();
  const maskBuffer = decodeBase64Image(body.maskBase64);
  const maskKey = keys.mask(photo.estimate.id, photo.id, viz.id);
  await storage.put(maskKey, maskBuffer, { contentType: "image/png" });

  // Read original photo back from storage for the model. Works for both
  // local-FS and Supabase via the storage abstraction.
  const photoBuffer = await storage.read(photo.storageKey);

  try {
    const result = await provider.inpaint({
      image: photoBuffer,
      mask: maskBuffer,
      prompt,
    });

    const resultKey = keys.result(photo.estimate.id, viz.id);
    await storage.put(resultKey, result.result, { contentType: "image/png" });

    const updated = await db.fenceVisualization.update({
      where: { id: viz.id },
      data: {
        maskKey,
        resultKey,
        status: "ready",
        completedAt: new Date(),
        costCents: result.costCents,
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: "ready",
      publicUrl: await storage.publicUrl(resultKey),
      costCents: updated.costCents,
    });
  } catch (err) {
    await db.fenceVisualization.update({
      where: { id: viz.id },
      data: {
        maskKey,
        status: "failed",
        errorMessage: String(err).slice(0, 500),
      },
    });
    return NextResponse.json(
      { error: "generation_failed", detail: String(err) },
      { status: 502 },
    );
  }
}
