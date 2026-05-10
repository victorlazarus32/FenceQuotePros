"use server";

// Server actions for the permit-document signing workflow.
//
// Lifecycle:
//   1. Customer signs the estimate (or contractor manually triggers) →
//      enqueuePermitDocs() picks the applicable templates and creates an
//      EstimateDocument row per template, pre-populated with field values
//      from the estimate context.
//   2. Customer signs each doc on /p/<token>/docs/<slug> →
//      signPermitDocumentByOwner().
//   3. Contractor signs each doc that requires it from the estimate detail
//      page → contractorSignPermitDocument(). Uses the saved signature
//      from User.signatureDataUrl by default.
//   4. When both required signatures land, the PDF is rendered via
//      renderExecutedPdf() and the resulting key is stored on the row.

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import {
  renderExecutedPdf,
  renderExecutedHoaApplication,
} from "@/lib/permitDocPdf";
import {
  buildInitialFieldValues,
  fieldKey,
  getTemplate,
  pickApplicableTemplates,
  type EstimateRenderContext,
  type PermitDocTemplate,
} from "@/lib/permitDocs";
import {
  buildHoaInitialFieldValues,
  parseFieldMappings,
} from "@/lib/hoaTemplates";

// ── Helpers ──────────────────────────────────────────────────────────────

function buildEstimateRenderContext(estimate: {
  totalCents: number;
  permitValueOfWorkCents: number | null;
  client: {
    name: string;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    phone: string | null;
    folioNumber: string | null;
  };
  user: {
    name: string | null;
    companyName: string | null;
    email: string;
    phone: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    licenseNumber: string | null;
    qualifierLast4: string | null;
  };
  fenceJobs: Array<{
    fenceType: string;
    heightFeet: number;
    linearFeet: number;
  }>;
}): EstimateRenderContext {
  const c = estimate.client;
  const u = estimate.user;
  const job = estimate.fenceJobs[0];
  const valueCents = estimate.permitValueOfWorkCents ?? estimate.totalCents;
  const valueDollars = (valueCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const workDescription = job
    ? `Install ${job.heightFeet}' ${formatFenceType(job.fenceType)} fence — ${job.linearFeet} LF`
    : "Fence installation";
  return {
    jobAddressLine1: c.addressLine1 ?? "",
    jobAddressLine2: [c.city, c.state, c.zip].filter(Boolean).join(", "),
    jobAddressFull: [c.addressLine1, c.city, c.state, c.zip]
      .filter(Boolean)
      .join(", "),
    jobFolio: c.folioNumber ?? "",
    ownerName: c.name,
    ownerAddress: c.addressLine1 ?? "",
    ownerCity: c.city ?? "",
    ownerState: c.state ?? "",
    ownerZip: c.zip ?? "",
    ownerPhone: c.phone ?? "",
    contractorName: u.name ?? u.email,
    contractorCompanyName: u.companyName ?? u.name ?? u.email,
    contractorLicenseNumber: u.licenseNumber ?? "",
    contractorQualifierLast4: u.qualifierLast4 ?? "",
    contractorAddress: u.addressLine1 ?? "",
    contractorCity: u.city ?? "",
    contractorState: u.state ?? "",
    contractorZip: u.zip ?? "",
    contractorPhone: u.phone ?? "",
    workDescription,
    valueOfWorkDisplay: valueDollars,
    currentUseOfProperty: "Single family residential",
    triggeredAt: new Date(),
  };
}

function formatFenceType(slug: string): string {
  const t = slug.replace(/_/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function appliesContextFromEstimate(estimate: {
  fenceJobs: Array<{
    fenceType: string;
    heightFeet: number;
    finishedSide: string | null;
    permitRequired: boolean;
  }>;
}) {
  const job = estimate.fenceJobs[0];
  return {
    fenceType: job?.fenceType ?? "",
    heightFeet: job?.heightFeet ?? 0,
    finishedSide: job?.finishedSide ?? null,
    permitRequired: job?.permitRequired ?? false,
    jurisdictionCounty: "miami_dade" as const,
  };
}

async function recordRequestSignature(): Promise<{
  ipAddress: string | null;
  userAgent: string | null;
}> {
  try {
    const h = await headers();
    return {
      ipAddress:
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        h.get("x-real-ip") ??
        null,
      userAgent: h.get("user-agent") ?? null,
    };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

// Unified template info for either a hardcoded permit template or a per-user
// HOA application template. Used by the signing actions so they don't have
// to branch on slug at every step.
interface DocTemplateInfo {
  displayName: string;
  requiresOwnerSignature: boolean;
  requiresContractorSignature: boolean;
  slugForRevalidate: string;
}

async function loadDocTemplateInfo(doc: {
  templateSlug: string;
  hoaTemplateId: string | null;
}): Promise<DocTemplateInfo | null> {
  if (doc.templateSlug === "hoa_application") {
    if (!doc.hoaTemplateId) return null;
    const t = await db.hoaApplicationTemplate.findUnique({
      where: { id: doc.hoaTemplateId },
      select: {
        name: true,
        requiresOwnerSignature: true,
        requiresContractorSignature: true,
      },
    });
    if (!t) return null;
    return {
      displayName: t.name,
      requiresOwnerSignature: t.requiresOwnerSignature,
      requiresContractorSignature: t.requiresContractorSignature,
      slugForRevalidate: "hoa_application",
    };
  }
  const t = getTemplate(doc.templateSlug);
  if (!t) return null;
  return {
    displayName: t.name,
    requiresOwnerSignature: t.requiresOwnerSignature,
    requiresContractorSignature: t.requiresContractorSignature,
    slugForRevalidate: t.slug,
  };
}

async function maybeRenderPdf(documentId: string): Promise<void> {
  const doc = await db.estimateDocument.findUnique({
    where: { id: documentId },
  });
  if (!doc) return;

  if (doc.templateSlug === "hoa_application") {
    await maybeRenderHoaPdf(doc);
    return;
  }

  const template = getTemplate(doc.templateSlug);
  if (!template) return;

  const ownerSatisfied = template.requiresOwnerSignature
    ? Boolean(doc.ownerSignatureDataUrl)
    : true;
  const contractorSatisfied = template.requiresContractorSignature
    ? Boolean(doc.contractorSignatureDataUrl)
    : true;
  if (!ownerSatisfied || !contractorSatisfied) return;

  const fieldValues = doc.fieldValues
    ? (JSON.parse(doc.fieldValues) as Record<string, string>)
    : {};

  try {
    const generatedPdfKey = await renderExecutedPdf(
      doc.estimateId,
      doc.id,
      {
        template,
        fieldValues,
        ownerSignatureDataUrl: doc.ownerSignatureDataUrl,
        contractorSignatureDataUrl: doc.contractorSignatureDataUrl,
      },
    );
    await db.estimateDocument.update({
      where: { id: doc.id },
      data: {
        status: "completed",
        generatedPdfKey,
        generatedAt: new Date(),
      },
    });

    // Notify the contractor that the packet item is done.
    const estimate = await db.estimate.findUnique({
      where: { id: doc.estimateId },
      select: {
        userId: true,
        number: true,
        client: { select: { name: true } },
      },
    });
    if (estimate) {
      await db.notification.create({
        data: {
          userId: estimate.userId,
          kind: "permit_doc_completed",
          title: `Permit document ready: ${template.name}`,
          body: `${estimate.number} · ${estimate.client.name} · executed PDF available for download.`,
          estimateId: doc.estimateId,
          channels: "in_app",
        },
      });
    }
  } catch (err) {
    console.error("renderExecutedPdf failed", err);
    // Mark the document so it doesn't claim to be completed on the UI.
    await db.estimateDocument.update({
      where: { id: doc.id },
      data: { status: "render_failed" },
    });
  }
}

// HOA application: same lifecycle as a permit doc but the template + source
// PDF live in the database / object storage rather than being shipped with
// the codebase.
async function maybeRenderHoaPdf(
  doc: {
    id: string;
    estimateId: string;
    hoaTemplateId: string | null;
    fieldValues: string | null;
    ownerSignatureDataUrl: string | null;
    contractorSignatureDataUrl: string | null;
  },
): Promise<void> {
  if (!doc.hoaTemplateId) return;
  const template = await db.hoaApplicationTemplate.findUnique({
    where: { id: doc.hoaTemplateId },
  });
  if (!template) return;

  const ownerSatisfied = template.requiresOwnerSignature
    ? Boolean(doc.ownerSignatureDataUrl)
    : true;
  const contractorSatisfied = template.requiresContractorSignature
    ? Boolean(doc.contractorSignatureDataUrl)
    : true;
  if (!ownerSatisfied || !contractorSatisfied) return;

  const fieldValues = doc.fieldValues
    ? (JSON.parse(doc.fieldValues) as Record<string, string>)
    : {};
  const mappings = parseFieldMappings(template.fieldMappings);

  try {
    const generatedPdfKey = await renderExecutedHoaApplication({
      estimateId: doc.estimateId,
      documentId: doc.id,
      templateId: template.id,
      templateName: template.name,
      pdfStorageKey: template.pdfStorageKey,
      mappings,
      fieldValues,
      ownerSignatureFieldName: template.ownerSignatureFieldName,
      contractorSignatureFieldName: template.contractorSignatureFieldName,
      ownerSignatureDataUrl: doc.ownerSignatureDataUrl,
      contractorSignatureDataUrl: doc.contractorSignatureDataUrl,
    });
    await db.estimateDocument.update({
      where: { id: doc.id },
      data: {
        status: "completed",
        generatedPdfKey,
        generatedAt: new Date(),
      },
    });

    const estimate = await db.estimate.findUnique({
      where: { id: doc.estimateId },
      select: {
        userId: true,
        number: true,
        client: { select: { name: true } },
      },
    });
    if (estimate) {
      await db.notification.create({
        data: {
          userId: estimate.userId,
          kind: "permit_doc_completed",
          title: `HOA application ready: ${template.name}`,
          body: `${estimate.number} · ${estimate.client.name} · executed PDF available for download.`,
          estimateId: doc.estimateId,
          channels: "in_app",
        },
      });
    }
  } catch (err) {
    console.error("renderExecutedHoaApplication failed", err);
    await db.estimateDocument.update({
      where: { id: doc.id },
      data: { status: "render_failed" },
    });
  }
}

// ── enqueuePermitDocs ────────────────────────────────────────────────────

export async function enqueuePermitDocs(estimateId: string): Promise<{
  ok: boolean;
  enqueued: string[];
  message?: string;
}> {
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    include: { client: true, user: true, fenceJobs: true },
  });
  if (!estimate) return { ok: false, enqueued: [], message: "Estimate not found." };

  const ctx = buildEstimateRenderContext(estimate);
  const applicable = pickApplicableTemplates(appliesContextFromEstimate(estimate));

  const enqueued: string[] = [];
  for (const template of applicable) {
    const fieldValues = buildInitialFieldValues(template, ctx);
    // Upsert so re-triggering is idempotent and never blows away existing
    // signatures on a doc that's already been signed.
    const existing = await db.estimateDocument.findUnique({
      where: {
        estimateId_templateSlug: {
          estimateId: estimate.id,
          templateSlug: template.slug,
        },
      },
    });
    if (!existing) {
      await db.estimateDocument.create({
        data: {
          estimateId: estimate.id,
          templateSlug: template.slug,
          fieldValues: JSON.stringify(fieldValues),
          status: "pending",
        },
      });
      enqueued.push(template.slug);
    }
  }

  // HOA application: if the client is in an HOA with an assigned template,
  // enqueue a filled application alongside the permit packet.
  if (estimate.client.hoaRequired && estimate.client.hoaTemplateId) {
    const hoaTemplate = await db.hoaApplicationTemplate.findUnique({
      where: { id: estimate.client.hoaTemplateId },
    });
    if (hoaTemplate && hoaTemplate.userId === estimate.userId) {
      const mappings = parseFieldMappings(hoaTemplate.fieldMappings);
      const hoaFieldValues = buildHoaInitialFieldValues(mappings, ctx, {
        hoaName: estimate.client.hoaName,
        hoaContactName: estimate.client.hoaContactName,
      });
      const existingHoa = await db.estimateDocument.findUnique({
        where: {
          estimateId_templateSlug: {
            estimateId: estimate.id,
            templateSlug: "hoa_application",
          },
        },
      });
      if (!existingHoa) {
        await db.estimateDocument.create({
          data: {
            estimateId: estimate.id,
            templateSlug: "hoa_application",
            hoaTemplateId: hoaTemplate.id,
            fieldValues: JSON.stringify(hoaFieldValues),
            status: "pending",
          },
        });
        enqueued.push("hoa_application");
      }
    }
  }

  await db.estimate.update({
    where: { id: estimate.id },
    data: { permitDocsTriggeredAt: new Date() },
  });

  if (enqueued.length > 0) {
    await db.notification.create({
      data: {
        userId: estimate.userId,
        kind: "permit_docs_queued",
        title: `${enqueued.length} permit document${enqueued.length === 1 ? "" : "s"} ready for signature`,
        body: `${estimate.number} · ${estimate.client.name} — sent for client signature.`,
        estimateId: estimate.id,
        channels: "in_app",
      },
    });
  }

  revalidatePath(`/estimates/${estimate.id}`);
  return { ok: true, enqueued };
}

// ── triggerPermitDocsManually (contractor-side button) ──────────────────

export async function triggerPermitDocsManually(
  estimateId: string,
): Promise<void> {
  const userId = await getCurrentUserId();
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    select: { userId: true, shareToken: true },
  });
  if (!estimate || estimate.userId !== userId) return;
  await enqueuePermitDocs(estimateId);
  if (estimate.shareToken) {
    revalidatePath(`/p/${estimate.shareToken}`);
  }
}

// ── setPermitValueOfWork ────────────────────────────────────────────────
// Override for the "Value of Work" line on the MDC permit application.
// `dollars` is a string from a form input (could include "$" or commas).
// Pass an empty string to clear the override and fall back to the
// estimate total.

export async function setPermitValueOfWork(
  estimateId: string,
  dollarsInput: string,
): Promise<{ ok: boolean; message?: string }> {
  const userId = await getCurrentUserId();
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    select: { userId: true },
  });
  if (!estimate || estimate.userId !== userId) {
    return { ok: false, message: "Not authorized." };
  }

  const trimmed = dollarsInput.trim();
  if (trimmed === "") {
    await db.estimate.update({
      where: { id: estimateId },
      data: { permitValueOfWorkCents: null },
    });
    revalidatePath(`/estimates/${estimateId}`);
    return { ok: true };
  }

  const cleaned = trimmed.replace(/[$,\s]/g, "");
  const dollars = Number(cleaned);
  if (!Number.isFinite(dollars) || dollars < 0) {
    return { ok: false, message: "Enter a positive dollar amount." };
  }
  const cents = Math.round(dollars * 100);
  await db.estimate.update({
    where: { id: estimateId },
    data: { permitValueOfWorkCents: cents },
  });
  revalidatePath(`/estimates/${estimateId}`);
  return { ok: true };
}

// ── togglePermitAutoTrigger ─────────────────────────────────────────────

export async function togglePermitAutoTrigger(
  estimateId: string,
  on: boolean,
): Promise<void> {
  const userId = await getCurrentUserId();
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    select: { userId: true },
  });
  if (!estimate || estimate.userId !== userId) return;
  await db.estimate.update({
    where: { id: estimateId },
    data: { permitDocsAutoTrigger: on },
  });
  revalidatePath(`/estimates/${estimateId}`);
}

// ── signPermitDocumentByOwner (public route) ─────────────────────────────

const OwnerSignSchema = z.object({
  token: z.string().min(8),
  documentId: z.string().min(1),
  signatureDataUrl: z
    .string()
    .startsWith("data:image/png;base64,", "Signature must be a PNG data URL.")
    .max(2_000_000),
  signedByName: z.string().trim().min(2).max(120),
  fieldValues: z.string().optional(), // JSON-encoded overrides (Sunshine ticket etc.)
});

export type OwnerSignDocState = {
  ok?: boolean;
  message?: string;
};

export async function signPermitDocumentByOwner(
  _prev: OwnerSignDocState,
  formData: FormData,
): Promise<OwnerSignDocState> {
  const parsed = OwnerSignSchema.safeParse({
    token: formData.get("token"),
    documentId: formData.get("documentId"),
    signatureDataUrl: formData.get("signatureDataUrl"),
    signedByName: formData.get("signedByName"),
    fieldValues: formData.get("fieldValues") ?? undefined,
  });
  if (!parsed.success) {
    return {
      message:
        parsed.error.issues[0]?.message ?? "Couldn't read your signature.",
    };
  }
  const { token, documentId, signatureDataUrl, signedByName, fieldValues } =
    parsed.data;

  const document = await db.estimateDocument.findUnique({
    where: { id: documentId },
    include: {
      estimate: { select: { id: true, shareToken: true, userId: true } },
    },
  });
  if (!document) return { message: "Document not found." };
  if (document.estimate.shareToken !== token) {
    return { message: "Document does not belong to this estimate." };
  }
  if (document.ownerSignedAt) {
    return { message: "This document has already been signed." };
  }

  const info = await loadDocTemplateInfo(document);
  if (!info) return { message: "Unknown document template." };

  // Merge any human-entered field values on top of the prefill.
  let mergedFields: Record<string, string> = document.fieldValues
    ? (JSON.parse(document.fieldValues) as Record<string, string>)
    : {};
  if (fieldValues) {
    try {
      const parsedFields = JSON.parse(fieldValues) as Record<string, string>;
      mergedFields = { ...mergedFields, ...parsedFields };
    } catch {
      // ignore malformed override; keep prefill
    }
  }

  const meta = await recordRequestSignature();

  await db.estimateDocument.update({
    where: { id: document.id },
    data: {
      fieldValues: JSON.stringify(mergedFields),
      ownerSignedAt: new Date(),
      ownerSignatureDataUrl: signatureDataUrl,
      ownerSignedByName: signedByName,
      ownerSignedIp: meta.ipAddress,
      ownerSignedUserAgent: meta.userAgent,
      status: "owner_signed",
    },
  });

  await db.notification.create({
    data: {
      userId: document.estimate.userId,
      kind: "permit_doc_owner_signed",
      title: `Customer signed: ${info.displayName}`,
      body: `Signed by ${signedByName}.`,
      estimateId: document.estimate.id,
      channels: "in_app",
    },
  });

  await maybeRenderPdf(document.id);

  revalidatePath(`/p/${token}`);
  revalidatePath(`/p/${token}/docs/${info.slugForRevalidate}`);
  revalidatePath(`/estimates/${document.estimate.id}`);
  return { ok: true };
}

// ── contractorSignPermitDocument (server-side) ──────────────────────────

export async function contractorSignPermitDocument(
  documentId: string,
): Promise<{ ok: boolean; message?: string }> {
  const userId = await getCurrentUserId();
  const document = await db.estimateDocument.findUnique({
    where: { id: documentId },
    include: { estimate: { select: { id: true, userId: true, shareToken: true } } },
  });
  if (!document || document.estimate.userId !== userId) {
    return { ok: false, message: "Not authorized." };
  }
  if (document.contractorSignedAt) {
    return { ok: false, message: "Already signed." };
  }
  const info = await loadDocTemplateInfo(document);
  if (!info) return { ok: false, message: "Unknown template." };
  if (!info.requiresContractorSignature) {
    return { ok: false, message: "This document does not need a contractor signature." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { signatureDataUrl: true, signatureName: true, name: true, companyName: true },
  });
  if (!user?.signatureDataUrl) {
    return {
      ok: false,
      message:
        "Save a signature on your profile first — it'll be reused across permit docs.",
    };
  }

  await db.estimateDocument.update({
    where: { id: documentId },
    data: {
      contractorSignedAt: new Date(),
      contractorSignatureDataUrl: user.signatureDataUrl,
      contractorSignedByName:
        user.signatureName ?? user.name ?? user.companyName ?? "",
      // Status stays owner_signed if owner already signed; maybeRenderPdf
      // flips to "completed" once both sigs are in.
    },
  });

  await maybeRenderPdf(documentId);

  revalidatePath(`/estimates/${document.estimate.id}`);
  if (document.estimate.shareToken) {
    revalidatePath(`/p/${document.estimate.shareToken}`);
  }
  return { ok: true };
}

// ── demoCompletePermitPacket (DEV ONLY) ──────────────────────────────────
// One-click full-cycle test. Enqueues the applicable docs (if not done),
// stamps placeholder owner + contractor signatures, fills any prompted
// fields with sample values, and renders every PDF. Surfaces in the
// contractor's permit-doc panel only when NODE_ENV !== "production".

const SAMPLE_PROMPT_VALUES: Record<string, string> = {
  sunshineTicket: "DEMO-1234567",
  sunshineDate: new Date().toISOString().slice(0, 10),
  requestedHeight: "8",
  ownerName: "Test Neighbor",
};

export async function demoCompletePermitPacket(
  estimateId: string,
): Promise<{ ok: boolean; message?: string }> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, message: "Demo mode disabled in production." };
  }

  const userId = await getCurrentUserId();
  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    select: { userId: true },
  });
  if (!estimate || estimate.userId !== userId) {
    return { ok: false, message: "Not authorized." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { signatureDataUrl: true, signatureName: true, name: true },
  });
  if (!user?.signatureDataUrl) {
    return {
      ok: false,
      message:
        "Save a signature on /profile first — the demo reuses it for both owner and contractor.",
    };
  }

  // Make sure documents exist (idempotent — won't re-create or overwrite
  // any docs that have already been signed).
  await enqueuePermitDocs(estimateId);

  const docs = await db.estimateDocument.findMany({
    where: { estimateId },
  });
  if (docs.length === 0) {
    return {
      ok: false,
      message:
        "No permit documents apply to this estimate. Make sure permitRequired is on the fence job.",
    };
  }

  for (const doc of docs) {
    const template = getTemplate(doc.templateSlug);
    if (!template) continue;

    // Merge sample values for any prompted fields, alongside whatever's
    // already prefilled.
    const existing = doc.fieldValues
      ? (JSON.parse(doc.fieldValues) as Record<string, string>)
      : {};
    const sampleOverrides: Record<string, string> = {};
    for (const f of template.fields) {
      const k = fieldKey(f);
      if (f.promptHuman && SAMPLE_PROMPT_VALUES[k] && !existing[k]) {
        sampleOverrides[k] = SAMPLE_PROMPT_VALUES[k];
      }
    }
    const merged = { ...existing, ...sampleOverrides };

    await db.estimateDocument.update({
      where: { id: doc.id },
      data: {
        fieldValues: JSON.stringify(merged),
        ownerSignedAt: doc.ownerSignedAt ?? new Date(),
        ownerSignatureDataUrl:
          doc.ownerSignatureDataUrl ?? user.signatureDataUrl,
        ownerSignedByName: doc.ownerSignedByName ?? "Test Customer",
        ownerSignedIp: doc.ownerSignedIp ?? "127.0.0.1",
        ownerSignedUserAgent: doc.ownerSignedUserAgent ?? "demo-mode",
        contractorSignedAt:
          template.requiresContractorSignature
            ? (doc.contractorSignedAt ?? new Date())
            : doc.contractorSignedAt,
        contractorSignatureDataUrl:
          template.requiresContractorSignature
            ? (doc.contractorSignatureDataUrl ?? user.signatureDataUrl)
            : doc.contractorSignatureDataUrl,
        contractorSignedByName:
          template.requiresContractorSignature
            ? (doc.contractorSignedByName ??
              user.signatureName ??
              user.name ??
              "Contractor")
            : doc.contractorSignedByName,
      },
    });

    await maybeRenderPdf(doc.id);
  }

  revalidatePath(`/estimates/${estimateId}`);
  return { ok: true };
}

// ── saveContractorSignature (profile) ───────────────────────────────────

const SaveSigSchema = z.object({
  signatureDataUrl: z
    .string()
    .startsWith("data:image/png;base64,")
    .max(2_000_000),
  signatureName: z.string().trim().min(2).max(120),
});

export type SaveSigState = { ok?: boolean; message?: string };

export async function saveContractorSignature(
  _prev: SaveSigState,
  formData: FormData,
): Promise<SaveSigState> {
  const userId = await getCurrentUserId();
  const parsed = SaveSigSchema.safeParse({
    signatureDataUrl: formData.get("signatureDataUrl"),
    signatureName: formData.get("signatureName"),
  });
  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Couldn't save signature.",
    };
  }
  await db.user.update({
    where: { id: userId },
    data: {
      signatureDataUrl: parsed.data.signatureDataUrl,
      signatureName: parsed.data.signatureName,
      signatureSavedAt: new Date(),
    },
  });
  revalidatePath("/profile");
  return { ok: true };
}

// ── saveContractorProfile (profile) ─────────────────────────────────────
// All the contractor-info fields that get stamped onto the MDC permit
// application's "Contractor Information" box. Saved once, reused on
// every fence permit packet generated.

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

const SaveProfileSchema = z.object({
  name: optionalString(120), // qualifier — individual contractor name
  companyName: optionalString(120), // contractor name on permit
  phone: optionalString(40),
  addressLine1: optionalString(160),
  city: optionalString(80),
  state: optionalString(20),
  zip: optionalString(20),
  licenseNumber: optionalString(60),
  qualifierLast4: optionalString(8),
});

export type SaveProfileState = { ok?: boolean; message?: string };

export async function saveContractorProfile(
  _prev: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  const userId = await getCurrentUserId();
  const parsed = SaveProfileSchema.safeParse({
    name: formData.get("name") ?? "",
    companyName: formData.get("companyName") ?? "",
    phone: formData.get("phone") ?? "",
    addressLine1: formData.get("addressLine1") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    zip: formData.get("zip") ?? "",
    licenseNumber: formData.get("licenseNumber") ?? "",
    qualifierLast4: formData.get("qualifierLast4") ?? "",
  });
  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Couldn't save profile.",
    };
  }
  await db.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name ?? null,
      companyName: parsed.data.companyName ?? null,
      phone: parsed.data.phone ?? null,
      addressLine1: parsed.data.addressLine1 ?? null,
      city: parsed.data.city ?? null,
      state: parsed.data.state ?? null,
      zip: parsed.data.zip ?? null,
      licenseNumber: parsed.data.licenseNumber ?? null,
      qualifierLast4: parsed.data.qualifierLast4 ?? null,
    },
  });
  revalidatePath("/profile");
  return { ok: true };
}
