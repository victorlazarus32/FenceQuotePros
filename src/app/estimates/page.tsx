import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { LinkButton } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMoney } from "@/lib/format";

export default async function EstimatesPage() {
  const userId = await getCurrentUserId();
  const estimates = await db.estimate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-2xl font-semibold tracking-tight">Estimates</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/contracts"
            className="text-sm text-slate-600 hover:text-brand font-medium"
          >
            Terms library
          </Link>
          <LinkButton href="/estimates/new">+ New project</LinkButton>
        </div>
      </div>

      {estimates.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 py-16 text-center">
          <p className="text-slate-600">No estimates yet.</p>
          <Link
            href="/estimates/new"
            className="inline-block mt-3 text-sm font-medium text-brand"
          >
            Create your first estimate →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Number</th>
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Issued</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estimates.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/estimates/${e.id}`} className="font-medium text-slate-900 hover:text-brand">
                      {e.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{e.client.name}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(e.issueDate)}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatMoney(e.totalCents)}
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
