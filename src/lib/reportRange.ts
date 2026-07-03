// Report date-range presets (PS pattern: ?range=today|7|30|90|all, default
// 30). Pure so windowing is unit-testable; "today" starts at local
// midnight, N-day ranges are the last N*24h ending now, "all" is unbounded.

export const REPORT_RANGES = ["today", "7", "30", "90", "all"] as const;
export type ReportRange = (typeof REPORT_RANGES)[number];

export const RANGE_LABELS: Record<ReportRange, string> = {
  today: "Today",
  "7": "7 days",
  "30": "30 days",
  "90": "90 days",
  all: "All time",
};

export function pickRange(v: unknown): ReportRange {
  return (REPORT_RANGES as readonly string[]).includes(v as string)
    ? (v as ReportRange)
    : "30";
}

// start === null means unbounded (all time).
export function rangeStart(range: ReportRange, now: Date = new Date()): Date | null {
  if (range === "all") return null;
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = parseInt(range, 10);
  return new Date(now.getTime() - days * 86_400_000);
}
