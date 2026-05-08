import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMoney } from "@/lib/format";

export default async function InvoicesPage() {
  const userId = await getCurrentUserId();
  const invoices = await db.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <Link href="/estimates" className="text-sm text-brand hover:text-ink font-medium">
          Convert an estimate →
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 py-16 text-center">
          <p className="text-slate-600">
            No invoices yet. Create an estimate, then convert it to an invoice.
          </p>
          <Link
            href="/estimates/new"
            className="inline-block mt-3 text-sm font-medium text-brand"
          >
            New estimate →
          </Link>
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
                    <Link href={`/invoices/${i.id}`} className="font-medium text-slate-900 hover:text-brand">
                      {i.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{i.client.name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {i.dueDate ? formatDate(i.dueDate) : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
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
