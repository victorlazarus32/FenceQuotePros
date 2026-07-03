"use client";

// Job pipeline panel for the estimate detail page: stage stepper, task
// checklist (auto + manual), and transition history. The document status
// (draft/sent/accepted) lives on the customer doc; THIS is the job's
// operational lifecycle.

import { useActionState, useTransition } from "react";
import { Button } from "@/components/Button";
import {
  STAGE_LABELS,
  WORKFLOW_STAGES,
  isTerminal,
  type WorkflowStage,
} from "@/lib/jobWorkflow";
import {
  addJobTask,
  deleteJobTask,
  toggleJobTask,
  transitionJobWorkflow,
  type WorkflowActionState,
} from "@/app/estimates/jobActions";

export interface WorkflowEventRow {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string; // ISO — serialized by the server component
}

export interface JobTaskRow {
  id: string;
  title: string;
  dueAt: string | null;
  auto: boolean;
  completedAt: string | null;
}

function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function JobWorkflowPanel({
  estimateId,
  workflowStatus,
  events,
  tasks,
}: {
  estimateId: string;
  workflowStatus: string;
  events: WorkflowEventRow[];
  tasks: JobTaskRow[];
}) {
  const [transState, transAction, transPending] = useActionState<
    WorkflowActionState,
    FormData
  >(transitionJobWorkflow, {});
  const [taskState, taskAction, taskPending] = useActionState<
    WorkflowActionState,
    FormData
  >(addJobTask, {});
  const [togglePending, startToggle] = useTransition();

  const open = tasks.filter((t) => !t.completedAt);
  const done = tasks.filter((t) => t.completedAt);
  const now = new Date();

  return (
    <section className="no-print bg-white rounded-lg border border-line p-6 space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="h-card">Job pipeline</h2>
        {isTerminal(workflowStatus) && (
          <span className="text-xs text-slate-500">
            Closed — pick any stage to reopen.
          </span>
        )}
      </div>

      {/* Stage stepper: every stage is a button; current is highlighted. */}
      <div className="flex gap-1.5 flex-wrap">
        {WORKFLOW_STAGES.map((s: WorkflowStage) => {
          const isCurrent = s === workflowStatus;
          return (
            <form key={s} action={transAction}>
              <input type="hidden" name="estimateId" value={estimateId} />
              <input type="hidden" name="to" value={s} />
              <button
                type="submit"
                disabled={transPending || isCurrent}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  isCurrent
                    ? "bg-ink text-paper border-ink"
                    : isTerminal(s)
                      ? "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
                title={isCurrent ? "Current stage" : `Move to ${STAGE_LABELS[s]}`}
              >
                {STAGE_LABELS[s]}
              </button>
            </form>
          );
        })}
      </div>
      {transState.message && (
        <p className="text-xs text-red-600">{transState.message}</p>
      )}

      {/* Tasks */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
          Tasks {open.length > 0 && `· ${open.length} open`}
        </div>
        {open.length === 0 && done.length === 0 && (
          <p className="text-sm text-slate-500">
            No tasks yet — stage changes seed them automatically.
          </p>
        )}
        <ul className="space-y-1.5">
          {open.map((t) => {
            const overdue = t.dueAt != null && new Date(t.dueAt) < now;
            return (
              <li key={t.id} className="flex items-center gap-2 text-sm group">
                <input
                  type="checkbox"
                  checked={false}
                  disabled={togglePending}
                  onChange={() => startToggle(() => toggleJobTask(t.id))}
                  className="rounded border-slate-300 accent-[var(--brand)]"
                  aria-label={`Complete: ${t.title}`}
                />
                <span>{t.title}</span>
                {t.dueAt && (
                  <span
                    className={`text-xs ${overdue ? "text-red-600 font-semibold" : "text-slate-400"}`}
                  >
                    due {fmtDay(t.dueAt)}
                  </span>
                )}
                {!t.auto && (
                  <button
                    type="button"
                    onClick={() => startToggle(() => deleteJobTask(t.id))}
                    className="text-xs text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Delete: ${t.title}`}
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
          {done.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 text-sm text-slate-400"
            >
              <input
                type="checkbox"
                checked
                disabled={togglePending}
                onChange={() => startToggle(() => toggleJobTask(t.id))}
                className="rounded border-slate-300"
                aria-label={`Reopen: ${t.title}`}
              />
              <span className="line-through">{t.title}</span>
            </li>
          ))}
        </ul>

        <form action={taskAction} className="mt-3 flex gap-2 flex-wrap">
          <input type="hidden" name="estimateId" value={estimateId} />
          <input
            name="title"
            placeholder="Add a task…"
            required
            maxLength={200}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm grow max-w-xs focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <input
            name="dueDate"
            type="date"
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <Button type="submit" variant="secondary" size="sm" disabled={taskPending}>
            Add
          </Button>
          {taskState.message && (
            <span className="text-xs text-red-600 self-center">
              {taskState.message}
            </span>
          )}
        </form>
      </div>

      {/* History */}
      {events.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-slate-500 hover:text-ink text-xs uppercase tracking-wide font-semibold">
            Stage history ({events.length})
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-slate-500">
            {events.map((e) => (
              <li key={e.id}>
                <span className="font-mono">{fmtDay(e.createdAt)}</span> ·{" "}
                {e.fromStatus ? `${STAGE_LABELS[e.fromStatus as WorkflowStage] ?? e.fromStatus} → ` : ""}
                <span className="font-medium text-slate-700">
                  {STAGE_LABELS[e.toStatus as WorkflowStage] ?? e.toStatus}
                </span>
                {e.note && <span> · {e.note}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
