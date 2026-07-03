// Reports — date-windowed money + pipeline numbers (PS pattern: quick-range
// presets, revenue from invoices/payments, never from stale CRM fields).
// Void invoices are excluded from every figure.

import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { FENCE_TYPE_LABELS, type FenceType } from "@/lib/fence";
import { KPI, Panel } from "@/components/StatBlocks";
import {
  RANGE_LABELS,
  REPORT_RANGES,
  pickRange,
  rangeStart,
} from "@/lib/reportRange";

export const dynamic = "force-dynamic";

export default async function ReportsPage(props: PageProps<"/reports">) {
  const sp = await props.searchParams;
  const range = pickRange(typeof sp?.range === "string" ? sp.range : undefined);
  const start = rangeStart(range);
  const userId = await getCurrentUserId();

  const dateFilter = start ? { gte: start } : undefined;

  const [payments, billedAgg, estimatesInWindow, closedWon, closedLost] =
    await Promise.all([
      // Money actually received in the window (void invoices excluded)
      db.payment.findMany({
        where: {
          invoice: { userId, status: { not: "void" } },
          ...(dateFilter ? { receivedAt: dateFilter } : {}),
        },
        orderBy: { receivedAt: "desc" },
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              client: { select: { name: true } },
            },
          },
        },
      }),
      // Billed = non-void invoices issued in the window
      db.invoice.aggregate({
        where: {
          userId,
          status: { not: "void" },
          ...(dateFilter ? { issueDate: dateFilter } : {}),
        },
        _sum: { totalCents: true },
        _count: true,
      }),
      // Estimates issued in the window, with fence type for the breakdown
      db.estimate.findMany({
        where: {
          userId,
          ...(dateFilter ? { issueDate: dateFilter } : {}),
        },
        select: {
          status: true,
          totalCents: true,
          fenceJobs: { select: { fenceType: true }, take: 1 },
        },
      }),
      db.estimate.count({
        where: {
          userId,
          workflowStatus: "closed_won",
          ...(dateFilter ? { workflowClosedAt: dateFilter } : {}),
        },
      }),
      db.estimate.count({
        where: {
          userId,
          workflowStatus: "closed_lost",
          ...(dateFilter ? { workflowClosedAt: dateFilter } : {}),
        },
      }),
    ]);

  const collectedCents = payments.reduce((s, p) => s + p.amountCents, 0);
  const billedCents = billedAgg._sum.totalCents ?? 0;

  const sentCount = estimatesInWindow.filter(
    (e) => e.status !== "draft",
  ).length;
  const acceptedCount = estimatesInWindow.filter(
    (e) => e.status === "accepted",
  ).length;
  const decidedCount = estimatesInWindow.filter((e) =>
    ["accepted", "declined", "expired"].includes(e.status),
  ).length;
  const winRate =
    decidedCount > 0 ? Math.round((acceptedCount / decidedCount) * 100) : null;

  // Booked by fence type — accepted estimates issued in the window.
  const byType = new Map<string, { count: number; cents: number }>();
  for (const e of estimatesInWindow) {
    if (e.status !== "accepted") continue;
    const type = e.fenceJobs[0]?.fenceType ?? "other";
    const cur = byType.get(type) ?? { count: 0, cents: 0 };
    cur.count += 1;
    cur.cents += e.totalCents;
    byType.set(type, cur);
  }
  const typeRows = [...byType.entries()].sort((a, b) => b[1].cents - a[1].cents);
  const typeLabel = (t: string): string =>
    (FENCE_TYPE_LABELS as Record<string, string>)[t as FenceType] ?? t;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <div className="flex gap-1.5 flex-wrap">
          {REPORT_RANGES.map((r) => (
            <Link
              key={r}
              href={r === "30" ? "/reports" : `/reports?range=${r}`}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                range === r
                  ? "bg-ink text-paper border-ink"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {RANGE_LABELS[r]}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI
          label={`Collected (${RANGE_LABELS[range]})`}
          value={formatMoney(collectedCents)}
          delta={
            payments.length === 0
              ? null
              : {
                  kind: "up",
                  text: `${payments.length} payment${payments.length === 1 ? "" : "s"}`,
                }
          }
        />
        <KPI
          label="Billed"
          value={formatMoney(billedCents)}
          delta={
            billedAgg._count === 0
              ? null
              : { kind: "neutral", text: `${billedAgg._count} invoices` }
          }
        />
        <KPI
          label="Estimates sent"
          value={sentCount.toString()}
          delta={
            winRate == null
              ? null
              : { kind: "neutral", text: `${winRate}% win rate` }
          }
        />
        <KPI
          label="Jobs closed"
          value={`${closedWon}`}
          delta={
            closedLost === 0
              ? closedWon === 0
                ? null
                : { kind: "up", text: "no losses" }
              : { kind: "down", text: `${closedLost} lost` }
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Booked by fence type">
          {typeRows.length === 0 ? (
            <p className="text-sm text-slate-500">
              No accepted estimates in this window.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-2 font-semibold">Type</th>
                  <th className="pb-2 font-semibold text-right">Jobs</th>
                  <th className="pb-2 font-semibold text-right">Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {typeRows.map(([type, v]) => (
                  <tr key={type}>
                    <td className="py-2">{typeLabel(type)}</td>
                    <td className="py-2 text-right tabular-nums">{v.count}</td>
                    <td className="py-2 text-right font-mono tabular-nums font-medium">
                      {formatMoney(v.cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="Payments received" linkHref="/invoices" linkLabel="Invoices →">
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No payments in this window.
            </p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {payments.slice(0, 12).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2 gap-2"
                >
                  <Link
                    href={`/invoices/${p.invoice.id}`}
                    className="hover:text-brand min-w-0 truncate"
                  >
                    <span className="font-mono">{p.invoice.number}</span> ·{" "}
                    {p.invoice.client.name}
                  </Link>
                  <span className="shrink-0 text-xs text-slate-500">
                    {formatDate(p.receivedAt)} · {p.method}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums font-medium">
                    {formatMoney(p.amountCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
