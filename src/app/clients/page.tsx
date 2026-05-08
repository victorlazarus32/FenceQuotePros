import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { LinkButton } from "@/components/Button";

export default async function ClientsPage() {
  const userId = await getCurrentUserId();
  const clients = await db.client.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { estimates: true, invoices: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <LinkButton href="/clients/new">+ New client</LinkButton>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 py-16 text-center">
          <p className="text-slate-600">No clients yet.</p>
          <Link
            href="/clients/new"
            className="inline-block mt-3 text-sm font-medium text-brand"
          >
            Add your first client →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Phone</th>
                <th className="px-4 py-2 font-medium">City</th>
                <th className="px-4 py-2 font-medium text-right">Estimates</th>
                <th className="px-4 py-2 font-medium text-right">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/clients/${c.id}`}
                      className="font-medium text-slate-900 hover:text-brand"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {c.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {c.city ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c._count.estimates}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c._count.invoices}
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
