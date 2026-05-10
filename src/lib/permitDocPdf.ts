// PDF renderer. Loads the source AcroForm-fillable PDF, fills each named
// text/checkbox/dropdown field via pdf-lib's form API (no pixel-level
// coordinate guessing), embeds the captured signatures into their named
// signature widgets, flattens the form so values bake in, and writes
// the result to whatever storage backend is configured (local FS in dev,
// Supabase Storage in production — see lib/storage.ts).

import { promises as fs } from "node:fs";
import { PDFDocument, type PDFPage } from "pdf-lib";
// fs is still used for reading the source AcroForm PDF from public/forms/
// (those ship in the repo). Generated outputs go through getStorage().
import {
  fieldKey,
  type PermitDocTemplate,
  type SignatureRole,
} from "@/lib/permitDocs";
import { getStorage, keys as storageKeys } from "@/lib/storage";
import type { HoaFieldMapping } from "@/lib/hoaTemplates";

export interface RenderInput {
  template: PermitDocTemplate;
  fieldValues: Record<string, string>;
  ownerSignatureDataUrl?: string | null;
  contractorSignatureDataUrl?: string | null;
}

export async function renderExecutedPdf(
  estimateId: string,
  documentId: string,
  input: RenderInput,
): Promise<string> {
  const { template, fieldValues, ownerSignatureDataUrl, contractorSignatureDataUrl } = input;

  const sourceBytes = await fs.readFile(template.sourcePdfPath);
  const pdfDoc = await PDFDocument.load(sourceBytes);
  const form = pdfDoc.getForm();

  // ── Fill text/checkbox/dropdown fields by name ──
  for (const f of template.fields) {
    const value = f.staticValue ?? fieldValues[fieldKey(f)];
    if (value === undefined || value === null || value === "") continue;
    const kind = f.kind ?? "text";
    try {
      if (kind === "text") {
        form.getTextField(f.formFieldName).setText(String(value));
      } else if (kind === "checkbox") {
        const truthy =
          value !== "false" && value !== "0" && value.length > 0;
        if (truthy) form.getCheckBox(f.formFieldName).check();
      } else if (kind === "dropdown") {
        // Source PDFs use OptionList for state / month dropdowns. Pdf-lib
        // surfaces those as either Dropdown or OptionList — try both.
        try {
          form.getDropdown(f.formFieldName).select(String(value));
        } catch {
          form.getOptionList(f.formFieldName).select(String(value));
        }
      }
    } catch (err) {
      // Field name doesn't match the source PDF — skip rather than crash.
      console.warn(
        `[permit-doc:${template.slug}] Could not set field "${f.formFieldName}" (${kind}): ${(err as Error).message}`,
      );
    }
  }

  // ── Embed signatures into named signature widgets ──
  const sigs: Array<[SignatureRole, string | null | undefined]> = [
    ["owner", ownerSignatureDataUrl],
    ["contractor", contractorSignatureDataUrl],
  ];
  for (const [role, dataUrl] of sigs) {
    if (!dataUrl) continue;
    const slot = template.signatures.find((s) => s.role === role);
    if (!slot) continue;
    const pngBytes = base64FromDataUrl(dataUrl);
    if (!pngBytes) continue;

    let placement: { page: PDFPage; x: number; y: number; width: number; height: number } | null = null;
    try {
      const sigField = form.getSignature(slot.formFieldName);
      const widget = sigField.acroField.getWidgets()[0];
      if (widget) {
        const rect = widget.getRectangle();
        const page = findWidgetPage(
          pdfDoc,
          widget as unknown as { dict: object },
        );
        if (page) {
          placement = {
            page,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
        }
      }
    } catch (err) {
      console.warn(
        `[permit-doc:${template.slug}] Signature field "${slot.formFieldName}" not found: ${(err as Error).message}`,
      );
    }
    if (!placement) continue;

    const png = await pdfDoc.embedPng(pngBytes);
    const scale = Math.min(
      placement.width / png.width,
      placement.height / png.height,
    );
    const w = png.width * scale;
    const h = png.height * scale;
    placement.page.drawImage(png, {
      x: placement.x + (placement.width - w) / 2,
      y: placement.y + (placement.height - h) / 2,
      width: w,
      height: h,
    });
  }

  // Flatten the form so the stamped values display in viewers that don't
  // understand AcroForm widgets, and so the document can't be edited
  // further by the recipient.
  try {
    form.flatten();
  } catch (err) {
    console.warn(
      `[permit-doc:${template.slug}] form.flatten() failed: ${(err as Error).message}`,
    );
  }

  const out = await pdfDoc.save();
  const key = storageKeys.permitDoc(estimateId, documentId, template.slug);
  await getStorage().put(key, Buffer.from(out), {
    contentType: "application/pdf",
  });
  return key;
}

function base64FromDataUrl(dataUrl: string): Uint8Array | null {
  const m = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!m) return null;
  return Buffer.from(m[1], "base64");
}

// HOA application templates are uploaded by the contractor (PDF lives in
// storage, not on disk shipped with the repo) and use a DB-driven field-
// mapping array rather than a hardcoded template. We share the fill / sign /
// flatten machinery via this helper.
export interface RenderHoaApplicationInput {
  estimateId: string;
  documentId: string;
  templateId: string;
  templateName: string;
  pdfStorageKey: string;
  mappings: HoaFieldMapping[];
  fieldValues: Record<string, string>;
  ownerSignatureFieldName: string | null;
  contractorSignatureFieldName: string | null;
  ownerSignatureDataUrl?: string | null;
  contractorSignatureDataUrl?: string | null;
}

export async function renderExecutedHoaApplication(
  input: RenderHoaApplicationInput,
): Promise<string> {
  const {
    estimateId,
    documentId,
    templateId,
    templateName,
    pdfStorageKey,
    mappings,
    fieldValues,
    ownerSignatureFieldName,
    contractorSignatureFieldName,
    ownerSignatureDataUrl,
    contractorSignatureDataUrl,
  } = input;

  const storage = getStorage();
  const sourceBytes = await storage.read(pdfStorageKey);
  const pdfDoc = await PDFDocument.load(sourceBytes);
  const form = pdfDoc.getForm();

  // Fill mapped fields
  for (const m of mappings) {
    const value = m.staticValue ?? fieldValues[m.formFieldName];
    if (value === undefined || value === null || value === "") continue;
    try {
      if (m.kind === "text") {
        form.getTextField(m.formFieldName).setText(String(value));
      } else if (m.kind === "checkbox") {
        const truthy = value !== "false" && value !== "0" && value.length > 0;
        if (truthy) form.getCheckBox(m.formFieldName).check();
      } else if (m.kind === "dropdown") {
        try {
          form.getDropdown(m.formFieldName).select(String(value));
        } catch {
          form.getOptionList(m.formFieldName).select(String(value));
        }
      }
    } catch (err) {
      console.warn(
        `[hoa-template:${templateName}] field "${m.formFieldName}" (${m.kind}): ${(err as Error).message}`,
      );
    }
  }

  // Embed signatures
  const sigPlacements: Array<[string | null, string | null | undefined]> = [
    [ownerSignatureFieldName, ownerSignatureDataUrl],
    [contractorSignatureFieldName, contractorSignatureDataUrl],
  ];
  for (const [fieldName, dataUrl] of sigPlacements) {
    if (!fieldName || !dataUrl) continue;
    const pngBytes = base64FromDataUrl(dataUrl);
    if (!pngBytes) continue;

    let placement: { page: PDFPage; x: number; y: number; width: number; height: number } | null = null;
    try {
      const sigField = form.getSignature(fieldName);
      const widget = sigField.acroField.getWidgets()[0];
      if (widget) {
        const rect = widget.getRectangle();
        const page = findWidgetPage(
          pdfDoc,
          widget as unknown as { dict: object },
        );
        if (page) {
          placement = {
            page,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
        }
      }
    } catch (err) {
      console.warn(
        `[hoa-template:${templateName}] signature "${fieldName}" not found: ${(err as Error).message}`,
      );
    }
    if (!placement) continue;

    const png = await pdfDoc.embedPng(pngBytes);
    const scale = Math.min(
      placement.width / png.width,
      placement.height / png.height,
    );
    const w = png.width * scale;
    const h = png.height * scale;
    placement.page.drawImage(png, {
      x: placement.x + (placement.width - w) / 2,
      y: placement.y + (placement.height - h) / 2,
      width: w,
      height: h,
    });
  }

  try {
    form.flatten();
  } catch (err) {
    console.warn(
      `[hoa-template:${templateName}] flatten failed: ${(err as Error).message}`,
    );
  }

  const out = await pdfDoc.save();
  const key = storageKeys.hoaApplicationDoc(estimateId, documentId, templateId);
  await storage.put(key, Buffer.from(out), {
    contentType: "application/pdf",
  });
  return key;
}

// Locate the page that a widget annotation lives on. Pdf-lib doesn't
// surface a direct page lookup on widgets — we walk each page's /Annots
// array, resolve any refs, and compare by underlying PDFDict reference.
function findWidgetPage(
  pdfDoc: PDFDocument,
  widget: { dict: object },
): PDFPage | null {
  const widgetDict = widget.dict;
  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i);
    const annots = page.node.Annots();
    if (!annots) continue;
    for (const ref of annots.asArray()) {
      const dict = pdfDoc.context.lookup(ref);
      if (dict === widgetDict) return page;
    }
  }
  return pdfDoc.getPage(0);
}
