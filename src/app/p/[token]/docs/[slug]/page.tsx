// Public per-document signing page. Reached after the customer signs the
// estimate. Shows the form name + a brief description, lets them fill in
// any human-prompted fields (Sunshine ticket #, requested height, etc.),
// then sign with the canvas pad. Submits via signPermitDocumentByOwner.

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getTemplate, type PermitDocField } from "@/lib/permitDocs";
import { parseFieldMappings } from "@/lib/hoaTemplates";
import { pickLang } from "@/lib/i18n";
import { PermitDocSignForm } from "@/components/PermitDocSignForm";

export const dynamic = "force-dynamic";

export default async function PermitDocSignPage(
  props: PageProps<"/p/[token]/docs/[slug]">,
) {
  const { token, slug } = await props.params;
  const sp = await props.searchParams;
  const lang = pickLang(sp?.lang);

  const estimate = await db.estimate.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      number: true,
      client: { select: { name: true } },
      user: { select: { companyName: true, name: true, email: true } },
      documents: {
        where: { templateSlug: slug },
        take: 1,
      },
    },
  });
  if (!estimate) notFound();
  const document = estimate.documents[0];
  if (!document) notFound();

  // For built-in permit templates, look up the static template registry.
  // For HOA applications, build a virtual template shim from the per-user
  // HoaApplicationTemplate row so the same signing UI renders both.
  let displayName: string;
  let displayDescription: string;
  let blankFormHref: string | null;
  let promptedFields: PermitDocField[];
  let requiresNotarization = false;

  if (slug === "hoa_application") {
    if (!document.hoaTemplateId) notFound();
    const hoaTemplate = await db.hoaApplicationTemplate.findUnique({
      where: { id: document.hoaTemplateId },
      select: { name: true, fieldMappings: true },
    });
    if (!hoaTemplate) notFound();
    displayName = hoaTemplate.name;
    displayDescription =
      "HOA / ARC application — auto-filled from your fence project. Review, complete any open fields, and sign.";
    blankFormHref = null;
    const mappings = parseFieldMappings(hoaTemplate.fieldMappings);
    // Fields with no defaultFrom and no staticValue are presented to the
    // signer for manual entry. Skip checkboxes — those rarely make sense
    // as free-text inputs.
    promptedFields = mappings
      .filter((m) => !m.defaultFrom && !m.staticValue && m.kind !== "checkbox")
      .map((m) => ({
        formFieldName: m.formFieldName,
        kind: m.kind,
        label: m.label ?? m.formFieldName,
        promptHuman: true,
      }));
  } else {
    const template = getTemplate(slug);
    if (!template) notFound();
    displayName = template.name;
    displayDescription = template.description;
    blankFormHref = `/forms/${template.sourcePdfFilename}`;
    promptedFields = template.fields.filter((f) => f.promptHuman);
    requiresNotarization = Boolean(template.requiresNotarization);
  }

  const initialFieldValues: Record<string, string> = document.fieldValues
    ? (JSON.parse(document.fieldValues) as Record<string, string>)
    : {};

  const alreadySigned = Boolean(document.ownerSignedAt);

  return (
    <div className="min-h-screen bg-paper text-text-strong">
      <style>{`header.no-print { display: none !important; }
                main { padding: 0 !important; max-width: none !important; }`}</style>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <article className="bg-white rounded-lg border border-line overflow-hidden">
          <header className="bg-ink text-paper px-6 py-5">
            <div className="text-xs uppercase tracking-wider opacity-70">
              {lang === "es"
                ? "Documento del paquete de permiso"
                : "Permit packet document"}
            </div>
            <h1
              className="mt-1"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.005em",
                fontSize: "var(--text-xl)",
                lineHeight: 1.1,
              }}
            >
              {displayName}
            </h1>
            <div className="text-sm opacity-80 mt-2">
              {estimate.number} · {estimate.client.name}
            </div>
          </header>

          <div className="p-6 space-y-6">
            <p className="text-sm text-slate-700 leading-relaxed">
              {displayDescription}
            </p>

            {requiresNotarization && (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span className="font-semibold">
                  {lang === "es" ? "Importante: " : "Important: "}
                </span>
                {lang === "es"
                  ? "El Condado de Miami-Dade exige que esta declaración jurada sea NOTARIADA. La firma electrónica capturada aquí prepara el formulario pero no reemplaza la notarización — firme el documento impreso ante un notario público (o use un notario en línea aprobado por Florida) antes de presentarlo con su solicitud de permiso."
                  : "Miami-Dade County requires this affidavit to be NOTARIZED. The electronic signature captured here prepares the form but does not replace notarization — sign the printed document before a notary public (or use a Florida-approved online notary) before submitting it with your permit application."}
              </div>
            )}

            {blankFormHref && (
              <div className="rounded border border-line bg-slate-50 p-4 text-sm">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                  {lang === "es" ? "Vista previa del formulario" : "Form preview"}
                </div>
                <a
                  href={blankFormHref}
                  target="_blank"
                  rel="noopener"
                  className="text-brand font-semibold hover:underline"
                >
                  {lang === "es"
                    ? "Abrir el formulario en blanco (PDF)"
                    : "Open the blank form (PDF)"}{" "}
                  ↗
                </a>
                <div className="text-xs text-slate-500 mt-1">
                  {lang === "es"
                    ? "Después de firmar, recibirá una copia ejecutada de este formulario."
                    : "Once signed, you'll receive an executed copy of this form."}
                </div>
              </div>
            )}

            {alreadySigned ? (
              <SignedReceipt
                lang={lang}
                signedByName={document.ownerSignedByName ?? "—"}
                signedAt={document.ownerSignedAt!}
                signatureDataUrl={document.ownerSignatureDataUrl}
              />
            ) : (
              <PermitDocSignForm
                token={token}
                documentId={document.id}
                promptedFields={promptedFields}
                initialFieldValues={initialFieldValues}
                lang={lang}
              />
            )}

            <div className="pt-4 border-t border-line">
              <Link
                href={`/p/${token}`}
                className="text-sm text-brand hover:text-ink font-semibold"
              >
                ←{" "}
                {lang === "es"
                  ? "Volver al estimado"
                  : "Back to your estimate"}
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

function SignedReceipt({
  lang,
  signedByName,
  signedAt,
  signatureDataUrl,
}: {
  lang: "en" | "es";
  signedByName: string;
  signedAt: Date;
  signatureDataUrl: string | null;
}) {
  const when = new Date(signedAt).toLocaleString(
    lang === "es" ? "es-US" : "en-US",
    { dateStyle: "long", timeStyle: "short" },
  );
  return (
    <div
      className="rounded-md border-2 border-ink p-5"
      style={{ background: "var(--brand-soft)" }}
    >
      <div className="h-card text-ink">
        {lang === "es" ? "Firmado y enviado" : "Signed and submitted"}
      </div>
      {signatureDataUrl && (
        <div className="bg-white rounded border border-line p-3 inline-block mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signatureDataUrl} alt="" className="max-h-32 block" />
        </div>
      )}
      <div className="text-xs text-slate-600 mt-3">
        {lang === "es" ? "Firmado por" : "Signed by"}{" "}
        <span className="font-semibold text-ink">{signedByName}</span>{" "}
        {lang === "es" ? "el" : "on"} {when}.
      </div>
    </div>
  );
}
