import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { LinkButton } from "@/components/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatMoney } from "@/lib/format";

export default async function ClientDetailPage(props: PageProps<"/clients/[id]">) {
  const { id } = await props.params;
  const userId = await getCurrentUserId();
  const client = await db.client.findUnique({
    where: { id },
    include: {
      estimates: { orderBy: { createdAt: "desc" }, take: 20 },
      invoices: { orderBy: { createdAt: "desc" }, take: 20 },
      hoaTemplate: { select: { id: true, name: true } },
    },
  });
  if (!client || client.userId !== userId) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
          <div className="mt-1 text-sm text-slate-600 space-y-0.5">
            {client.email && <div>{client.email}</div>}
            {client.phone && <div>{client.phone}</div>}
            {(client.addressLine1 || client.city) && (
              <div>
                {client.addressLine1}
                {client.addressLine1 && (client.city || client.state) ? ", " : ""}
                {[client.city, client.state, client.zip].filter(Boolean).join(" ")}
              </div>
            )}
            {client.folioNumber && (
              <div className="font-mono text-xs text-slate-500">
                Folio {client.folioNumber}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/clients/${client.id}/edit`} variant="secondary">Edit</LinkButton>
          <LinkButton href={`/estimates/new?clientId=${client.id}`}>+ New estimate</LinkButton>
        </div>
      </div>

      {client.hoaRequired && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-900">
          <div className="flex items-center justify-between mb-1">
            <strong>HOA approval required</strong>
            {client.hoaSubmissionUrl && (
              <a
                href={client.hoaSubmissionUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs underline hover:text-blue-700"
              >
                Open portal →
              </a>
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
            {client.hoaName && (
              <div>
                <dt className="inline text-blue-700">Association: </dt>
                <dd className="inline">{client.hoaName}</dd>
              </div>
            )}
            {client.hoaContactName && (
              <div>
                <dt className="inline text-blue-700">Contact: </dt>
                <dd className="inline">{client.hoaContactName}</dd>
              </div>
            )}
            {client.hoaContactEmail && (
              <div>
                <dt className="inline text-blue-700">Email: </dt>
                <dd className="inline">
                  <a href={`mailto:${client.hoaContactEmail}`} className="underline">
                    {client.hoaContactEmail}
                  </a>
                </dd>
              </div>
            )}
            {client.hoaContactPhone && (
              <div>
                <dt className="inline text-blue-700">Phone: </dt>
                <dd className="inline">{client.hoaContactPhone}</dd>
              </div>
            )}
          </dl>
          {client.hoaTemplate && (
            <div className="mt-2 text-xs">
              <span className="text-blue-700">Template: </span>
              <Link
                href={`/hoa-templates/${client.hoaTemplate.id}`}
                className="underline hover:text-blue-900"
              >
                {client.hoaTemplate.name}
              </Link>
            </div>
          )}
          {client.hoaNotes && (
            <p className="mt-2 whitespace-pre-wrap text-xs">{client.hoaNotes}</p>
          )}
        </div>
      )}

      {client.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-900">
          <strong className="block mb-1">Notes</strong>
          <p className="whitespace-pre-wrap">{client.notes}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Estimates">
          {client.estimates.length === 0 ? (
            <p className="text-sm text-slate-500">No estimates for this client.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {client.estimates.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/estimates/${e.id}`}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 rounded px-1"
                  >
                    <div>
                      <div className="font-medium">{e.number}</div>
                      <div className="text-xs text-slate-500">{formatDate(e.issueDate)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={e.status} />
                      <span className="font-semibold tabular-nums">
                        {formatMoney(e.totalCents)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Invoices">
          {client.invoices.length === 0 ? (
            <p className="text-sm text-slate-500">No invoices for this client.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {client.invoices.map((i) => (
                <li key={i.id}>
                  <Link
                    href={`/invoices/${i.id}`}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 rounded px-1"
                  >
                    <div>
                      <div className="font-medium">{i.number}</div>
                      <div className="text-xs text-slate-500">
                        Due {i.dueDate ? formatDate(i.dueDate) : "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={i.status} />
                      <span className="font-semibold tabular-nums">
                        {formatMoney(i.totalCents)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-lg border border-slate-200">
      <header className="px-4 py-3 border-b border-slate-100">
        <h2 className="font-medium">{title}</h2>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
