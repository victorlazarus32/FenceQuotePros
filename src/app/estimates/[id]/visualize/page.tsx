// AI fence visualization page. Lives at /estimates/[id]/visualize.
// Loads the estimate (so we know the fence config to use for the prompt) and
// any existing photos + visualizations, then hands off to the client component.

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { Visualizer } from "./Visualizer";

export default async function VisualizePage(
  props: PageProps<"/estimates/[id]/visualize">,
) {
  const { id } = await props.params;
  const userId = await getCurrentUserId();

  const est = await db.estimate.findUnique({
    where: { id },
    include: {
      client: true,
      fenceJobs: true,
      photos: {
        orderBy: { uploadedAt: "asc" },
        include: {
          visualizations: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });
  if (!est || est.userId !== userId) notFound();

  const fenceJob = est.fenceJobs[0];
  if (!fenceJob) {
    return (
      <div className="space-y-4">
        <Link
          href={`/estimates/${id}`}
          className="text-sm text-slate-600 hover:text-ink"
        >
          ← Back to estimate
        </Link>
        <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          This estimate has no fence job yet. Add a fence configuration first
          before generating a visualization.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link
          href={`/estimates/${id}`}
          className="text-sm text-slate-600 hover:text-ink"
        >
          ← Back to {est.number}
        </Link>
        <div className="text-sm text-slate-500">
          Showing {est.client.name} a preview of the proposed fence
        </div>
      </div>
      <Visualizer
        estimateId={est.id}
        fenceJob={{
          fenceType: fenceJob.fenceType,
          heightFeet: fenceJob.heightFeet,
          style: fenceJob.style,
          color: fenceJob.color,
          hasGate:
            fenceJob.numGatesSingle + fenceJob.numGatesDouble > 0,
        }}
        existingPhotos={await Promise.all(
          est.photos.map(async (p) => {
            const storage = getStorage();
            return {
              id: p.id,
              publicUrl: await storage.publicUrl(p.storageKey),
              width: p.width,
              height: p.height,
              angleLabel: p.angleLabel,
              visualizations: await Promise.all(
                p.visualizations.map(async (v) => ({
                  id: v.id,
                  status: v.status,
                  publicUrl: v.resultKey
                    ? await storage.publicUrl(v.resultKey)
                    : null,
                  createdAt: v.createdAt.toISOString(),
                })),
              ),
            };
          }),
        )}
      />
    </div>
  );
}
