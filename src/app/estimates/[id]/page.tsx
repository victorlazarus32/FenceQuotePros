import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { Button, LinkButton } from "@/components/Button";
import { formatDate, formatMoney } from "@/lib/format";
import {
  convertEstimateToInvoice,
  deleteEstimate,
  setEstimateStatus,
} from "../actions";
import { PrintButton } from "@/components/PrintButton";
import { ConfirmDeleteForm } from "@/components/ConfirmDeleteForm";
import { DocWatermark } from "@/components/DocWatermark";
import { AcceptDeclineBlock } from "@/components/AcceptDeclineBlock";
import { JobBreakdownPanel } from "@/components/JobBreakdownPanel";
import { SendProposalButton } from "@/components/SendProposalButton";
import { PermitDocsContractorPanel } from "@/components/PermitDocsContractorPanel";
import { getTemplate } from "@/lib/permitDocs";
import { calculateFenceJob, fenceJobRowToCalcInput } from "@/lib/fence";
import { computeDepositCents, type DepositMode } from "@/lib/deposit";
import {
  pickLang,
  t,
  translateLineDescription,
  translateUnit,
} from "@/lib/i18n";

export default async function EstimateDetailPage(
  props: PageProps<"/estimates/[id]">,
) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const lang = pickLang(sp?.lang);
  const otherLang = lang === "en" ? "es" : "en";
  const userId = await getCurrentUserId();
  const est = await db.estimate.findUnique({
    where: { id },
    include: {
      client: true,
      user: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      fenceJobs: true,
      invoice: true,
      views: { orderBy: { viewedAt: "desc" }, take: 5 },
      emailMessages: { orderBy: { queuedAt: "desc" }, take: 10 },
      documents: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!est || est.userId !== userId) notFound();

  const contractorHasSavedSig = Boolean(est.user.signatureDataUrl);

  const markSent = setEstimateStatus.bind(null, est.id, "sent");
  const markAccepted = setEstimateStatus.bind(null, est.id, "accepted");
  const markDeclined = setEstimateStatus.bind(null, est.id, "declined");
  const convert = convertEstimateToInvoice.bind(null, est.id);
  const remove = deleteEstimate.bind(null, est.id);

  const showAcceptBlock =
    est.status === "draft" || est.status === "sent";
  const fenceJob = est.fenceJobs[0];
  const jobSummary = fenceJob
    ? `${formatFenceType(fenceJob.fenceType, lang)} · ${fenceJob.linearFeet} ${lang === "es" ? "pl" : "lf"}`
    : null;
  const breakdownResult = fenceJob
    ? calculateFenceJob(fenceJobRowToCalcInput(fenceJob))
    : null;

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between gap-2 flex-wrap">
        <Link
          href="/estimates"
          className="text-sm text-slate-600 hover:text-ink"
        >
          {t(lang, "all_estimates")}
        </Link>
        <div className="flex gap-2 items-center flex-wrap">
          <LinkButton
            href={`/estimates/${est.id}?lang=${otherLang}`}
            variant="secondary"
            size="sm"
          >
            {otherLang === "es"
              ? t("es", "lang_toggle_es")
              : t("en", "lang_toggle_en")}
          </LinkButton>
          <SendProposalButton
            estimateId={est.id}
            hasShareToken={!!est.shareToken}
            hasClientEmail={!!est.client.email}
          />
          <LinkButton
            href={`/estimates/${est.id}/visualize`}
            variant="secondary"
            size="sm"
          >
            Visualize fence
          </LinkButton>
          {est.status === "draft" && (
            <form action={markSent}>
              <Button variant="secondary" size="sm" type="submit">
                {t(lang, "mark_sent")}
              </Button>
            </form>
          )}
          {(est.status === "draft" || est.status === "sent") && (
            <>
              <form action={markAccepted}>
                <Button variant="secondary" size="sm" type="submit">
                  {t(lang, "mark_accepted")}
                </Button>
              </form>
              <form action={markDeclined}>
                <Button variant="secondary" size="sm" type="submit">
                  {t(lang, "mark_declined")}
                </Button>
              </form>
            </>
          )}
          {!est.invoice && (
            <form action={convert}>
              <Button size="sm" type="submit">
                {t(lang, "convert_to_invoice")}
              </Button>
            </form>
          )}
          {est.invoice && (
            <LinkButton href={`/invoices/${est.invoice.id}`} size="sm">
              {t(lang, "view_invoice")} {est.invoice.number} →
            </LinkButton>
          )}
          <PrintButton />
          <ConfirmDeleteForm
            action={remove}
            message={t(lang, "confirm_delete_estimate")}
          >
            <Button variant="danger" size="sm" type="submit">
              {t(lang, "delete")}
            </Button>
          </ConfirmDeleteForm>
        </div>
      </div>

      {(est.views.length > 0 || est.emailMessages.length > 0) && (
        <section className="no-print rounded-lg border border-line bg-white p-4">
          <div className="flex items-baseline justify-between mb-3">
            <h2
              className="h-card text-ink"
              style={{ fontSize: "var(--text-md)" }}
            >
              Activity
            </h2>
            {est.shareToken && (
              <a
                href={`/p/${est.shareToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-slate-500 hover:text-brand truncate max-w-[60%]"
              >
                /p/{est.shareToken}
              </a>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-md bg-paper p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Views
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "var(--text-xl)",
                }}
              >
                {est.views.length}
              </div>
              {est.views[0] && (
                <div className="text-xs text-slate-500 mt-0.5">
                  Last {formatDate(est.views[0].viewedAt)}
                </div>
              )}
            </div>
            <div className="rounded-md bg-paper p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Emails queued
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "var(--text-xl)",
                }}
              >
                {est.emailMessages.length}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {est.emailMessages.filter((m) => m.kind === "proposal").length}{" "}
                proposal ·{" "}
                {
                  est.emailMessages.filter((m) =>
                    m.kind.startsWith("follow_up"),
                  ).length
                }{" "}
                follow-up
              </div>
            </div>
            <div className="rounded-md bg-paper p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Status
              </div>
              <div
                className="tabular-nums uppercase"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "var(--text-xl)",
                }}
              >
                {est.status}
              </div>
            </div>
          </div>
          {est.emailMessages.length > 0 && (
            <ul className="text-sm space-y-1.5">
              {est.emailMessages.slice(0, 5).map((m) => (
                <li key={m.id} className="flex justify-between gap-3">
                  <span className="text-slate-700 truncate">
                    <span className="text-xs font-mono text-slate-400 mr-2">
                      {m.kind === "proposal"
                        ? "PROPOSAL"
                        : m.kind.startsWith("follow_up")
                          ? "FOLLOW-UP"
                          : m.kind.toUpperCase()}
                    </span>
                    {m.subject}
                  </span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {m.status} · {formatDate(m.queuedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-500 italic">
            No live email service is hooked up yet. Queued messages live in the
            DB until Resend / Twilio are configured.
          </p>
        </section>
      )}

      {breakdownResult && <JobBreakdownPanel result={breakdownResult} />}

      <article className="relative bg-white rounded-lg border border-line overflow-hidden print:border-0 print:shadow-none print:rounded-none">
        <DocWatermark status={est.status} lang={lang} />

        {/* Banded ink header — Direction B */}
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
                {[est.user.city, est.user.state].filter(Boolean).join(", ") && (
                  <span>
                    {[est.user.city, est.user.state].filter(Boolean).join(", ")}
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
          {/* For / Job / Valid until */}
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
                    {lang === "es" ? "Folio" : "Folio"} {est.client.folioNumber}
                  </div>
                )}
              </div>
            </div>
            {jobSummary && (
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                  {lang === "es" ? "Trabajo" : "Job"}
                </div>
                <div>{jobSummary}</div>
              </div>
            )}
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                {lang === "es" ? "Válido hasta" : "Valid until"}
              </div>
              <div className="font-mono text-sm">
                {est.expiryDate ? formatDate(est.expiryDate) : "—"}
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
              {est.lineItems.map((l) => (
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
                    ? `Deposit (${est.depositPercent}%)`
                    : "Deposit";
                return (
                  <>
                    <Row label={depositLabel} value={formatMoney(depositCents)} />
                    <Row label="Balance due" value={formatMoney(balanceCents)} />
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

          {showAcceptBlock && (
            <AcceptDeclineBlock
              acceptAction={markAccepted}
              declineAction={markDeclined}
              lang={lang}
            />
          )}

          <div className="mt-8">
            <PermitDocsContractorPanel
              estimateId={est.id}
              estimateSigned={Boolean(est.signedAt)}
              permitDocsAutoTrigger={est.permitDocsAutoTrigger}
              permitDocsTriggeredAt={est.permitDocsTriggeredAt}
              permitValueOfWorkDollars={
                est.permitValueOfWorkCents != null
                  ? (est.permitValueOfWorkCents / 100).toFixed(2)
                  : ""
              }
              estimateTotalDollars={(est.totalCents / 100).toLocaleString(
                "en-US",
                { style: "currency", currency: "USD" },
              )}
              showDemoButton={process.env.NODE_ENV !== "production"}
              documents={est.documents.map((d) => {
                const tpl = getTemplate(d.templateSlug);
                return {
                  id: d.id,
                  templateSlug: d.templateSlug,
                  templateName: tpl?.name ?? d.templateSlug,
                  templateSourcePdfFilename:
                    tpl?.sourcePdfFilename ?? "blank.pdf",
                  status: d.status,
                  ownerSignedAt: d.ownerSignedAt,
                  ownerSignedByName: d.ownerSignedByName,
                  contractorSignedAt: d.contractorSignedAt,
                  contractorRequired: tpl?.requiresContractorSignature ?? false,
                  generatedPdfKey: d.generatedPdfKey,
                  hasContractorSavedSig: contractorHasSavedSig,
                };
              })}
            />
          </div>

          {est.signedAt && est.signatureDataUrl && (
            <div
              className="mt-8 rounded-md border-2 border-ink p-5"
              style={{ background: "var(--brand-soft)" }}
            >
              <div className="h-card text-ink">
                {lang === "es" ? "Firmado y aceptado" : "Signed and accepted"}
              </div>
              <div className="bg-white rounded border border-line p-3 inline-block mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={est.signatureDataUrl}
                  alt="Customer signature"
                  className="max-h-32 block"
                />
              </div>
              <div className="text-xs text-slate-600 mt-3 space-y-0.5">
                <div>
                  {lang === "es" ? "Firmado por" : "Signed by"}:{" "}
                  <span className="font-semibold text-ink">
                    {est.signedByName ?? "—"}
                  </span>
                </div>
                <div>
                  {lang === "es" ? "Fecha y hora" : "Date / time"}:{" "}
                  <span className="font-mono">
                    {new Date(est.signedAt).toLocaleString(
                      lang === "es" ? "es-US" : "en-US",
                      { dateStyle: "long", timeStyle: "short" },
                    )}
                  </span>
                </div>
                {est.signedIp && (
                  <div>
                    IP:{" "}
                    <span className="font-mono">{est.signedIp}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
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

function formatFenceType(t: string, lang: "en" | "es"): string {
  const en: Record<string, string> = {
    chain_link: "Chain link",
    wood_privacy: "Wood privacy",
    wood_picket: "Wood picket",
    vinyl: "Vinyl",
    aluminum: "Aluminum",
    wrought_iron: "Wrought iron",
    composite: "Composite",
  };
  const es: Record<string, string> = {
    chain_link: "Malla ciclónica",
    wood_privacy: "Privacidad de madera",
    wood_picket: "Estacas de madera",
    vinyl: "Vinilo",
    aluminum: "Aluminio",
    wrought_iron: "Hierro forjado",
    composite: "Compuesto",
  };
  return (lang === "es" ? es[t] : en[t]) ?? t;
}
