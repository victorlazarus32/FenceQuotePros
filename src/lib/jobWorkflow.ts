// The job workflow pipeline, extracted as PURE functions (like
// lib/invoiceMoney) so transitions, auto-tasks, and stuck detection are
// unit-testable without a database.
//
// PS-proven rules carried over:
//   1. TWO independent status tracks. Estimate.status is the DOCUMENT
//      (draft/sent/accepted/…); workflowStatus is the JOB (intake → … →
//      closed_won/lost). A signed estimate can still be stuck in permitting;
//      a closed_won job can have an unpaid invoice.
//   2. Entering a stage AUTO-SEEDS its tasks (prefixed "[auto] ") with due
//      dates — skipping any still-open duplicate title.
//   3. "Stuck" is computed from the latest transition INTO the current
//      stage (never updatedAt), compared against per-stage day thresholds.
//   4. Terminal stages stamp workflowClosedAt; reopening clears it.

export const WORKFLOW_STAGES = [
  "intake",
  "quote_sent",
  "accepted",
  "permit_prep",
  "permit_submitted",
  "permit_approved",
  "scheduled",
  "installed",
  "inspection",
  "closed_won",
  "closed_lost",
] as const;
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];

export const TERMINAL_STAGES: readonly WorkflowStage[] = [
  "closed_won",
  "closed_lost",
];

export const STAGE_LABELS: Record<WorkflowStage, string> = {
  intake: "Intake",
  quote_sent: "Quote sent",
  accepted: "Accepted",
  permit_prep: "Permit prep",
  permit_submitted: "Permit submitted",
  permit_approved: "Permit approved",
  scheduled: "Scheduled",
  installed: "Installed",
  inspection: "Inspection",
  closed_won: "Closed — won",
  closed_lost: "Closed — lost",
};

export function isWorkflowStage(v: unknown): v is WorkflowStage {
  return (WORKFLOW_STAGES as readonly string[]).includes(v as string);
}

export function isTerminal(stage: string): boolean {
  return (TERMINAL_STAGES as readonly string[]).includes(stage);
}

// ── Auto-tasks per stage entry ──
export const AUTO_TASK_PREFIX = "[auto] ";

export interface AutoTaskSpec {
  title: string; // stored WITH the prefix
  dueInDays: number;
}

const AUTO_TASKS_BY_STAGE: Partial<Record<WorkflowStage, Array<{ title: string; dueInDays: number }>>> = {
  accepted: [
    { title: "Collect deposit", dueInDays: 2 },
    { title: "Order materials", dueInDays: 3 },
  ],
  permit_prep: [{ title: "Assemble permit packet", dueInDays: 2 }],
  permit_submitted: [{ title: "Follow up with county on permit", dueInDays: 7 }],
  permit_approved: [{ title: "Schedule install crew", dueInDays: 2 }],
  scheduled: [{ title: "Confirm crew, materials, and homeowner", dueInDays: 1 }],
  installed: [{ title: "Request final inspection", dueInDays: 1 }],
  inspection: [{ title: "Collect final balance", dueInDays: 2 }],
  closed_won: [
    { title: "Send thank-you note + review ask", dueInDays: 1 },
  ],
};

export function autoTasksForStage(
  stage: string,
  now: Date = new Date(),
): Array<{ title: string; dueAt: Date }> {
  const specs = AUTO_TASKS_BY_STAGE[stage as WorkflowStage] ?? [];
  return specs.map((s) => {
    const dueAt = new Date(now);
    dueAt.setDate(dueAt.getDate() + s.dueInDays);
    return { title: AUTO_TASK_PREFIX + s.title, dueAt };
  });
}

// Which auto-tasks still need creating, given the job's open task titles.
// (PS rule: never duplicate a still-open auto task on re-entry.)
export function missingAutoTasks(
  stage: string,
  openTaskTitles: readonly string[],
  now: Date = new Date(),
): Array<{ title: string; dueAt: Date }> {
  const open = new Set(openTaskTitles);
  return autoTasksForStage(stage, now).filter((t) => !open.has(t.title));
}

// ── Transitions ──
export type TransitionResult =
  | {
      ok: true;
      toStatus: WorkflowStage;
      closedAt: Date | null; // value to STORE (null clears on reopen)
      changed: boolean;
    }
  | { ok: false; reason: string };

export function transitionWorkflow(
  currentStatus: string,
  to: string,
  now: Date = new Date(),
): TransitionResult {
  if (!isWorkflowStage(to)) {
    return { ok: false, reason: `Unknown stage "${to}".` };
  }
  if (currentStatus === to) {
    return { ok: true, toStatus: to, closedAt: isTerminal(to) ? now : null, changed: false };
  }
  // Any-to-any moves allowed (real jobs go backward: failed inspection →
  // scheduled again). Terminal stamps closedAt; leaving terminal clears it.
  return {
    ok: true,
    toStatus: to,
    closedAt: isTerminal(to) ? now : null,
    changed: true,
  };
}

// ── Stuck detection ──
// Days a job may sit in a stage before it surfaces as "stuck". County
// review legitimately takes weeks; a quote sitting un-followed for 10 days
// is a lost deal in the making.
export const STUCK_THRESHOLDS_DAYS: Record<WorkflowStage, number | null> = {
  intake: 7,
  quote_sent: 10,
  accepted: 7,
  permit_prep: 7,
  permit_submitted: 21,
  permit_approved: 7,
  scheduled: 14,
  installed: 5,
  inspection: 10,
  closed_won: null, // terminal — never stuck
  closed_lost: null,
};

export function daysInStage(
  enteredAt: Date | string,
  now: Date = new Date(),
): number {
  const entered = new Date(enteredAt);
  return Math.floor((now.getTime() - entered.getTime()) / 86_400_000);
}

export function isStuck(
  stage: string,
  enteredAt: Date | string,
  now: Date = new Date(),
): boolean {
  if (!isWorkflowStage(stage)) return false;
  const threshold = STUCK_THRESHOLDS_DAYS[stage];
  if (threshold == null) return false;
  return daysInStage(enteredAt, now) >= threshold;
}

// ── Document-event hooks (auto-advance) ──
// When a DOCUMENT event happens, the workflow may advance — but only
// FORWARD from earlier stages, never yanking a job backward out of
// permitting/scheduling, and never reopening a closed job.
export function workflowAdvanceOnSend(currentStatus: string): WorkflowStage | null {
  return currentStatus === "intake" ? "quote_sent" : null;
}

export function workflowAdvanceOnAccept(currentStatus: string): WorkflowStage | null {
  return currentStatus === "intake" || currentStatus === "quote_sent"
    ? "accepted"
    : null;
}

export function workflowAdvanceOnDecline(currentStatus: string): WorkflowStage | null {
  return isTerminal(currentStatus) ? null : "closed_lost";
}
