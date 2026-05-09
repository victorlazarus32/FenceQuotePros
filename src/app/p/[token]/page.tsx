// Public estimate viewing page. Reached via /p/<shareToken> from the link
// emailed to the client. No auth required. Records a view event + queues an
// auto follow-up email on the first visit. Layout mirrors the contractor's
// /estimates/[id] customer-doc article but strips internal tools (no nav,
// no breakdown panel, no status-mutating buttons).

import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { computeDepositCents } from "@/lib/deposit";
import type { DepositMode } from "@/lib/deposit";
import { followUpEmail } from "@/lib/emailTemplates";
import type { FenceType } from "@/lib/fence";
import { formatDate, formatMoney } from "@/lib/format";
import { SignatureBlock } from "@/components/SignatureBlock";
import { getTemplate } from "@/lib/permitDocs";
import {
  pickLang,
  t,
  translateLineDescription,
  translateUnit,
} from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PublicEstimatePage(
  props: PageProps<"/p/[token]">,
) {
  const { token } = await props.params;
  const sp = await props.searchParams;
  const lang = pickLang(sp?.lang);
  const otherLang = lang === "en" ? "es" : "en";

  const est = await db.estimate.findUnique({
    where: { shareToken: token },
    include: {
      client: true,
      user: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      fenceJobs: true,
      photos: {
        orderBy: { uploadedAt: "asc" },
        include: {
          visualizations: {
            where: { status: "ready" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      documents: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!est) notFound();

  const visualizations = est.photos.flatMap((p) =>
    p.visualizations.map((v) => ({
      photoId: p.id,
      visualizationId: v.id,
      angleLabel: p.angleLabel,
      resultUrl: v.resultKey ? `/uploads/${v.resultKey}` : null,
    })),
  ).filter((v) => v.resultUrl);

  // ── Record view + auto follow-up (best-effort; non-blocking on errors) ──
  // Wrapped in try so a logging failure can't take down the page render.
  try {
    const h = await headers();
    const ipAddress =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    const userAgent = h.get("user-agent") ?? null;
    const referer = h.get("referer") ?? null;

    await db.estimateView.create({
      data: {
        estimateId: est.id,
        ipAddress,
        userAgent,
        referer,
      },
    });

    await db.notification.create({
      data: {
        userId: est.userId,
        kind: "estimate_viewed",
        title: `${est.client.name} just viewed your proposal`,
        body: `${est.number} · ${formatMoney(est.totalCents)} · viewed from ${ipAddress ?? "unknown IP"}.`,
        estimateId: est.id,
        channels: "in_app",
      },
    });

    // Queue the auto follow-up letter — only once per estimate.
    const fenceJob = est.fenceJobs[0];
    if (fenceJob) {
      const existingFollowUp = await db.emailMessage.findFirst({
        where: {
          estimateId: est.id,
          kind: { startsWith: "follow_up" },
        },
        select: { id: true },
      });
      if (!existingFollowUp && est.client.email) {
        const baseUrl = (() => {
          const proto = h.get("x-forwarded-proto") ?? "http";
          const host = h.get("host");
          return host ? `${proto}://${host}` : "http://localhost:3002";
        })();
        const composed = followUpEmail({
          clientName: est.client.name,
          contractorName: est.user.name ?? est.user.email,
          contractorCompany: est.user.companyName,
          fenceType: fenceJob.fenceType as FenceType,
          shareUrl: `${baseUrl}/p/${token}`,
        });
        await db.emailMessage.create({
          data: {
            userId: est.userId,
            estimateId: est.id,
            kind: `follow_up_${fenceJob.fenceType}`,
            toAddress: est.client.email,
            fromAddress:
              est.user.email || `quotes@fencequotepros.com`,
            subject: composed.subject,
            bodyText: composed.body,
            status: "queued",
          },
        });
        await db.notification.create({
          data: {
            userId: est.userId,
            kind: "follow_up_queued",
            title: `Follow-up letter queued for ${est.client.name}`,
            body: `Auto-generated product info for ${fenceJob.fenceType.replace("_", " ")} — sits in the email queue until a real sender is configured.`,
            estimateId: est.id,
            channels: "in_app",
          },
        });
      }
    }
  } catch (err) {
    // swallow — view-tracking failures must not break the customer's page
    console.error("public-view tracking failed", err);
  }

  return (
    <div className="min-h-screen bg-paper text-text-strong">
      {/* Hide the contractor nav from the customer-facing public view. The
          root layout renders a header on every route; we suppress just that
          single header element here without restructuring layouts. */}
      <style>{`header.no-print { display: none !important; }
                main { padding: 0 !important; max-width: none !important; }`}</style>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <article className="relative bg-white rounded-lg border border-line overflow-hidden print:border-0 print:shadow-none print:rounded-none">
          {/* Banded header */}
          <header className="relative z-10 bg-ink text-paper px-8 py-6 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 grow">
              <div className="bg-white rounded-md p-1 shrink-0">
                <Image
                  src="/logo.png"
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
                  {est.user.companyName ?? est.user.name ?? "Fence Quote Pros"}
                </div>
                <div className="text-xs opacity-70 mt-0.5 space-x-1">
                  {[est.user.city, est.user.state]
                    .filter(Boolean)
                    .join(", ") && (
                    <span>
                      {[est.user.city, est.user.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                  {est.user.phone && <span>· {est.user.phone}</span>}
                  {est.user.email && <span>· {est.user.email}</span>}
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
                {t(lang, "estimate")}
              </div>
              <div className="font-mono text-sm opacity-80 mt-1">
                {est.number} · {formatDate(est.issueDate)}
              </div>
            </div>
          </header>

          <div className="relative z-10 p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  {lang === "es" ? "Para" : "For"}
                </div>
                <div className="font-medium">{est.client.name}</div>
                <div className="text-sm text-slate-600 space-y-0.5 mt-0.5">
                  {est.client.addressLine1 && (
                    <div>{est.client.addressLine1}</div>
                  )}
                  {(est.client.city || est.client.state) && (
                    <div>
                      {[est.client.city, est.client.state, est.client.zip]
                        .filter(Boolean)
                        .join(" ")}
                    </div>
                  )}
                  {est.client.phone && <div>{est.client.phone}</div>}
                  {est.client.folioNumber && (
                    <div className="font-mono text-xs text-slate-500 pt-0.5">
                      Folio {est.client.folioNumber}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  {lang === "es" ? "Válido hasta" : "Valid until"}
                </div>
                <div className="font-mono text-sm">
                  {est.expiryDate ? formatDate(est.expiryDate) : "—"}
                </div>
              </div>
              <div className="text-right">
                <a
                  href={`?lang=${otherLang}`}
                  className="text-xs text-slate-500 underline hover:text-ink"
                >
                  {otherLang === "es"
                    ? t("es", "lang_toggle_es")
                    : t("en", "lang_toggle_en")}
                </a>
              </div>
            </div>

            <div className="border-t-2 border-ink" />

            {visualizations.length > 0 && (
              <section className="space-y-3">
                <div
                  className="text-ink font-semibold"
                  style={{
                    fontFamily: "var(--font-display)",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    fontSize: "var(--text-md)",
                  }}
                >
                  {lang === "es"
                    ? "Vista previa de tu cerca"
                    : "Preview of your new fence"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visualizations.map((v) => (
                    <figure
                      key={v.visualizationId}
                      className="overflow-hidden rounded border border-line bg-slate-50"
                    >
                      <img
                        src={v.resultUrl ?? ""}
                        alt={v.angleLabel ?? "Fence preview"}
                        className="block w-full h-auto"
                      />
                      {v.angleLabel && (
                        <figcaption className="px-2 py-1 text-xs text-slate-600">
                          {v.angleLabel}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
                <p className="text-xs text-slate-500 italic">
                  {lang === "es"
                    ? "Vista previa renderizada. Aproximación — la instalación final puede variar."
                    : "Rendered preview. Approximate visualization — final installation may vary."}
                </p>
              </section>
            )}

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b-2 border-ink">
                  <th className="py-2 font-semibold">
                    {t(lang, "description")}
                  </th>
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
                {est.lineItems.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-dashed border-line"
                  >
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
              <div className="w-full sm:w-72 space-y-1 text-sm">
                <Row
                  label={t(lang, "subtotal")}
                  value={formatMoney(est.subtotalCents)}
                />
                <Row
                  label={`${t(lang, "tax")} ${est.taxRate}%`}
                  value={formatMoney(est.taxCents)}
                />
                <div className="flex items-center justify-between pt-2 border-t-2 border-ink">
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      fontSize: "var(--text-lg)",
                    }}
                  >
                    {t(lang, "total")}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: "var(--text-2xl)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatMoney(est.totalCents)}
                  </span>
                </div>
                {(() => {
                  const depositCents = computeDepositCents(est.totalCents, {
                    mode: est.depositMode as DepositMode,
                    percent: est.depositPercent,
                    fixedCents: est.depositFixedCents,
                  });
                  if (depositCents <= 0) return null;
                  const balanceCents = Math.max(
                    0,
                    est.totalCents - depositCents,
                  );
                  const depositLabel =
                    est.depositMode === "percent"
                      ? `${lang === "es" ? "Depósito" : "Deposit"} (${est.depositPercent}%)`
                      : lang === "es"
                        ? "Depósito"
                        : "Deposit";
                  return (
                    <>
                      <div className="flex items-center justify-between pt-2 text-sm">
                        <span className="text-slate-700">{depositLabel}</span>
                        <span className="font-mono tabular-nums text-ink font-semibold">
                          {formatMoney(depositCents)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">
                          {lang === "es" ? "Saldo restante" : "Balance due"}
                        </span>
                        <span className="font-mono tabular-nums text-slate-700">
                          {formatMoney(balanceCents)}
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {(est.notes || est.terms) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-line text-sm">
                {est.notes && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                      {t(lang, "notes")}
                    </div>
                    <p className="whitespace-pre-wrap text-slate-700">
                      {est.notes}
                    </p>
                  </div>
                )}
                {est.terms && (
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                      {t(lang, "terms")}
                    </div>
                    <p className="whitespace-pre-wrap text-slate-700">
                      {est.terms}
                    </p>
                  </div>
                )}
              </div>
            )}

            <SignatureBlock
              token={token}
              lang={lang}
              alreadySigned={Boolean(est.signedAt)}
              signedByName={est.signedByName}
              signedAt={est.signedAt}
              signatureDataUrl={est.signatureDataUrl}
            />

            {est.signedAt && est.documents.length > 0 && (
              <PermitDocsPanel
                token={token}
                lang={lang}
                documents={est.documents.map((d) => ({
                  id: d.id,
                  templateSlug: d.templateSlug,
                  status: d.status,
                  ownerSignedAt: d.ownerSignedAt,
                  ownerSignedByName: d.ownerSignedByName,
                }))}
              />
            )}

            {est.client.email && (
              <div className="pt-6 border-t border-line text-sm text-slate-600">
                Questions? Reply directly to{" "}
                <a
                  href={`mailto:${est.user.email}`}
                  className="font-semibold text-brand hover:text-ink"
                >
                  {est.user.email}
                </a>
                {est.user.phone && (
                  <>
                    {" "}
                    or call{" "}
                    <a
                      href={`tel:${est.user.phone}`}
                      className="font-semibold text-brand hover:text-ink"
                    >
                      {est.user.phone}
                    </a>
                  </>
                )}
                .
              </div>
            )}
          </div>
        </article>
      </main>
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

function PermitDocsPanel({
  token,
  lang,
  documents,
}: {
  token: string;
  lang: "en" | "es";
  documents: Array<{
    id: string;
    templateSlug: string;
    status: string;
    ownerSignedAt: Date | null;
    ownerSignedByName: string | null;
  }>;
}) {
  const pending = documents.filter((d) => !d.ownerSignedAt);
  const signed = documents.filter((d) => Boolean(d.ownerSignedAt));

  return (
    <div className="rounded-md border-2 border-ink p-5 bg-white no-print">
      <div className="h-card text-ink mb-1">
        {lang === "es"
          ? "Documentos del paquete de permiso"
          : "Permit packet documents"}
      </div>
      <div className="text-sm text-slate-600 mb-4">
        {pending.length > 0
          ? lang === "es"
            ? `${pending.length} documento(s) necesitan su firma para completar el paquete.`
            : `${pending.length} document${pending.length === 1 ? "" : "s"} need${pending.length === 1 ? "s" : ""} your signature to complete your permit packet.`
          : lang === "es"
            ? "Todos los documentos están firmados. Gracias."
            : "All documents are signed. Thank you."}
      </div>

      <ul className="space-y-2">
        {[...pending, ...signed].map((d) => {
          const template = getTemplate(d.templateSlug);
          if (!template) return null;
          const done = Boolean(d.ownerSignedAt);
          return (
            <li
              key={d.id}
              className={`rounded border p-3 flex items-center justify-between gap-4 ${
                done
                  ? "bg-paper border-line"
                  : "bg-brand-soft border-brand"
              }`}
            >
              <div className="min-w-0">
                <div className="font-semibold text-sm text-ink truncate">
                  {template.name}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {done
                    ? lang === "es"
                      ? `Firmado por ${d.ownerSignedByName ?? "—"}`
                      : `Signed by ${d.ownerSignedByName ?? "—"}`
                    : lang === "es"
                      ? "Pendiente — listo para firmar"
                      : "Pending — ready to sign"}
                </div>
              </div>
              <a
                href={`/p/${token}/docs/${template.slug}${lang === "es" ? "?lang=es" : ""}`}
                className={`shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${
                  done
                    ? "bg-paper text-ink border-2 border-line hover:border-ink"
                    : "bg-brand text-white hover:bg-ink"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {done
                  ? lang === "es"
                    ? "Ver"
                    : "View"
                  : lang === "es"
                    ? "Firmar →"
                    : "Sign →"}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
