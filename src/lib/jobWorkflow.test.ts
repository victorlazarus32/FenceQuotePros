import { describe, expect, it } from "vitest";
import {
  AUTO_TASK_PREFIX,
  STAGE_LABELS,
  STUCK_THRESHOLDS_DAYS,
  WORKFLOW_STAGES,
  autoTasksForStage,
  daysInStage,
  isStuck,
  isTerminal,
  isWorkflowStage,
  missingAutoTasks,
  transitionWorkflow,
  workflowAdvanceOnAccept,
  workflowAdvanceOnDecline,
  workflowAdvanceOnSend,
} from "./jobWorkflow";

const NOW = new Date(2026, 6, 2, 12, 0, 0);

describe("stage registry", () => {
  it("every stage has a label and a stuck threshold entry", () => {
    for (const s of WORKFLOW_STAGES) {
      expect(STAGE_LABELS[s]).toBeTruthy();
      expect(STUCK_THRESHOLDS_DAYS).toHaveProperty(s);
    }
  });
  it("terminal stages are exactly closed_won / closed_lost", () => {
    expect(isTerminal("closed_won")).toBe(true);
    expect(isTerminal("closed_lost")).toBe(true);
    expect(isTerminal("inspection")).toBe(false);
    expect(isTerminal("nonsense")).toBe(false);
  });
  it("isWorkflowStage rejects unknown values", () => {
    expect(isWorkflowStage("permit_prep")).toBe(true);
    expect(isWorkflowStage("PERMIT_PREP")).toBe(false);
    expect(isWorkflowStage(null)).toBe(false);
  });
});

describe("transitionWorkflow", () => {
  it("normal forward move", () => {
    const r = transitionWorkflow("intake", "quote_sent", NOW);
    expect(r).toEqual({
      ok: true,
      toStatus: "quote_sent",
      closedAt: null,
      changed: true,
    });
  });
  it("backward move allowed (failed inspection → scheduled)", () => {
    const r = transitionWorkflow("inspection", "scheduled", NOW);
    expect(r.ok && r.changed).toBe(true);
  });
  it("entering terminal stamps closedAt", () => {
    const r = transitionWorkflow("inspection", "closed_won", NOW);
    if (!r.ok) throw new Error("unreachable");
    expect(r.closedAt).toEqual(NOW);
  });
  it("reopening a closed job clears closedAt", () => {
    const r = transitionWorkflow("closed_won", "inspection", NOW);
    if (!r.ok) throw new Error("unreachable");
    expect(r.closedAt).toBeNull();
    expect(r.changed).toBe(true);
  });
  it("same-stage transition is a no-op (changed=false)", () => {
    const r = transitionWorkflow("accepted", "accepted", NOW);
    if (!r.ok) throw new Error("unreachable");
    expect(r.changed).toBe(false);
  });
  it("unknown target stage is rejected", () => {
    const r = transitionWorkflow("intake", "warp_drive", NOW);
    expect(r.ok).toBe(false);
  });
});

describe("auto-tasks", () => {
  it("accepted seeds deposit + materials with due dates", () => {
    const tasks = autoTasksForStage("accepted", NOW);
    expect(tasks.map((t) => t.title)).toEqual([
      `${AUTO_TASK_PREFIX}Collect deposit`,
      `${AUTO_TASK_PREFIX}Order materials`,
    ]);
    expect(tasks[0].dueAt).toEqual(new Date(2026, 6, 4, 12, 0, 0)); // +2d
    expect(tasks[1].dueAt).toEqual(new Date(2026, 6, 5, 12, 0, 0)); // +3d
  });
  it("closed_won seeds the thank-you + review-ask task", () => {
    const tasks = autoTasksForStage("closed_won", NOW);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toContain("thank-you");
  });
  it("stages without specs seed nothing", () => {
    expect(autoTasksForStage("intake", NOW)).toEqual([]);
    expect(autoTasksForStage("closed_lost", NOW)).toEqual([]);
  });
  it("missingAutoTasks skips still-open duplicates (PS re-entry rule)", () => {
    const open = [`${AUTO_TASK_PREFIX}Collect deposit`];
    const missing = missingAutoTasks("accepted", open, NOW);
    expect(missing.map((t) => t.title)).toEqual([
      `${AUTO_TASK_PREFIX}Order materials`,
    ]);
  });
  it("missingAutoTasks re-seeds when nothing is open", () => {
    expect(missingAutoTasks("accepted", [], NOW)).toHaveLength(2);
  });
});

describe("stuck detection", () => {
  it("days-in-stage floors partial days", () => {
    expect(daysInStage(new Date(2026, 6, 1, 6, 0), NOW)).toBe(1);
    expect(daysInStage(new Date(2026, 6, 2, 6, 0), NOW)).toBe(0);
  });
  it("quote_sent is stuck at 10 days, not at 9", () => {
    const nineDays = new Date(2026, 5, 23, 12, 0);
    const tenDays = new Date(2026, 5, 22, 12, 0);
    expect(isStuck("quote_sent", nineDays, NOW)).toBe(false);
    expect(isStuck("quote_sent", tenDays, NOW)).toBe(true);
  });
  it("permit_submitted tolerates county timelines (21d)", () => {
    const fourteenDays = new Date(2026, 5, 18, 12, 0);
    expect(isStuck("permit_submitted", fourteenDays, NOW)).toBe(false);
  });
  it("terminal stages are never stuck", () => {
    const yearAgo = new Date(2025, 6, 2);
    expect(isStuck("closed_won", yearAgo, NOW)).toBe(false);
    expect(isStuck("closed_lost", yearAgo, NOW)).toBe(false);
  });
  it("unknown stage is never stuck", () => {
    expect(isStuck("archived", new Date(2025, 0, 1), NOW)).toBe(false);
  });
});

describe("document-event hooks (auto-advance)", () => {
  it("sending a proposal advances intake → quote_sent only", () => {
    expect(workflowAdvanceOnSend("intake")).toBe("quote_sent");
    expect(workflowAdvanceOnSend("permit_prep")).toBeNull(); // resend ≠ regression
    expect(workflowAdvanceOnSend("closed_won")).toBeNull();
  });
  it("customer acceptance advances early stages → accepted", () => {
    expect(workflowAdvanceOnAccept("intake")).toBe("accepted");
    expect(workflowAdvanceOnAccept("quote_sent")).toBe("accepted");
    expect(workflowAdvanceOnAccept("scheduled")).toBeNull(); // never backward
  });
  it("decline closes any open job, never reopens a closed one", () => {
    expect(workflowAdvanceOnDecline("quote_sent")).toBe("closed_lost");
    expect(workflowAdvanceOnDecline("permit_submitted")).toBe("closed_lost");
    expect(workflowAdvanceOnDecline("closed_won")).toBeNull();
  });
});
