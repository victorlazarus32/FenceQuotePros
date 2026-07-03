import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMoney } from "@/lib/format";
import { displayInvoiceStatus, isInvoiceOverdue } from "@/lib/invoiceMoney";

// Filter chips. "all" deliberately EXCLUDES void (they only surface under
// their own tab), and "overdue" is a DERIVED filter — computed from due
// date + status at read time, never stored.
const FILTERS = [
  "all",
  "draft",
  "sent",
  "partial",
  "overdue",
  "paid",
  "void",
] as const;
type Filter = (typeof FILTERS)[number];

export default async function InvoicesPage(props: PageProps<"/invoices">) {
  const sp = await props.searchParams;
  const rawFilter = typeof sp?.status === "string" ? sp.status : "all";
  const filter: Filter = (FILTERS as readonly string[]).includes(rawFilter)
    ? (rawFilter as Filter)
    : "all";

  const userId = await getCurrentUserId();
  const all = await db.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  });

  const now = new Date();
  const invoices = all.filter((i) => {
    if (filter === "all") return i.status !== "void";
    if (filter === "overdue") return isInvoiceOverdue(i, now);
    if (filter === "sent") return i.status === "sent" && !isInvoiceOverdue(i, now);
    return i.status === filter;
  });

  const counts: Record<Filter, number> = {
    all: all.filter((i) => i.status !== "void").length,
    draft: all.filter((i) => i.status === "draft").length,
    sent: all.filter((i) => i.status === "sent" && !isInvoiceOverdue(i, now)).length,
    partial: all.filter((i) => i.status === "partial").length,
    overdue: all.filter((i) => isInvoiceOverdue(i, now)).length,
    paid: all.filter((i) => i.status === "paid").length,
    void: all.filter((i) => i.status === "void").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <Link
          href="/estimates"
          className="text-sm text-brand hover:text-ink font-medium"
        >
          Convert an estimate →
        </Link>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/invoices" : `/invoices?status=${f}`}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              filter === f
                ? "bg-ink text-paper border-ink"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1 opacity-60">{counts[f]}</span>
          </Link>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 py-16 text-center">
          <p className="text-slate-600">
            {filter === "all"
              ? "No invoices yet. Create an estimate, then convert it to an invoice."
              : `No ${filter} invoices.`}
          </p>
          {filter === "all" && (
            <Link
              href="/estimates/new"
              className="inline-block mt-3 text-sm font-medium text-brand"
            >
              New estimate →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Number</th>
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Due</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Paid</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/invoices/${i.id}`}
                      className="font-medium text-slate-900 hover:text-brand"
                    >
                      {i.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{i.client.name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {i.dueDate ? formatDate(i.dueDate) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={displayInvoiceStatus(i, now)} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatMoney(i.paidCents)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatMoney(i.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
