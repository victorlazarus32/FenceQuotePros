// Shared stat blocks — the KPI tile and Panel section used by the
// dashboard, promoted here so /reports (and future pages) render the exact
// same system instead of re-inventing tiles.

import Link from "next/link";

export function KPI({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: { kind: "up" | "down" | "neutral"; text: string } | null;
}) {
  const deltaColor =
    delta?.kind === "up"
      ? "#16a34a"
      : delta?.kind === "down"
        ? "#dc2626"
        : "#64748b";
  return (
    <div className="bg-white rounded-md border border-line p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
        {label}
      </div>
      <div
        className="mt-1 tabular-nums"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "var(--text-2xl)",
          lineHeight: 1,
          color: "var(--ink)",
        }}
      >
        {value}
      </div>
      {delta && (
        <div className="text-xs mt-1.5" style={{ color: deltaColor }}>
          {delta.kind === "up" ? "▲" : delta.kind === "down" ? "▼" : ""}{" "}
          {delta.text}
        </div>
      )}
    </div>
  );
}

export function Panel({
  title,
  linkHref,
  linkLabel,
  children,
}: {
  title: string;
  linkHref?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-md border border-line">
      <header className="flex items-center justify-between px-4 py-3 border-b border-line">
        <h2 className="h-card">{title}</h2>
        {linkHref && (
          <Link
            href={linkHref}
            className="text-sm font-medium text-brand hover:text-ink"
          >
            {linkLabel ?? "View all →"}
          </Link>
        )}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
