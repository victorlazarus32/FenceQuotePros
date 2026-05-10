import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { Button } from "@/components/Button";
import { formatDate, formatMoney } from "@/lib/format";
import { PrintButton } from "@/components/PrintButton";
import { DocWatermark } from "@/components/DocWatermark";
import { setInvoiceStatus } from "../actions";
import { PaymentForm } from "./PaymentForm";

export default async function InvoiceDetailPage(
  props: PageProps<"/invoices/[id]">,
) {
  const { id } = await props.params;
  const userId = await getCurrentUserId();
  const inv = await db.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      user: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { receivedAt: "desc" } },
      estimate: { select: { id: true, number: true } },
    },
  });
  if (!inv || inv.userId !== userId) notFound();

  const remaining = Math.max(0, inv.totalCents - inv.paidCents);
  const watermarkStatus =
    remaining === 0 && inv.totalCents > 0 ? "paid" : inv.status;
  const markSent = setInvoiceStatus.bind(null, inv.id, "sent");
  const markOverdue = setInvoiceStatus.bind(null, inv.id, "overdue");

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between gap-2 flex-wrap">
        <Link
          href="/invoices"
          className="text-sm text-slate-600 hover:text-ink"
        >
          ← All invoices
        </Link>
        <div className="flex gap-2 flex-wrap">
          {inv.status === "draft" && (
            <form action={markSent}>
              <Button variant="secondary" size="sm" type="submit">
                Mark as sent
              </Button>
            </form>
          )}
          {inv.status === "sent" && (
            <form action={markOverdue}>
              <Button variant="secondary" size="sm" type="submit">
                Mark overdue
              </Button>
            </form>
          )}
          <PrintButton />
        </div>
      </div>

      <article className="relative bg-white rounded-lg border border-line overflow-hidden print:border-0 print:shadow-none print:rounded-none">
        <DocWatermark status={watermarkStatus} />

        {/* Banded ink header — Direction B */}
        <header className="relative z-10 bg-ink text-paper px-8 py-6 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 grow">
            <div className="bg-white rounded-md p-1 shrink-0">
              <Image
                src="/logo-v2.png"
                alt=""
                width={56}
                height={56}
                className="rounded-sm"
              />
            </div>
            <div className="min-w-0">
              <div
                className="text-paper truncate"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.005em",
                  fontSize: "var(--text-xl)",
                  lineHeight: 1.05,
                }}
              >
                {inv.user.companyName ?? inv.user.name ?? "Fence Quote Pros"}
              </div>
              <div className="text-xs opacity-70 mt-0.5 space-x-1">
                {[inv.user.city, inv.user.state].filter(Boolean).join(", ") && (
                  <span>
                    {[inv.user.city, inv.user.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {inv.user.phone && <span>· {inv.user.phone}</span>}
                {inv.user.email && <span>· {inv.user.email}</span>}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-brand"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "var(--text-2xl)",
                lineHeight: 1,
              }}
            >
              Invoice
            </div>
            <div className="font-mono text-sm opacity-80 mt-1">
              {inv.number} · {formatDate(inv.issueDate)}
            </div>
            {inv.estimate && (
              <Link
                href={`/estimates/${inv.estimate.id}`}
                className="text-xs text-brand hover:opacity-80 mt-1 inline-block no-print"
              >
                from {inv.estimate.number} →
              </Link>
            )}
          </div>
        </header>

        <div className="relative z-10 p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                Bill to
              </div>
              <div className="font-medium">{inv.client.name}</div>
              <div className="text-sm text-slate-600 space-y-0.5 mt-0.5">
                {inv.client.addressLine1 && (
                  <div>{inv.client.addressLine1}</div>
                )}
                {(inv.client.city || inv.client.state) && (
                  <div>
                    {[inv.client.city, inv.client.state, inv.client.zip]
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                Issued
              </div>
              <div className="font-mono text-sm">
                {formatDate(inv.issueDate)}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                Due
              </div>
              <div className="font-mono text-sm">
                {inv.dueDate ? formatDate(inv.dueDate) : "—"}
              </div>
            </div>
          </div>

          <div className="border-t-2 border-ink" />

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-2 border-ink">
                <th className="py-2 font-semibold">Description</th>
                <th className="py-2 font-semibold text-right w-20">Qty</th>
                <th className="py-2 font-semibold text-right w-28">
                  Unit price
                </th>
                <th className="py-2 font-semibold text-right w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {inv.lineItems.map((l) => (
                <tr key={l.id} className="border-b border-dashed border-line">
                  <td className="py-3 pr-4">{l.description}</td>
                  <td className="py-3 text-right font-mono tabular-nums text-sm">
                    {l.quantity} {l.unit}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-sm">
                    {formatMoney(l.unitPriceCents)}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums font-medium">
                    {formatMoney(l.totalCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full sm:w-80 space-y-1 text-sm">
              <Row label="Subtotal" value={formatMoney(inv.subtotalCents)} />
              <Row
                label={`Tax ${inv.taxRate}%`}
                value={formatMoney(inv.taxCents)}
              />
              <div className="flex items-center justify-between pt-2 border-t-2 border-ink">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    fontSize: "var(--text-md)",
                  }}
                >
                  Total
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "var(--text-xl)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatMoney(inv.totalCents)}
                </span>
              </div>
              <Row label="Paid" value={formatMoney(inv.paidCents)} />
              <div className="flex items-center justify-between pt-2 border-t border-ink">
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    fontSize: "var(--text-lg)",
                  }}
                >
                  Balance due
                </span>
                <span
                  className="text-brand"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "var(--text-2xl)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatMoney(remaining)}
                </span>
              </div>
            </div>
          </div>

          {inv.terms && (
            <div className="pt-6 border-t border-line text-sm">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                Terms
              </div>
              <p className="whitespace-pre-wrap text-slate-700">{inv.terms}</p>
            </div>
          )}
        </div>
      </article>

      <section className="no-print bg-white rounded-lg border border-line p-6">
        <h2 className="h-card mb-4">Record a payment</h2>
        {remaining === 0 ? (
          <p className="text-sm text-green-700">Invoice fully paid. ✓</p>
        ) : (
          <PaymentForm invoiceId={inv.id} remainingCents={remaining} />
        )}

        {inv.payments.length > 0 && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
              Payment history
            </div>
            <ul className="divide-y divide-line text-sm">
              {inv.payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="font-medium font-mono tabular-nums">
                      {formatMoney(p.amountCents)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(p.receivedAt)} · {p.method}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-slate-600">
      <span>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}
