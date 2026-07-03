// Jobs pipeline — every non-closed job grouped by workflow stage, in
// pipeline order, with days-in-stage and stuck flags. The operational
// counterpart to /estimates (which lists documents, not jobs).

import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import {
  STAGE_LABELS,
  TERMINAL_STAGES,
  WORKFLOW_STAGES,
  daysInStage,
  isStuck,
  type WorkflowStage,
} from "@/lib/jobWorkflow";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const userId = await getCurrentUserId();
  const now = new Date();

  const [active, closedWon, closedLost] = await Promise.all([
    db.estimate.findMany({
      where: { userId, workflowStatus: { notIn: [...TERMINAL_STAGES] } },
      include: {
        client: { select: { name: true } },
        workflowEvents: { orderBy: { createdAt: "desc" }, take: 1 },
        tasks: { where: { completedAt: null }, select: { id: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.estimate.count({ where: { userId, workflowStatus: "closed_won" } }),
    db.estimate.count({ where: { userId, workflowStatus: "closed_lost" } }),
  ]);

  const openStages = WORKFLOW_STAGES.filter(
    (s) => !(TERMINAL_STAGES as readonly string[]).includes(s),
  );
  const byStage = new Map<WorkflowStage, typeof active>(
    openStages.map((s) => [s, [] as typeof active]),
  );
  for (const e of active) {
    const stage = e.workflowStatus as WorkflowStage;
    (byStage.get(stage) ?? byStage.get("intake"))!.push(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <div className="text-sm text-slate-500">
          {active.length} active · {closedWon} won · {closedLost} lost
        </div>
      </div>

      {active.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 py-16 text-center">
          <p className="text-slate-600">
            No active jobs. New estimates enter the pipeline at Intake.
          </p>
          <Link
            href="/estimates/new"
            className="inline-block mt-3 text-sm font-medium text-brand"
          >
            New estimate →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {openStages.map((stage) => {
            const jobs = byStage.get(stage)!;
            if (jobs.length === 0) return null;
            return (
              <section
                key={stage}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden"
              >
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {STAGE_LABELS[stage]}
                  </span>
                  <span className="text-xs text-slate-500">{jobs.length}</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {jobs.map((e) => {
                    const enteredAt =
                      e.workflowEvents[0]?.createdAt ?? e.createdAt;
                    const days = daysInStage(enteredAt, now);
                    const stuck = isStuck(stage, enteredAt, now);
                    return (
                      <li key={e.id}>
                        <Link
                          href={`/estimates/${e.id}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 text-sm"
                        >
                          <span className="min-w-0 truncate">
                            <span className="font-mono font-medium">
                              {e.number}
                            </span>{" "}
                            · {e.client.name}
                          </span>
                          <span className="flex items-center gap-3 shrink-0">
                            {e.tasks.length > 0 && (
                              <span className="text-xs text-slate-500">
                                {e.tasks.length} task
                                {e.tasks.length === 1 ? "" : "s"}
                              </span>
                            )}
                            <span
                              className={`text-xs ${
                                stuck
                                  ? "text-amber-700 font-semibold"
                                  : "text-slate-400"
                              }`}
                            >
                              {stuck && "⏳ "}
                              {days}d
                            </span>
                            <span className="font-mono tabular-nums font-semibold">
                              {formatMoney(e.totalCents)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
