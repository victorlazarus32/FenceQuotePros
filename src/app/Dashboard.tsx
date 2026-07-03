import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { formatMoney, formatDate } from "@/lib/format";
import { displayInvoiceStatus, isInvoiceOverdue } from "@/lib/invoiceMoney";
import {
  STAGE_LABELS,
  TERMINAL_STAGES,
  daysInStage,
  isStuck,
  type WorkflowStage,
} from "@/lib/jobWorkflow";
import { LinkButton } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";

export default async function Dashboard() {
  const userId = await getCurrentUserId();
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const [
    estimates,
    invoices,
    openInvoices,
    openInvoiceAgg,
    paidInvoiceAgg,
    bookedWeekAgg,
    estCount30,
    wonCount30,
    notifications,
    openTasks,
    activeJobs,
  ] = await Promise.all([
    db.estimate.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { client: { select: { name: true } } },
    }),
    db.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    // ALL money-open invoices — overdue $ and the overdue list are derived
    // from this full set, not the 5 most-recent (which silently undercounted
    // overdue whenever an old invoice aged out of the recency window).
    db.invoice.findMany({
      where: { userId, status: { in: ["sent", "partial"] } },
      include: { client: { select: { name: true } } },
    }),
    db.invoice.aggregate({
      where: {
        userId,
        status: { in: ["sent", "partial"] },
      },
      _sum: { totalCents: true, paidCents: true },
    }),
    db.invoice.aggregate({
      where: { userId, status: "paid" },
      _sum: { totalCents: true },
    }),
    db.estimate.aggregate({
      where: {
        userId,
        status: "accepted",
        updatedAt: { gte: weekAgo },
      },
      _sum: { totalCents: true },
      _count: true,
    }),
    db.estimate.count({
      where: {
        userId,
        status: { in: ["accepted", "declined", "expired"] },
        updatedAt: { gte: monthAgo },
      },
    }),
    db.estimate.count({
      where: {
        userId,
        status: "accepted",
        updatedAt: { gte: monthAgo },
      },
    }),
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    // Open job tasks, soonest due first (nulls last by Prisma default asc)
    db.jobTask.findMany({
      where: { userId, completedAt: null },
      orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
      take: 8,
      include: { estimate: { select: { id: true, number: true } } },
    }),
    // Non-terminal jobs + their latest transition — powers stuck detection
    // (days-in-stage from the last event INTO the current stage, per PS).
    db.estimate.findMany({
      where: { userId, workflowStatus: { notIn: [...TERMINAL_STAGES] } },
      include: {
        client: { select: { name: true } },
        workflowEvents: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  ]);

  const stuckJobs = activeJobs
    .map((e) => {
      const enteredAt = e.workflowEvents[0]?.createdAt ?? e.createdAt;
      return { est: e, enteredAt, days: daysInStage(enteredAt, now) };
    })
    .filter((j) => isStuck(j.est.workflowStatus, j.enteredAt, now))
    .sort((a, b) => b.days - a.days)
    .slice(0, 8);

  const outstandingCents =
    (openInvoiceAgg._sum.totalCents ?? 0) -
    (openInvoiceAgg._sum.paidCents ?? 0);
  // Shared derived-overdue predicate (lib/invoiceMoney) over the FULL open
  // set — void and paid can never appear here.
  const overdueCents = openInvoices
    .filter((i) => isInvoiceOverdue(i, now))
    .reduce((sum, i) => sum + (i.totalCents - i.paidCents), 0);

  const openEstimateCount = estimates.filter(
    (e) => e.status === "draft" || e.status === "sent",
  ).length;
  const winRate = estCount30 > 0 ? Math.round((wonCount30 / estCount30) * 100) : null;
  const bookedWeekCents = bookedWeekAgg._sum.totalCents ?? 0;
  const bookedWeekCount = bookedWeekAgg._count;
  const paidLifetimeCents = paidInvoiceAgg._sum.totalCents ?? 0;

  const overdueInvoices = openInvoices.filter((i) =>
    isInvoiceOverdue(i, now),
  );
  const agingEstimates = estimates.filter((e) => {
    if (e.status !== "sent") return false;
    const ageDays =
      (now.getTime() - new Date(e.issueDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return ageDays > 14;
  });

  const greeting = getGreeting(user.name ?? "");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="h-page" style={{ fontSize: "var(--text-2xl)" }}>
            {greeting}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Here&apos;s what&apos;s moving today.
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/estimates/new" variant="primary">
            + New estimate
          </LinkButton>
        </div>
      </div>

      {/* KPI grid — Direction A */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI
          label="Open estimates"
          value={openEstimateCount.toString()}
          delta={
            openEstimateCount === 0
              ? null
              : { kind: "neutral", text: `${openEstimateCount} in flight` }
          }
        />
        <KPI
          label="Win rate (30d)"
          value={winRate == null ? "—" : `${winRate}%`}
          delta={
            estCount30 === 0
              ? null
              : { kind: "neutral", text: `${wonCount30}/${estCount30} accepted` }
          }
        />
        <KPI
          label="Outstanding"
          value={formatMoney(outstandingCents)}
          delta={
            overdueCents > 0
              ? { kind: "down", text: `${formatMoney(overdueCents)} overdue` }
              : null
          }
        />
        <KPI
          label="Booked this week"
          value={formatMoney(bookedWeekCents)}
          delta={
            bookedWeekCount === 0
              ? null
              : {
                  kind: "up",
                  text: `${bookedWeekCount} job${bookedWeekCount === 1 ? "" : "s"}`,
                }
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Recent estimates panel */}
        <Panel
          title="Recent estimates"
          linkHref="/estimates"
          linkLabel="View all"
        >
          {estimates.length === 0 ? (
            <Empty
              message="No estimates yet."
              ctaHref="/estimates/new"
              ctaLabel="Create your first estimate"
            />
          ) : (
            <ul>
              {estimates.map((est) => (
                <li
                  key={est.id}
                  className="border-b border-line last:border-b-0"
                >
                  <Link
                    href={`/estimates/${est.id}`}
                    className="flex items-center justify-between py-3 px-3 hover:bg-paper transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-sm tabular-nums text-ink">
                        {est.number}{" "}
                        <span className="text-slate-500">
                          · {est.client.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatDate(est.issueDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={est.status} />
                      <span className="font-mono tabular-nums font-semibold">
                        {formatMoney(est.totalCents)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Side rail: Paid lifetime + needs-follow-up */}
        <div className="space-y-4">
          <Panel title="Paid (lifetime)">
            <div
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-3xl)",
                lineHeight: 1,
                color: "var(--brand)",
              }}
            >
              {formatMoney(paidLifetimeCents)}
            </div>
            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-semibold">
              All-time collected
            </div>
          </Panel>

          <Panel title="Open tasks">
            {openTasks.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing open. ✓</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {openTasks.map((t) => {
                  const overdueTask = t.dueAt != null && new Date(t.dueAt) < now;
                  return (
                    <li key={t.id} className="flex items-start gap-2">
                      <span
                        className={`shrink-0 ${overdueTask ? "text-red-600" : "text-slate-400"}`}
                      >
                        ☐
                      </span>
                      <Link
                        href={`/estimates/${t.estimate.id}`}
                        className="hover:text-brand"
                      >
                        {t.title}
                        <span className="text-xs text-slate-400">
                          {" "}
                          · {t.estimate.number}
                          {t.dueAt && ` · due ${formatDate(t.dueAt)}`}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Stuck jobs">
            {stuckJobs.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nothing sitting too long. ✓
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stuckJobs.map((j) => (
                  <li key={j.est.id} className="flex items-start gap-2">
                    <span className="text-amber-600 shrink-0">⏳</span>
                    <Link
                      href={`/estimates/${j.est.id}`}
                      className="hover:text-brand"
                    >
                      <span className="font-mono">{j.est.number}</span> ·{" "}
                      {j.est.client.name} —{" "}
                      <span className="font-medium">
                        {j.days}d in{" "}
                        {STAGE_LABELS[j.est.workflowStatus as WorkflowStage] ??
                          j.est.workflowStatus}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Needs follow-up">
            {agingEstimates.length === 0 && overdueInvoices.length === 0 ? (
              <p className="text-sm text-slate-500">All clear. ✓</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {agingEstimates.map((e) => (
                  <li key={e.id} className="flex items-start gap-2">
                    <span className="text-amber-600 shrink-0">↪</span>
                    <Link
                      href={`/estimates/${e.id}`}
                      className="hover:text-brand"
                    >
                      <span className="font-mono">{e.number}</span> ·{" "}
                      {e.client.name} sent &gt; 14d ago
                    </Link>
                  </li>
                ))}
                {overdueInvoices.map((i) => (
                  <li key={i.id} className="flex items-start gap-2">
                    <span className="text-red-600 shrink-0">↪</span>
                    <Link
                      href={`/invoices/${i.id}`}
                      className="hover:text-brand"
                    >
                      <span className="font-mono">{i.number}</span> ·{" "}
                      {formatMoney(i.totalCents - i.paidCents)} overdue
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {/* Activity feed — sends, views, queued follow-ups */}
      <Panel title="Recent activity">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500">
            No activity yet. Send a proposal from any estimate to start
            tracking customer views and queued follow-up letters here.
          </p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => {
              const icon = activityIcon(n.kind);
              return (
                <li
                  key={n.id}
                  className="flex items-start gap-3 text-sm border-b border-line last:border-b-0 pb-2 last:pb-0"
                >
                  <span
                    aria-hidden
                    className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-base"
                    style={{
                      background: icon.bg,
                      color: icon.fg,
                    }}
                  >
                    {icon.glyph}
                  </span>
                  <div className="min-w-0 grow">
                    <div className="font-medium text-ink truncate">
                      {n.estimateId ? (
                        <Link
                          href={`/estimates/${n.estimateId}`}
                          className="hover:text-brand"
                        >
                          {n.title}
                        </Link>
                      ) : (
                        n.title
                      )}
                    </div>
                    {n.body && (
                      <div className="text-xs text-slate-500 truncate">
                        {n.body}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    {formatDate(n.createdAt)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* Recent invoices — full width */}
      <Panel
        title="Recent invoices"
        linkHref="/invoices"
        linkLabel="View all"
      >
        {invoices.length === 0 ? (
          <Empty
            message="No invoices yet."
            ctaHref="/invoices"
            ctaLabel="Convert an estimate to invoice"
          />
        ) : (
          <ul>
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="border-b border-line last:border-b-0"
              >
                <Link
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between py-3 px-3 hover:bg-paper transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-sm tabular-nums text-ink">
                      {inv.number}{" "}
                      <span className="text-slate-500">
                        · {inv.client.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Due {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={displayInvoiceStatus(inv, now)} />
                    <span className="font-mono tabular-nums font-semibold">
                      {formatMoney(inv.totalCents)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function KPI({
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

function Panel({
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

function Empty({
  message,
  ctaHref,
  ctaLabel,
}: {
  message: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-slate-600">{message}</p>
      <Link
        href={ctaHref}
        className="inline-block mt-3 text-sm font-medium text-brand hover:text-ink"
      >
        {ctaLabel} →
      </Link>
    </div>
  );
}

function getGreeting(name: string): string {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const firstName = name.split(" ")[0];
  if (firstName) return `${day} morning, ${firstName}`;
  return `${day} morning`;
}

function activityIcon(kind: string): {
  glyph: string;
  bg: string;
  fg: string;
} {
  if (kind === "estimate_sent")
    return { glyph: "✉", bg: "#fff1e7", fg: "#ff6b1a" };
  if (kind === "estimate_viewed")
    return { glyph: "👁", bg: "#dcfce7", fg: "#16a34a" };
  if (kind === "estimate_signed")
    return { glyph: "✍", bg: "#fef3c7", fg: "#b45309" };
  if (kind === "email_opened")
    return { glyph: "📬", bg: "#dbeafe", fg: "#2563eb" };
  if (kind === "follow_up_queued")
    return { glyph: "⏱", bg: "#fef9c3", fg: "#a16207" };
  if (kind === "invoice_sent")
    return { glyph: "🧾", bg: "#fff1e7", fg: "#ff6b1a" };
  if (kind === "payment_received")
    return { glyph: "$", bg: "#dcfce7", fg: "#16a34a" };
  return { glyph: "•", bg: "#f1f5f9", fg: "#64748b" };
}
