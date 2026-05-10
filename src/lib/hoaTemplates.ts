// HOA application templates — per-user library of association-specific PDFs.
// Each HOA writes its own ARC application. The contractor uploads the source
// PDF once, this module extracts the AcroForm fields, and the contractor maps
// each field to a known data source from the estimate context (or marks it as
// human-input or static text). Filled docs are rendered through the shared
// permitDocPdf pipeline.

import { PDFDocument } from "pdf-lib";
import {
  type EstimateRenderContext,
  type FieldKind,
} from "@/lib/permitDocs";

// The same enum lib/permitDocs.ts uses, exposed here so the mapping editor
// can present a single dropdown of "what data should fill this field". Kept
// in sync manually — if permitDocs gains a new defaultFrom, add it here too.
export type HoaDefaultSource =
  | "jobAddressLine1"
  | "jobAddressLine2"
  | "jobAddressFull"
  | "jobFolio"
  | "ownerName"
  | "ownerAddress"
  | "ownerCity"
  | "ownerState"
  | "ownerZip"
  | "ownerPhone"
  | "ownerDateMonth"
  | "ownerDateDay"
  | "ownerDateYear"
  | "contractorName"
  | "contractorCompanyName"
  | "contractorLicenseNumber"
  | "contractorAddress"
  | "contractorCity"
  | "contractorState"
  | "contractorZip"
  | "contractorPhone"
  | "workDescription"
  | "valueOfWorkDisplay"
  | "currentMonth"
  | "currentDay"
  | "currentYear"
  | "hoaName"
  | "hoaContactName";

export const HOA_DEFAULT_SOURCE_LABELS: Record<HoaDefaultSource, string> = {
  jobAddressLine1: "Job address — street",
  jobAddressLine2: "Job address — city, state, zip",
  jobAddressFull: "Job address — full",
  jobFolio: "Folio / parcel number",
  ownerName: "Property owner name",
  ownerAddress: "Property owner street",
  ownerCity: "Property owner city",
  ownerState: "Property owner state",
  ownerZip: "Property owner zip",
  ownerPhone: "Property owner phone",
  ownerDateMonth: "Today — month (owner sign date)",
  ownerDateDay: "Today — day (owner sign date)",
  ownerDateYear: "Today — year (owner sign date)",
  contractorName: "Contractor name",
  contractorCompanyName: "Contractor company name",
  contractorLicenseNumber: "Contractor license number",
  contractorAddress: "Contractor street",
  contractorCity: "Contractor city",
  contractorState: "Contractor state",
  contractorZip: "Contractor zip",
  contractorPhone: "Contractor phone",
  workDescription: "Work description (auto-built)",
  valueOfWorkDisplay: "Value of work (formatted $)",
  currentMonth: "Today — month",
  currentDay: "Today — day",
  currentYear: "Today — year",
  hoaName: "HOA / association name",
  hoaContactName: "HOA contact name",
};

// One field's mapping in an HOA template. Stored as JSON in
// HoaApplicationTemplate.fieldMappings.
export interface HoaFieldMapping {
  formFieldName: string;
  kind: FieldKind;
  label?: string; // optional human label (overrides formFieldName in UI)
  defaultFrom?: HoaDefaultSource;
  staticValue?: string; // always-on stamped value (e.g. "yes" for a checkbox)
}

export interface ExtractedAcroFormField {
  formFieldName: string;
  kind: FieldKind;
}

export interface ExtractedPdfMeta {
  pageCount: number;
  fields: ExtractedAcroFormField[];
  signatureFieldNames: string[];
}

// Read an uploaded PDF, return its AcroForm shape so the contractor can map
// fields. Falls back to an empty fields[] if the PDF is flat (no AcroForm).
export async function extractAcroFormFields(
  pdfBytes: Buffer,
): Promise<ExtractedPdfMeta> {
  const doc = await PDFDocument.load(pdfBytes);
  const pageCount = doc.getPageCount();
  let fields: ExtractedAcroFormField[] = [];
  const signatureFieldNames: string[] = [];

  try {
    const form = doc.getForm();
    for (const f of form.getFields()) {
      const formFieldName = f.getName();
      const ctorName = f.constructor.name;
      let kind: FieldKind | "signature" = "text";
      if (ctorName === "PDFCheckBox") kind = "checkbox";
      else if (ctorName === "PDFDropdown" || ctorName === "PDFOptionList")
        kind = "dropdown";
      else if (ctorName === "PDFSignature") kind = "signature";

      if (kind === "signature") {
        signatureFieldNames.push(formFieldName);
      } else {
        fields.push({ formFieldName, kind });
      }
    }
  } catch {
    fields = [];
  }

  return { pageCount, fields, signatureFieldNames };
}

// Resolve a HoaDefaultSource against the estimate context. Mirrors the same
// logic as permitDocs.resolveDefault but kept separate so the source enums
// can diverge if they need to.
export function resolveHoaDefault(
  source: HoaDefaultSource,
  ctx: EstimateRenderContext,
  hoa: { hoaName: string | null; hoaContactName: string | null },
): string {
  switch (source) {
    case "jobAddressLine1":
      return ctx.jobAddressLine1;
    case "jobAddressLine2":
      return ctx.jobAddressLine2;
    case "jobAddressFull":
      return ctx.jobAddressFull;
    case "jobFolio":
      return ctx.jobFolio;
    case "ownerName":
      return ctx.ownerName;
    case "ownerAddress":
      return ctx.ownerAddress;
    case "ownerCity":
      return ctx.ownerCity;
    case "ownerState":
      return ctx.ownerState;
    case "ownerZip":
      return ctx.ownerZip;
    case "ownerPhone":
      return ctx.ownerPhone;
    case "ownerDateMonth":
    case "currentMonth":
      return String(ctx.triggeredAt.getMonth() + 1).padStart(2, "0");
    case "ownerDateDay":
    case "currentDay":
      return String(ctx.triggeredAt.getDate()).padStart(2, "0");
    case "ownerDateYear":
    case "currentYear":
      return String(ctx.triggeredAt.getFullYear());
    case "contractorName":
      return ctx.contractorName;
    case "contractorCompanyName":
      return ctx.contractorCompanyName;
    case "contractorLicenseNumber":
      return ctx.contractorLicenseNumber;
    case "contractorAddress":
      return ctx.contractorAddress;
    case "contractorCity":
      return ctx.contractorCity;
    case "contractorState":
      return ctx.contractorState;
    case "contractorZip":
      return ctx.contractorZip;
    case "contractorPhone":
      return ctx.contractorPhone;
    case "workDescription":
      return ctx.workDescription;
    case "valueOfWorkDisplay":
      return ctx.valueOfWorkDisplay;
    case "hoaName":
      return hoa.hoaName ?? "";
    case "hoaContactName":
      return hoa.hoaContactName ?? "";
  }
}

export function buildHoaInitialFieldValues(
  mappings: HoaFieldMapping[],
  ctx: EstimateRenderContext,
  hoa: { hoaName: string | null; hoaContactName: string | null },
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of mappings) {
    const k = f.formFieldName;
    if (f.staticValue) {
      out[k] = f.staticValue;
      continue;
    }
    if (!f.defaultFrom) continue;
    const v = resolveHoaDefault(f.defaultFrom, ctx, hoa);
    if (v) out[k] = v;
  }
  return out;
}

export function parseFieldMappings(
  raw: string | null | undefined,
): HoaFieldMapping[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is HoaFieldMapping =>
        m && typeof m.formFieldName === "string" && typeof m.kind === "string",
    );
  } catch {
    return [];
  }
}
