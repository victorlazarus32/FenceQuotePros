// Delete a property photo (and cascade-delete its visualizations via Prisma).
// Files on disk get cleaned up best-effort; failures don't block the DB delete
// so we don't end up with orphaned rows pointing at missing files.

import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getStorage } from "@/lib/storage";

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/photos/[id]">,
) {
  const userId = await getCurrentUserId();
  const { id } = await ctx.params;

  const photo = await db.propertyPhoto.findUnique({
    where: { id },
    include: {
      estimate: { select: { userId: true } },
      visualizations: {
        select: { maskKey: true, resultKey: true },
      },
    },
  });
  if (!photo || photo.estimate.userId !== userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const storage = getStorage();
  const fileKeys: string[] = [photo.storageKey];
  for (const v of photo.visualizations) {
    if (v.maskKey) fileKeys.push(v.maskKey);
    if (v.resultKey) fileKeys.push(v.resultKey);
  }

  // Best-effort file removal — keep going even if a file is already missing.
  for (const key of fileKeys) {
    if (!key) continue;
    try {
      await storage.remove(key);
    } catch {
      /* swallow */
    }
  }

  await db.propertyPhoto.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
