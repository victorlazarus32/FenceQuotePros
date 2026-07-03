import "server-only";
import { db } from "@/lib/db";
import {
  missingAutoTasks,
  transitionWorkflow,
} from "@/lib/jobWorkflow";

// The ONE write path for workflow transitions (PS's single-chokepoint
// pattern). Every transition — manual stage change, document hook, future
// automation — funnels through here so history + auto-task seeding can
// never be skipped.
export async function applyWorkflowTransition(
  estimate: { id: string; userId: string; workflowStatus: string },
  to: string,
  note?: string | null,
): Promise<{ ok: boolean; reason?: string; changed?: boolean }> {
  const result = transitionWorkflow(estimate.workflowStatus, to);
  if (!result.ok) return { ok: false, reason: result.reason };
  if (!result.changed) return { ok: true, changed: false };

  // Auto-tasks: seed the target stage's tasks, skipping still-open
  // duplicates (re-entering a stage never double-creates).
  const openTasks = await db.jobTask.findMany({
    where: { estimateId: estimate.id, completedAt: null },
    select: { title: true },
  });
  const toSeed = missingAutoTasks(
    result.toStatus,
    openTasks.map((t) => t.title),
  );

  await db.$transaction([
    db.estimate.update({
      where: { id: estimate.id },
      data: {
        workflowStatus: result.toStatus,
        workflowClosedAt: result.closedAt,
      },
    }),
    db.workflowEvent.create({
      data: {
        estimateId: estimate.id,
        fromStatus: estimate.workflowStatus,
        toStatus: result.toStatus,
        note: note ?? null,
      },
    }),
    ...toSeed.map((t) =>
      db.jobTask.create({
        data: {
          userId: estimate.userId,
          estimateId: estimate.id,
          title: t.title,
          dueAt: t.dueAt,
          auto: true,
        },
      }),
    ),
  ]);
  return { ok: true, changed: true };
}
