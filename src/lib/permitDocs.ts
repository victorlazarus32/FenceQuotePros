// Permit / compliance document templates. Code-defined registry of forms
// that get attached to a fence permit packet.
//
// All four MDC source PDFs are AcroForm-fillable, so we drive every field
// by its named widget rather than pixel coordinates — pdf-lib looks up
// `form.getTextField(name)` / `getCheckBox(name)` / `getDropdown(name)` and
// the PDF positions the value at its native field rect. Signatures use
// the named PDFSignature widget's rectangle for placement.

import path from "node:path";

export type PermitDocSlug =
  | "mdc_building_permit_application"
  | "mdc_fence_addendum"
  | "mdc_finished_side_affidavit"
  | "mdc_height_extension_affidavit";

export type SignatureRole = "owner" | "contractor";

export type FieldKind = "text" | "checkbox" | "dropdown";

export interface PermitDocField {
  /** Source-PDF AcroForm field name. Pdf-lib looks it up by exact match. */
  formFieldName: string;
  /** Widget kind. Defaults to "text". */
  kind?: FieldKind;
  /** Logical key for fieldValues storage. Defaults to formFieldName. */
  key?: string;
  /** Human label shown in the customer signing UI. */
  label: string;
  /** Resolve from estimate context at enqueue time. */
  defaultFrom?:
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
    | "ownerDateYearShort"
    | "contractorName"
    | "contractorCompanyName"
    | "contractorLicenseNumber"
    | "contractorQualifierLast4"
    | "contractorAddress"
    | "contractorCity"
    | "contractorState"
    | "contractorZip"
    | "contractorPhone"
    | "contractorDateMonth"
    | "contractorDateDay"
    | "contractorDateYear"
    | "contractorDateYearShort"
    | "workDescription"
    | "valueOfWorkDisplay"
    | "currentUseOfProperty"
    | "currentMonth"
    | "currentDay"
    | "currentYear"
    | "currentYearShort";
  /**
   * Always-on stamped value, regardless of fieldValues / human input.
   * For checkboxes: any non-empty / non-"false" value checks the box.
   * For text fields: the literal string is stamped.
   */
  staticValue?: string;
  /** Prompt the human filling out the form. */
  promptHuman?: boolean;
  /** Placeholder shown to the human. */
  placeholder?: string;
  /** Input widget on our signing UI. */
  inputType?: "text" | "date";
}

export interface SignatureSlot {
  /** Source-PDF AcroForm signature field name. */
  formFieldName: string;
  role: SignatureRole;
}

export interface PermitDocTemplate {
  slug: PermitDocSlug;
  name: string;
  description: string;
  sourcePdfPath: string;
  sourcePdfFilename: string;
  fields: PermitDocField[];
  signatures: SignatureSlot[];
  requiresOwnerSignature: boolean;
  requiresContractorSignature: boolean;
  /**
   * True for documents Miami-Dade requires to be NOTARIZED (the two
   * affidavits). The in-app drawn signature does NOT satisfy notarization —
   * the UI must show NOTARIZATION_DISCLAIMER wherever these are signed.
   */
  requiresNotarization?: boolean;
  appliesTo(ctx: PermitDocAppliesContext): boolean;
}

// Shown wherever a notarization-required affidavit is signed or downloaded.
// DRAFT language — flagged for attorney review before public launch; keep
// the substance (drawn signature ≠ notarized instrument) intact.
export const NOTARIZATION_DISCLAIMER =
  "Important: Miami-Dade County requires this affidavit to be NOTARIZED. " +
  "The electronic signature captured here prepares the form but does not " +
  "replace notarization — sign the printed document before a notary public " +
  "(or use a Florida-approved online notary) before submitting it with your " +
  "permit application.";

export interface PermitDocAppliesContext {
  fenceType: string;
  heightFeet: number;
  finishedSide?: string | null;
  jurisdictionCounty?: string | null;
  permitRequired: boolean;
}

const FORMS_DIR = path.join(process.cwd(), "public", "forms");

// ── MDC Building Permit Application (yellow form) ────────────────────────
// Source PDF has 200+ AcroForm fields. We fill the subset relevant to a
// fence permit and check the Building category checkbox + stamp "18" in
// the building category text field.
const MDC_BUILDING_PERMIT_APPLICATION: PermitDocTemplate = {
  slug: "mdc_building_permit_application",
  name: "Miami-Dade Building Permit Application (Fence)",
  description:
    "The yellow-form permit application. Auto-filled with property, owner, contractor, and scope data; owner + qualifier sign here.",
  sourcePdfPath: path.join(FORMS_DIR, "building-permit.pdf"),
  sourcePdfFilename: "building-permit.pdf",
  requiresOwnerSignature: true,
  requiresContractorSignature: true,
  fields: [
    // Location of Improvements
    { formFieldName: "Job Address", label: "Job Address", defaultFrom: "jobAddressLine1" },
    { formFieldName: "Folio", label: "Folio", defaultFrom: "jobFolio" },

    // Contractor Information
    { formFieldName: "Contractor No", label: "Contractor No.", defaultFrom: "contractorLicenseNumber" },
    {
      formFieldName: "Last four (4) digits of Qualifier No",
      label: "Last 4 of Qualifier No.",
      defaultFrom: "contractorQualifierLast4",
    },
    { formFieldName: "Contractor Name", label: "Contractor Name", defaultFrom: "contractorCompanyName" },
    { formFieldName: "Qualifier Name", label: "Qualifier Name", defaultFrom: "contractorName" },
    {
      formFieldName: "Address: Contractor Information",
      label: "Contractor Address",
      defaultFrom: "contractorAddress",
    },
    {
      formFieldName: "City: Contractor Information",
      label: "Contractor City",
      defaultFrom: "contractorCity",
    },
    {
      formFieldName: "State: Contractor Information",
      kind: "dropdown",
      label: "Contractor State",
      defaultFrom: "contractorState",
    },
    {
      formFieldName: "Zip: Contractor Information",
      label: "Contractor Zip",
      defaultFrom: "contractorZip",
    },

    // Type / scope
    {
      formFieldName: "Current use of property, line 1",
      label: "Current use of property",
      defaultFrom: "currentUseOfProperty",
    },
    {
      formFieldName: "Description of Work, line 1",
      label: "Description of Work",
      defaultFrom: "workDescription",
    },
    {
      formFieldName: "Value of Works",
      label: "Value of Work",
      defaultFrom: "valueOfWorkDisplay",
    },

    // Permit Type — Building category checkbox + "18" in the text slot
    {
      formFieldName: "Building Category",
      kind: "checkbox",
      label: "Building Category checkbox",
      staticValue: "X",
    },
    {
      formFieldName: "Building Category Text Field",
      label: "Building Category #",
      staticValue: "18",
    },

    // Owner (Property Owner's Information)
    { formFieldName: "Owner", label: "Owner Name", defaultFrom: "ownerName" },
    {
      formFieldName: "Address: Property Owner's Information",
      label: "Owner Address",
      defaultFrom: "ownerAddress",
    },
    {
      formFieldName: "City: Property Owner's Information",
      label: "Owner City",
      defaultFrom: "ownerCity",
    },
    {
      formFieldName: "State: Property Owner's Information",
      kind: "dropdown",
      label: "Owner State",
      defaultFrom: "ownerState",
    },
    {
      formFieldName: "Zip: Property Owner's Information",
      label: "Owner Zip",
      defaultFrom: "ownerZip",
    },
    {
      formFieldName: "Phone: Property Owner's Information",
      label: "Owner Phone",
      defaultFrom: "ownerPhone",
    },
    // Owner SSN-4: only stamped on owner-pulled permits, which we're not
    // handling here. Field name "Last four (4) digits of Owner's SSN" can
    // be wired with promptHuman: true if owner-builder mode lands later.

    // Bottom signature block — printed names
    {
      formFieldName: "Print: Signature of Owner or Owner’s Agent",
      label: "Owner Print Name",
      defaultFrom: "ownerName",
    },
    {
      formFieldName: "Print: Signature of Qualifier",
      label: "Qualifier Print Name",
      defaultFrom: "contractorName",
    },

    // Date (M / D / YY) for owner sig + qualifier sig
    {
      formFieldName: "Type the day: Signature of Owner or Owner’s Agent",
      label: "Owner sig — day",
      defaultFrom: "ownerDateDay",
    },
    {
      formFieldName: "Select month: Signature of Owner or Owner’s Agent",
      kind: "dropdown",
      label: "Owner sig — month",
      defaultFrom: "ownerDateMonth",
    },
    {
      formFieldName: "Type two last digits year: Signature of Owner or Owner’s Agent",
      label: "Owner sig — year (2-digit)",
      defaultFrom: "ownerDateYearShort",
    },
    {
      formFieldName: "Type the day: Signature of Qualifier",
      label: "Qualifier sig — day",
      defaultFrom: "contractorDateDay",
    },
    {
      formFieldName: "Select month: Signature of Qualifier",
      kind: "dropdown",
      label: "Qualifier sig — month",
      defaultFrom: "contractorDateMonth",
    },
    {
      formFieldName: "Type two last digits year: Signature of Qualifier",
      label: "Qualifier sig — year (2-digit)",
      defaultFrom: "contractorDateYearShort",
    },
    // "By: Signature of Owner..." → typed name on the "by" line under sig
    {
      formFieldName: "By: Signature of Owner or Owner’s Agent",
      label: "By (Owner)",
      defaultFrom: "ownerName",
    },
    {
      formFieldName: "By: Signature of Qualifier",
      label: "By (Qualifier)",
      defaultFrom: "contractorName",
    },
  ],
  signatures: [
    {
      formFieldName: "Signature of Owner or Owner's Agent",
      role: "owner",
    },
    { formFieldName: "Signature of Qualifier", role: "contractor" },
  ],
  appliesTo: (ctx) =>
    ctx.permitRequired &&
    (ctx.jurisdictionCounty ?? "miami_dade") === "miami_dade",
};

// ── MDC Fence Addendum (Sec. 33-11 courtesy notice) ──────────────────────
// 15 form fields. Names are messy in the source ("undefined", "Date",
// "undefined_2", etc.), but rect order tells us which is which:
//   undefined   [449,115] = month
//   Date        [497,115] = day
//   undefined_2 [540,115] = year (2-digit)
const MDC_FENCE_ADDENDUM: PermitDocTemplate = {
  slug: "mdc_fence_addendum",
  name: "Miami-Dade Fence Permit Addendum (Sec. 33-11)",
  description:
    "Mandatory courtesy notice acknowledging finished-side, safe-sight-triangle, and easement rules. Signed by owner and contractor.",
  sourcePdfPath: path.join(FORMS_DIR, "fence-addendum.pdf"),
  sourcePdfFilename: "fence-addendum.pdf",
  requiresOwnerSignature: true,
  requiresContractorSignature: true,
  fields: [
    { formFieldName: "Job Address 1", label: "Job Address — line 1", defaultFrom: "jobAddressLine1" },
    { formFieldName: "Job Address 2", label: "Job Address — line 2", defaultFrom: "jobAddressLine2" },
    // Sunshine ticket # field (poorly named in source PDF)
    {
      formFieldName:
        "last call for field check is required before returning to the Department of Regulatory and Economic Resources for",
      label: "Sunshine 811 ticket #",
      promptHuman: true,
      placeholder: "e.g. 4488120-001",
    },
    {
      formFieldName: "Note that a minimum of four working days after",
      label: "Date of Sunshine 811 ticket",
      promptHuman: true,
      inputType: "date",
    },
    // Owner row
    { formFieldName: "Owners Name", label: "Owner's Name", defaultFrom: "ownerName" },
    { formFieldName: "undefined", label: "Owner sig — month", defaultFrom: "ownerDateMonth" },
    { formFieldName: "Date", label: "Owner sig — day", defaultFrom: "ownerDateDay" },
    { formFieldName: "undefined_2", label: "Owner sig — year (2-digit)", defaultFrom: "ownerDateYearShort" },
    // Contractor row
    {
      formFieldName: "Contractors Name",
      label: "Contractor's Name",
      defaultFrom: "contractorName",
    },
    { formFieldName: "undefined_3", label: "Contractor sig — month", defaultFrom: "contractorDateMonth" },
    { formFieldName: "Date_2", label: "Contractor sig — day", defaultFrom: "contractorDateDay" },
    { formFieldName: "undefined_4", label: "Contractor sig — year (2-digit)", defaultFrom: "contractorDateYearShort" },
  ],
  signatures: [
    { formFieldName: "Owners Signature", role: "owner" },
    { formFieldName: "Contractors Signature", role: "contractor" },
  ],
  appliesTo: (ctx) =>
    ctx.permitRequired &&
    (ctx.jurisdictionCounty ?? "miami_dade") === "miami_dade",
};

// ── MDC Affidavit to Waive the Finished Side ─────────────────────────────
// Field names in source are even weaker ("undefined", "Text1"). We map by
// rectangle inference to the property-address line, owner/neighbor name,
// signature slot. Other fields (notary block) stay blank intentionally.
const MDC_FINISHED_SIDE_AFFIDAVIT: PermitDocTemplate = {
  slug: "mdc_finished_side_affidavit",
  name: "Affidavit to Waive Finished Side of Fence",
  description:
    "Required when a wood fence faces its finished side inward. Adjacent property owner waives the requirement.",
  sourcePdfPath: path.join(FORMS_DIR, "fence-waiver-finished-side.pdf"),
  sourcePdfFilename: "fence-waiver-finished-side.pdf",
  requiresOwnerSignature: true,
  requiresContractorSignature: false,
  requiresNotarization: true,
  fields: [
    // Top of form — neighbor's name + property address
    { formFieldName: "undefined", label: "Neighbor's name (line 1)", promptHuman: true, placeholder: "Neighbor's full name" },
    { formFieldName: "undefined_2", label: "Neighbor's address (line 1)", promptHuman: true },
    { formFieldName: "undefined_3", label: "Property address (subject)", defaultFrom: "jobAddressFull" },
    {
      formFieldName: "undefined_4",
      label: "Owner's name (subject property)",
      defaultFrom: "ownerName",
    },
    // The big affidavit body line
    { formFieldName: "Text1", label: "Affidavit body line", defaultFrom: "jobAddressFull" },
    { formFieldName: "Text2", label: "Date / year", defaultFrom: "currentYearShort" },
  ],
  signatures: [
    // Big signature near the body — neighbor/affiant sig
    { formFieldName: "Signature3", role: "owner" },
  ],
  appliesTo: (ctx) =>
    ctx.fenceType.startsWith("wood_") &&
    ctx.finishedSide === "in" &&
    ctx.permitRequired,
};

// ── MDC Affidavit to Extend Height ───────────────────────────────────────
// Generic Text##/Signature## names. Inferred from rectangle positions:
//   Text17 = property address (top)
//   Text18 = owner's name (mid-upper)
//   Text19 = requested height (right side)
//   Signature22 = owner sig (large width)
const MDC_HEIGHT_EXTENSION_AFFIDAVIT: PermitDocTemplate = {
  slug: "mdc_height_extension_affidavit",
  name: "Affidavit to Extend Fence Height",
  description:
    "Required when fence height exceeds the §33-11 default max. Property owner attests to the extended height.",
  sourcePdfPath: path.join(FORMS_DIR, "affidavit-extend-height.pdf"),
  sourcePdfFilename: "affidavit-extend-height.pdf",
  requiresOwnerSignature: true,
  requiresContractorSignature: false,
  requiresNotarization: true,
  fields: [
    { formFieldName: "Text17", label: "Property address", defaultFrom: "jobAddressFull" },
    { formFieldName: "Text18", label: "Owner's name", defaultFrom: "ownerName" },
    { formFieldName: "Text19", label: "Requested fence height (feet)", promptHuman: true, placeholder: "e.g. 8" },
  ],
  signatures: [
    { formFieldName: "Signature22", role: "owner" },
  ],
  appliesTo: (ctx) => ctx.heightFeet > 6 && ctx.permitRequired,
};

export const PERMIT_DOC_TEMPLATES: Record<PermitDocSlug, PermitDocTemplate> = {
  mdc_building_permit_application: MDC_BUILDING_PERMIT_APPLICATION,
  mdc_fence_addendum: MDC_FENCE_ADDENDUM,
  mdc_finished_side_affidavit: MDC_FINISHED_SIDE_AFFIDAVIT,
  mdc_height_extension_affidavit: MDC_HEIGHT_EXTENSION_AFFIDAVIT,
};

export function getTemplate(slug: string): PermitDocTemplate | null {
  return (PERMIT_DOC_TEMPLATES as Record<string, PermitDocTemplate>)[slug] ?? null;
}

export function pickApplicableTemplates(
  ctx: PermitDocAppliesContext,
): PermitDocTemplate[] {
  return Object.values(PERMIT_DOC_TEMPLATES).filter((t) => t.appliesTo(ctx));
}

/** Logical key used in fieldValues storage — defaults to the form field name. */
export function fieldKey(f: PermitDocField): string {
  return f.key ?? f.formFieldName;
}

export function buildInitialFieldValues(
  template: PermitDocTemplate,
  estimateCtx: EstimateRenderContext,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of template.fields) {
    const k = fieldKey(f);
    if (f.staticValue) {
      out[k] = f.staticValue;
      continue;
    }
    if (!f.defaultFrom) continue;
    const v = resolveDefault(f.defaultFrom, estimateCtx);
    if (v) out[k] = v;
  }
  return out;
}

export interface EstimateRenderContext {
  jobAddressLine1: string;
  jobAddressLine2: string;
  jobAddressFull: string;
  jobFolio: string;
  ownerName: string;
  ownerAddress: string;
  ownerCity: string;
  ownerState: string;
  ownerZip: string;
  ownerPhone: string;
  contractorName: string;
  contractorCompanyName: string;
  contractorLicenseNumber: string;
  contractorQualifierLast4: string;
  contractorAddress: string;
  contractorCity: string;
  contractorState: string;
  contractorZip: string;
  contractorPhone: string;
  workDescription: string;
  valueOfWorkDisplay: string;
  currentUseOfProperty: string;
  triggeredAt: Date;
}

function resolveDefault(
  source: NonNullable<PermitDocField["defaultFrom"]>,
  ctx: EstimateRenderContext,
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
    case "contractorName":
      return ctx.contractorName;
    case "contractorCompanyName":
      return ctx.contractorCompanyName;
    case "contractorLicenseNumber":
      return ctx.contractorLicenseNumber;
    case "contractorQualifierLast4":
      return ctx.contractorQualifierLast4;
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
    case "currentUseOfProperty":
      return ctx.currentUseOfProperty;
    case "ownerDateMonth":
    case "currentMonth":
    case "contractorDateMonth":
      return String(ctx.triggeredAt.getMonth() + 1).padStart(2, "0");
    case "ownerDateDay":
    case "currentDay":
    case "contractorDateDay":
      return String(ctx.triggeredAt.getDate()).padStart(2, "0");
    case "ownerDateYear":
    case "currentYear":
    case "contractorDateYear":
      return String(ctx.triggeredAt.getFullYear());
    case "ownerDateYearShort":
    case "currentYearShort":
    case "contractorDateYearShort":
      return String(ctx.triggeredAt.getFullYear()).slice(-2);
    default:
      return "";
  }
}
