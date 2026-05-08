// Compliance warning treatments — combines Direction B (stacked banner card)
// and Direction D (blocking behavior) from the design package. Severity
// drives both visual weight and whether the form can be submitted.

import type { ComplianceWarning } from "@/lib/fence";

export function ComplianceAlerts({
  warnings,
}: {
  warnings: ComplianceWarning[];
}) {
  if (warnings.length === 0) return null;

  const blockers = warnings.filter((w) => w.severity === "blocker");
  const softWarnings = warnings.filter((w) => w.severity === "warning");

  return (
    <div className="space-y-2">
      {blockers.length > 0 && (
        <div
          role="alert"
          className="rounded-md border-l-[6px] border-2 p-3"
          style={{
            borderColor: "#dc2626",
            background: "#fff3ec",
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className="px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-full text-white"
              style={{ background: "#dc2626" }}
            >
              ✕ {blockers.length} {blockers.length === 1 ? "blocker" : "blockers"}
            </span>
            <span className="text-xs text-slate-600 font-mono">
              FBC R4501 · HVHZ
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-ink">
            {blockers.map((w) => (
              <li key={w.code} className="flex gap-2">
                <span className="text-red-600 shrink-0">•</span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
          <div className="text-xs mt-2 font-medium" style={{ color: "#7a1d00" }}>
            Resolve before sending the estimate.
          </div>
        </div>
      )}

      {softWarnings.length > 0 && (
        <div
          className="rounded-md border-l-[6px] border-2 p-3"
          style={{
            borderColor: "#b27d00",
            background: "#fff8d8",
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span
              className="px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-full"
              style={{ background: "#b27d00", color: "white" }}
            >
              ⚠ {softWarnings.length}{" "}
              {softWarnings.length === 1 ? "heads up" : "heads up"}
            </span>
          </div>
          <ul className="space-y-1.5 text-sm text-ink">
            {softWarnings.map((w) => (
              <li key={w.code} className="flex gap-2">
                <span className="shrink-0" style={{ color: "#7a5400" }}>
                  •
                </span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Inline pill — Direction A treatment, used next to specific form fields
// when a warning is field-scoped. Caller passes in a single warning or null.
export function CompliancePill({
  warning,
}: {
  warning: ComplianceWarning | null;
}) {
  if (!warning) return null;
  const isBlocker = warning.severity === "blocker";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border"
      style={{
        borderColor: isBlocker ? "#dc2626" : "#b27d00",
        background: isBlocker ? "#ffe0d3" : "#fff6d8",
        color: isBlocker ? "#dc2626" : "#7a5400",
      }}
    >
      {isBlocker ? "✕" : "⚠"} {warning.message}
    </span>
  );
}

export function hasBlocker(warnings: ComplianceWarning[]): boolean {
  return warnings.some((w) => w.severity === "blocker");
}
