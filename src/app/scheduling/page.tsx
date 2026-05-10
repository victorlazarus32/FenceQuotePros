// Production board. Day × Crew grid for the active week, plus an
// "Unscheduled" column for accepted estimates that don't have an
// install date yet. One row per crew (so the contractor can see at a
// glance whose calendar is full).
//
// Lightweight by design — no drag/drop, no time-of-day, no recurring
// jobs, no Calendar API integration. Click "Start" / "Complete" pills
// on each card to walk the job through scheduled → in_progress →
// completed.

import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { FENCE_TYPE_LABELS, type FenceType } from "@/lib/fence";
import { formatMoney } from "@/lib/format";
import { CrewForm } from "./CrewForm";
import { StatusActions } from "./StatusActions";

export const dynamic = "force-dynamic";

export default async function SchedulingPage(
  props: PageProps<"/scheduling">,
) {
  const userId = await getCurrentUserId();
  const sp = await props.searchParams;

  // Compute the week we're showing. ?weekOf=YYYY-MM-DD picks a Monday;
  // default = the Monday of the current week (local time).
  const today = new Date();
  const requested =
    typeof sp.weekOf === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(sp.weekOf)
      ? new Date(`${sp.weekOf}T12:00:00.000Z`)
      : today;
  const weekStart = mondayOf(requested);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  const prevWeek = new Date(weekStart);
  prevWeek.setUTCDate(weekStart.getUTCDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setUTCDate(weekStart.getUTCDate() + 7);

  const [crews, scheduledJobs, unscheduledJobs] = await Promise.all([
    db.crew.findMany({
      where: { userId, active: true },
      orderBy: [{ createdAt: "asc" }],
    }),
    db.fenceJob.findMany({
      where: {
        estimate: { userId },
        scheduledDate: { gte: weekStart, lt: weekEnd },
      },
      include: {
        estimate: {
          select: {
            id: true,
            number: true,
            totalCents: true,
            client: { select: { name: true, addressLine1: true, city: true } },
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    }),
    db.fenceJob.findMany({
      where: {
        estimate: { userId, status: "accepted" },
        installStatus: "unscheduled",
      },
      include: {
        estimate: {
          select: {
            id: true,
            number: true,
            totalCents: true,
            client: { select: { name: true, addressLine1: true, city: true } },
          },
        },
      },
      take: 20,
    }),
  ]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setUTCDate(weekStart.getUTCDate() + i);
    return d;
  });

  // Group jobs by [crewId or "unassigned"] x [yyyy-mm-dd]
  type CellKey = string;
  const cellKey = (crewId: string | null, day: Date): CellKey =>
    `${crewId ?? "unassigned"}:${day.toISOString().slice(0, 10)}`;
  const grid = new Map<CellKey, typeof scheduledJobs>();
  for (const job of scheduledJobs) {
    if (!job.scheduledDate) continue;
    const k = cellKey(job.crewId, job.scheduledDate);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k)!.push(job);
  }

  // Render rows: each active crew + an "Unassigned" row at the bottom
  // if there are unassigned scheduled jobs.
  const hasUnassigned = scheduledJobs.some((j) => !j.crewId);
  const rows: Array<
    | { type: "crew"; id: string; name: string; colorTag: string | null }
    | { type: "unassigned"; id: null; name: string; colorTag: null }
  > = [
    ...crews.map((c) => ({
      type: "crew" as const,
      id: c.id,
      name: c.name,
      colorTag: c.colorTag,
    })),
  ];
  if (hasUnassigned) {
    rows.push({
      type: "unassigned",
      id: null,
      name: "Unassigned",
      colorTag: null,
    });
  }

  const fmtDay = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  const fmtRange = (a: Date, b: Date) => {
    const e = new Date(b);
    e.setUTCDate(e.getUTCDate() - 1);
    return `${a.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="h-page text-ink">Production board</h1>
          <p className="text-sm text-slate-600 mt-1">
            Schedule installs by date and crew. Walk each job through
            scheduled → in progress → completed.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={`/scheduling?weekOf=${prevWeek.toISOString().slice(0, 10)}`}
            className="px-3 py-2 rounded-md border border-line hover:bg-paper"
          >
            ← Prev week
          </Link>
          <div className="font-semibold text-ink">
            {fmtRange(weekStart, weekEnd)}
          </div>
          <Link
            href={`/scheduling?weekOf=${nextWeek.toISOString().slice(0, 10)}`}
            className="px-3 py-2 rounded-md border border-line hover:bg-paper"
          >
            Next week →
          </Link>
        </div>
      </div>

      {/* Crews management */}
      <section className="rounded-lg border-2 border-line bg-white p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="h-card text-ink">Crews</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Active production crews. Pick a hex color tag to make their
              cells stand out on the board.
            </p>
          </div>
        </div>
        <CrewForm />
        {crews.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {crews.map((c) => (
              <div
                key={c.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-line bg-paper text-sm"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: c.colorTag ?? "var(--brand)" }}
                />
                <span className="font-semibold text-ink">{c.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Unscheduled queue */}
      {unscheduledJobs.length > 0 && (
        <section className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5">
          <h2 className="h-card text-amber-900">
            Unscheduled · ready to schedule ({unscheduledJobs.length})
          </h2>
          <p className="text-xs text-amber-800 mt-0.5 mb-3">
            These estimates are signed and accepted but don't have an
            install date yet. Schedule them from the estimate detail page.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {unscheduledJobs.map((j) => (
              <Link
                key={j.id}
                href={`/estimates/${j.estimate.id}`}
                className="block rounded-md bg-white border border-amber-200 p-3 hover:border-amber-400"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-ink truncate">
                    {j.estimate.client.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                    {j.estimate.number}
                  </div>
                </div>
                <div className="text-xs text-slate-600 mt-0.5 truncate">
                  {j.estimate.client.addressLine1 ?? "—"}
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  {fenceLabel(j.fenceType, j.heightFeet, j.linearFeet)}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono tabular-nums">
                  {formatMoney(j.estimate.totalCents)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Production grid */}
      <section className="rounded-lg border-2 border-line bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[840px] grid" style={{ gridTemplateColumns: "120px repeat(7, minmax(110px, 1fr))" }}>
            {/* Header row */}
            <div className="bg-ink text-paper px-3 py-2 text-[10px] uppercase tracking-wider font-bold sticky left-0">
              Crew
            </div>
            {days.map((d) => (
              <div
                key={d.toISOString()}
                className="bg-ink text-paper px-3 py-2 text-[10px] uppercase tracking-wider font-bold border-l border-paper/10"
              >
                {fmtDay(d)}
              </div>
            ))}

            {rows.length === 0 && (
              <div className="col-span-8 p-8 text-center text-sm text-slate-500">
                No active crews. Add one above to start scheduling.
              </div>
            )}

            {rows.map((row) => (
              <div key={row.id ?? "unassigned"} className="contents">
                <div className="bg-paper px-3 py-3 border-t border-line text-sm font-semibold text-ink sticky left-0 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      background:
                        row.type === "crew"
                          ? (row.colorTag ?? "var(--brand)")
                          : "#94a3b8",
                    }}
                  />
                  {row.name}
                </div>
                {days.map((d) => {
                  const k = cellKey(row.id, d);
                  const cellJobs = grid.get(k) ?? [];
                  return (
                    <div
                      key={k}
                      className="bg-white px-2 py-2 border-t border-l border-line min-h-[100px] space-y-1.5"
                    >
                      {cellJobs.map((j) => (
                        <JobCard
                          key={j.id}
                          job={j}
                          crewColor={row.type === "crew" ? row.colorTag : null}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {scheduledJobs.length === 0 && rows.length > 0 && (
        <div className="text-sm text-slate-500 text-center py-4">
          No installs scheduled this week. Schedule one from the estimate
          detail page.
        </div>
      )}
    </div>
  );
}

function JobCard({
  job,
  crewColor,
}: {
  job: {
    id: string;
    fenceType: string;
    heightFeet: number;
    linearFeet: number;
    installStatus: string;
    estimate: {
      id: string;
      number: string;
      totalCents: number;
      client: {
        name: string;
        addressLine1: string | null;
        city: string | null;
      };
    };
  };
  crewColor: string | null;
}) {
  const status = job.installStatus as
    | "scheduled"
    | "in_progress"
    | "completed";
  const statusBg =
    status === "completed"
      ? "bg-slate-50 border-slate-200"
      : status === "in_progress"
        ? "bg-emerald-50 border-emerald-200"
        : "bg-paper border-line";
  return (
    <div
      className={`rounded-md border-2 p-2 ${statusBg}`}
      style={
        crewColor
          ? { borderLeftWidth: 4, borderLeftColor: crewColor }
          : undefined
      }
    >
      <Link
        href={`/estimates/${job.estimate.id}`}
        className="block hover:opacity-80"
      >
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
          {job.estimate.number}
        </div>
        <div className="text-xs font-bold text-ink mt-0.5 leading-tight">
          {job.estimate.client.name}
        </div>
        {job.estimate.client.addressLine1 && (
          <div className="text-[10px] text-slate-600 truncate mt-0.5">
            {job.estimate.client.addressLine1}
          </div>
        )}
        <div className="text-[10px] text-slate-700 mt-1">
          {fenceLabel(job.fenceType, job.heightFeet, job.linearFeet)}
        </div>
      </Link>
      <StatusActions
        fenceJobId={job.id}
        estimateId={job.estimate.id}
        current={status}
      />
    </div>
  );
}

function fenceLabel(
  fenceType: string,
  heightFt: number,
  linearFeet: number,
): string {
  const t =
    FENCE_TYPE_LABELS[fenceType as FenceType] ?? titleCase(fenceType);
  return `${heightFt}' ${t} · ${linearFeet} LF`;
}

function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Returns the Monday of the week containing `d`, in UTC.
function mondayOf(d: Date): Date {
  const dt = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0),
  );
  const day = dt.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  dt.setUTCDate(dt.getUTCDate() + diff);
  dt.setUTCHours(0, 0, 0, 0);
  return dt;
}
