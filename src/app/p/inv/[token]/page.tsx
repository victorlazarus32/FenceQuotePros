// Public invoice viewing page. Reached via /p/inv/<shareToken> from the link
// emailed to the client. No auth required. Bilingual (?lang=es) like the
// public estimate page; mirrors the contractor's /invoices/[id] customer doc
// but strips all internal tools (no payment form, no status buttons).

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";
import {
  pickLang,
  t,
  translateLineDescription,
  translateUnit,
} from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage(
  props: PageProps<"/p/inv/[token]">,
) {
  const { token } = await props.params;
  const sp = await props.searchParams;
  const lang = pickLang(sp?.lang);
  const otherLang = lang === "en" ? "es" : "en";

  const inv = await db.invoice.findUnique({
    where: { shareToken: token },
    include: {
      client: true,
      user: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { receivedAt: "desc" } },
    },
  });
  if (!inv) notFound();

  const remaining = Math.max(0, inv.totalCents - inv.paidCents);
  const fullyPaid = remaining === 0 && inv.totalCents > 0;

  return (
    <div className="min-h-screen bg-paper text-text-strong">
      {/* Hide the app chrome from the customer-facing public view. */}
      <style>{`header.no-print { display: none !important; }
                main { padding: 0 !important; max-width: none !important; }`}</style>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="no-print flex justify-end mb-3">
          <Link
            href={`/p/inv/${token}?lang=${otherLang}`}
            className="text-sm text-brand font-semibold"
          >
            {lang === "en" ? t("en", "lang_toggle_es") : t("es", "lang_toggle_en")}
          </Link>
        </div>

        <article className="relative bg-white rounded-lg border border-line overflow-hidden print:border-0 print:shadow-none print:rounded-none">
          {/* Banded header */}
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
                      {[inv.user.city, inv.user.state]
                        .filter(Boolean)
                        .join(", ")}
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
                {t(lang, "invoice")}
              </div>
              <div className="font-mono text-sm opacity-80 mt-1">
                {inv.number} · {formatDate(inv.issueDate)}
              </div>
            </div>
          </header>

          <div className="relative z-10 p-8 space-y-6">
            {fullyPaid && (
              <div className="rounded-md bg-green-50 border border-green-200 text-green-800 text-sm font-semibold px-4 py-3">
                ✓ {t(lang, "fully_paid")}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  {t(lang, "bill_to")}
                </div>
                <div className="font-medium">{inv.client.name}</div>
                <div className="text-sm text-slate-600 space-y-0.5 mt-0.5">
                  {inv.client.addressLine1 && <div>{inv.client.addressLine1}</div>}
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
                  {t(lang, "issued")}
                </div>
                <div className="font-mono text-sm">{formatDate(inv.issueDate)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  {t(lang, "due")}
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
                  <th className="py-2 font-semibold">{t(lang, "description")}</th>
                  <th className="py-2 font-semibold text-right w-20">
                    {t(lang, "qty")}
                  </th>
                  <th className="py-2 font-semibold text-right w-28">
                    {t(lang, "unit_price")}
                  </th>
                  <th className="py-2 font-semibold text-right w-28">
                    {t(lang, "total")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {inv.lineItems.map((l) => (
                  <tr key={l.id} className="border-b border-dashed border-line">
                    <td className="py-3 pr-4">
                      {translateLineDescription(l.description, lang)}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-sm">
                      {l.quantity} {translateUnit(l.unit, lang)}
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
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t(lang, "subtotal")}</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(inv.subtotalCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>
                    {t(lang, "tax")} {inv.taxRate}%
                  </span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(inv.taxCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t-2 border-ink">
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      fontSize: "var(--text-md)",
                    }}
                  >
                    {t(lang, "total")}
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
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t(lang, "paid")}</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(inv.paidCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-ink">
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      fontSize: "var(--text-lg)",
                    }}
                  >
                    {t(lang, "balance_due")}
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

            {inv.payments.length > 0 && (
              <div className="pt-6 border-t border-line text-sm">
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                  {t(lang, "payment_history")}
                </div>
                <ul className="divide-y divide-line">
                  {inv.payments.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="font-mono tabular-nums font-medium">
                        {formatMoney(p.amountCents)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(p.receivedAt)} · {p.method}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {inv.terms && (
              <div className="pt-6 border-t border-line text-sm">
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  {t(lang, "terms")}
                </div>
                <p className="whitespace-pre-wrap text-slate-700">{inv.terms}</p>
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
