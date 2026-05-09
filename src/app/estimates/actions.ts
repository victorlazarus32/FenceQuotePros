"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { proposalEmail } from "@/lib/emailTemplates";
import { dollarsToCents, formatMoney } from "@/lib/format";
import { nextEstimateNumber, nextInvoiceNumber } from "@/lib/numbering";
import { generateShareToken } from "@/lib/tokens";
import {
  calculateFenceJob,
  type AccessType,
  type FenceCalcInput,
  type FenceType,
  type GateMotor,
  type GateStyle,
  type LaborConfig,
  type MarginConfig,
  type SoilType,
} from "@/lib/fence";
import { enqueuePermitDocs } from "./permitDocActions";

const FENCE_TYPES: FenceType[] = [
  "chain_link",
  "wood_privacy",
  "wood_picket",
  "vinyl",
  "aluminum",
  "wrought_iron",
  "composite",
  "dura_fence",
  "concrete_wall",
  "concrete_column",
];

const TERRAINS = ["flat", "sloped", "rocky"] as const;

const GATE_STYLES = [
  "swing_walk",
  "swing_drive",
  "sliding",
  "cantilever",
  "bi_parting",
  "none",
] as const satisfies readonly GateStyle[];

const GATE_MOTORS = [
  "none",
  "swing_single",
  "swing_double",
  "slide",
  "solar",
  "hydraulic",
] as const satisfies readonly GateMotor[];

const SOIL_TYPES = ["sand", "clay", "rock"] as const satisfies readonly SoilType[];
const ACCESS_TYPES = [
  "easy",
  "limited",
  "restricted",
] as const satisfies readonly AccessType[];
const LABOR_MODES = ["per_foot", "per_hour"] as const;
const MARGIN_MODES = ["percent", "fixed", "minimum"] as const;
const FINISHED_SIDES = ["in", "out", "both"] as const;

const FenceJobSchema = z.object({
  fenceType: z.enum(FENCE_TYPES as [FenceType, ...FenceType[]]),
  heightFeet: z.coerce.number().min(2).max(20),
  linearFeet: z.coerce.number().min(1).max(10000),
  postSpacingFeet: z.coerce.number().min(4).max(12),
  numGatesSingle: z.coerce.number().int().min(0).max(20),
  numGatesDouble: z.coerce.number().int().min(0).max(20),
  numCorners: z.coerce.number().int().min(0).max(50).optional().default(0),
  numEnds: z.coerce.number().int().min(0).max(50).optional().default(2),
  removeExisting: z.coerce.boolean().optional().default(false),
  removeLinearFeet: z.coerce.number().min(0).max(10000).optional().default(0),
  haulAway: z.coerce.boolean().optional().default(true),
  terrain: z.enum(TERRAINS),
  soilType: z.enum(SOIL_TYPES).optional().default("sand"),
  access: z.enum(ACCESS_TYPES).optional().default("easy"),
  poolAdjacent: z.coerce.boolean().optional().default(false),
  hvhz: z.coerce.boolean().optional().default(false),
  gateStyle: z.enum(GATE_STYLES).optional().default("swing_walk"),
  gateMotor: z.enum(GATE_MOTORS).optional().default("none"),
  style: z.string().max(60).optional().default(""),
  color: z.string().max(60).optional().default(""),
  permitRequired: z.coerce.boolean().optional().default(false),
  permitDollars: z.coerce.number().min(0).max(100000).optional().default(0),
  engineeringRequired: z.coerce.boolean().optional().default(false),
  engineeringDollars: z.coerce.number().min(0).max(100000).optional().default(0),
  laborMode: z.enum(LABOR_MODES).optional().default("per_foot"),
  laborRatePerFootDollars: z.coerce.number().min(0).max(1000).optional().default(0),
  laborRatePerHourDollars: z.coerce.number().min(0).max(2000).optional().default(0),
  crewSize: z.coerce.number().int().min(1).max(20).optional().default(2),
  estimatedHours: z.coerce.number().min(0).max(2000).optional().default(0),
  marginMode: z.enum(MARGIN_MODES).optional().default("percent"),
  marginPercent: z.coerce.number().min(0).max(500).optional().default(20),
  marginFixedDollars: z.coerce.number().min(0).max(1000000).optional().default(0),
  marginMinimumDollars: z.coerce.number().min(0).max(1000000).optional().default(0),
  finishedSide: z.enum(FINISHED_SIDES).optional(),
  purpose: z
    .enum([
      "privacy",
      "security",
      "pool_safety",
      "pets",
      "decorative",
      "hoa",
      "commercial",
      "noise",
    ])
    .optional(),
});

const LineItemSchema = z.object({
  description: z.string().min(1).max(300),
  quantity: z.coerce.number().min(0),
  unit: z.string().max(20),
  unitPriceDollars: z.coerce.number().min(0),
});

const DEPOSIT_MODES = ["none", "percent", "fixed"] as const;

// Estimate-level fields (excludes the client choice — handled separately
// because clientMode toggles between "existing dropdown" and "create new").
const EstimateCreateSchema = z.object({
  notes: z.string().max(2000).optional(),
  terms: z.string().max(2000).optional(),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  expiryDate: z.string().optional(),
  depositMode: z.enum(DEPOSIT_MODES).optional().default("percent"),
  depositPercent: z.coerce.number().min(0).max(100).optional().default(50),
  depositFixedDollars: z.coerce.number().min(0).max(10000000).optional().default(0),
});

// New-client payload — what the inline new-customer section in step 1 sends.
const NewClientSchema = z.object({
  name: z.string().min(1, "Client name required").max(120),
  email: z.string().email().or(z.literal("")).optional(),
  phone: z.string().max(40).optional(),
  addressLine1: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(40).optional(),
  zip: z.string().max(20).optional(),
  folioNumber: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
});

export type EstimateFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseLineItems(formData: FormData) {
  const descriptions = formData.getAll("li_description") as string[];
  const quantities = formData.getAll("li_quantity") as string[];
  const units = formData.getAll("li_unit") as string[];
  const prices = formData.getAll("li_unitPrice") as string[];

  const items: Array<z.infer<typeof LineItemSchema>> = [];
  for (let i = 0; i < descriptions.length; i++) {
    const raw = {
      description: descriptions[i],
      quantity: quantities[i],
      unit: units[i] ?? "ea",
      unitPriceDollars: prices[i],
    };
    if (!raw.description || raw.description.trim() === "") continue;
    const parsed = LineItemSchema.safeParse(raw);
    if (parsed.success) items.push(parsed.data);
  }
  return items;
}

function parseFenceJob(formData: FormData) {
  if (formData.get("fenceJob_enabled") !== "on") return null;
  const parsed = FenceJobSchema.safeParse({
    fenceType: formData.get("fenceType"),
    heightFeet: formData.get("heightFeet"),
    linearFeet: formData.get("linearFeet"),
    postSpacingFeet: formData.get("postSpacingFeet"),
    numGatesSingle: formData.get("numGatesSingle") ?? 0,
    numGatesDouble: formData.get("numGatesDouble") ?? 0,
    numCorners: formData.get("numCorners") ?? 0,
    numEnds: formData.get("numEnds") ?? 2,
    removeExisting: formData.get("removeExisting") === "on",
    removeLinearFeet: formData.get("removeLinearFeet") ?? 0,
    haulAway: formData.get("haulAway") === "on",
    terrain: formData.get("terrain") ?? "flat",
    soilType: formData.get("soilType") ?? "sand",
    access: formData.get("access") ?? "easy",
    poolAdjacent: formData.get("poolAdjacent") === "on",
    hvhz: formData.get("hvhz") === "on",
    gateStyle: formData.get("gateStyle") ?? "swing_walk",
    gateMotor: formData.get("gateMotor") ?? "none",
    style: formData.get("style") ?? "",
    color: formData.get("color") ?? "",
    permitRequired: formData.get("permitRequired") === "on",
    permitDollars: formData.get("permitDollars") ?? 0,
    engineeringRequired: formData.get("engineeringRequired") === "on",
    engineeringDollars: formData.get("engineeringDollars") ?? 0,
    laborMode: formData.get("laborMode") ?? "per_foot",
    laborRatePerFootDollars: formData.get("laborRatePerFootDollars") ?? 0,
    laborRatePerHourDollars: formData.get("laborRatePerHourDollars") ?? 0,
    crewSize: formData.get("crewSize") ?? 2,
    estimatedHours: formData.get("estimatedHours") ?? 0,
    marginMode: formData.get("marginMode") ?? "percent",
    marginPercent: formData.get("marginPercent") ?? 20,
    marginFixedDollars: formData.get("marginFixedDollars") ?? 0,
    marginMinimumDollars: formData.get("marginMinimumDollars") ?? 0,
    finishedSide: formData.get("finishedSide") || undefined,
    purpose: formData.get("purpose") || undefined,
  });
  if (!parsed.success) return null;
  return parsed.data;
}

// Builds a FenceCalcInput from the parsed form data — assembles labor /
// pricing config objects from the flat form fields.
function buildCalcInput(
  data: z.infer<typeof FenceJobSchema>,
): FenceCalcInput {
  const labor: LaborConfig =
    data.laborMode === "per_hour"
      ? {
          mode: "per_hour",
          ratePerHourCents: Math.round(data.laborRatePerHourDollars * 100),
          crewSize: data.crewSize,
          estimatedHours: data.estimatedHours,
        }
      : {
          mode: "per_foot",
          ratePerFootCents: Math.round(data.laborRatePerFootDollars * 100),
        };

  let margin: MarginConfig;
  if (data.marginMode === "fixed") {
    margin = { mode: "fixed", cents: Math.round(data.marginFixedDollars * 100) };
  } else if (data.marginMode === "minimum") {
    margin = {
      mode: "minimum",
      floorCents: Math.round(data.marginMinimumDollars * 100),
    };
  } else {
    margin = { mode: "percent", value: data.marginPercent / 100 };
  }

  return {
    fenceType: data.fenceType,
    heightFeet: data.heightFeet,
    linearFeet: data.linearFeet,
    postSpacingFeet: data.postSpacingFeet,
    numGatesSingle: data.numGatesSingle,
    numGatesDouble: data.numGatesDouble,
    numCorners: data.numCorners,
    numEnds: data.numEnds,
    removeExisting: data.removeExisting,
    removeLinearFeet: data.removeLinearFeet,
    haulAway: data.haulAway,
    terrain: data.terrain,
    soilType: data.soilType,
    access: data.access,
    poolAdjacent: data.poolAdjacent,
    hvhz: data.hvhz,
    gateStyle: data.gateStyle,
    gateMotor: data.gateMotor,
    style: data.style || undefined,
    color: data.color || undefined,
    permitRequired: data.permitRequired,
    permitCents: data.permitRequired
      ? Math.round(data.permitDollars * 100)
      : undefined,
    engineeringRequired: data.engineeringRequired,
    engineeringCents: data.engineeringRequired
      ? Math.round(data.engineeringDollars * 100)
      : undefined,
    labor,
    pricing: { margin },
    finishedSide: data.finishedSide,
  };
}

export async function createEstimate(
  _prev: EstimateFormState,
  formData: FormData,
): Promise<EstimateFormState> {
  const userId = await getCurrentUserId();

  const parsed = EstimateCreateSchema.safeParse({
    notes: formData.get("notes") ?? "",
    terms: formData.get("terms") ?? "",
    taxRate: formData.get("taxRate") ?? 0,
    expiryDate: formData.get("expiryDate") ?? "",
    depositMode: formData.get("depositMode") ?? "percent",
    depositPercent: formData.get("depositPercent") ?? 50,
    depositFixedDollars: formData.get("depositFixedDollars") ?? 0,
  });
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }
  const data = parsed.data;

  // Resolve client: either pick existing by id, or create a new one inline.
  const clientMode = formData.get("clientMode");
  let clientId: string;

  if (clientMode === "new") {
    const parsedClient = NewClientSchema.safeParse({
      name: formData.get("newClient_name") ?? "",
      email: formData.get("newClient_email") ?? "",
      phone: formData.get("newClient_phone") ?? "",
      addressLine1: formData.get("newClient_addressLine1") ?? "",
      city: formData.get("newClient_city") ?? "",
      state: formData.get("newClient_state") ?? "",
      zip: formData.get("newClient_zip") ?? "",
      folioNumber: formData.get("newClient_folioNumber") ?? "",
      notes: formData.get("newClient_notes") ?? "",
    });
    if (!parsedClient.success) {
      return {
        errors: z.flattenError(parsedClient.error).fieldErrors,
        message: "Please complete the new-customer fields.",
      };
    }
    const created = await db.client.create({
      data: {
        userId,
        name: parsedClient.data.name,
        email: parsedClient.data.email || null,
        phone: parsedClient.data.phone || null,
        addressLine1: parsedClient.data.addressLine1 || null,
        city: parsedClient.data.city || null,
        state: parsedClient.data.state || null,
        zip: parsedClient.data.zip || null,
        folioNumber: parsedClient.data.folioNumber || null,
        notes: parsedClient.data.notes || null,
      },
    });
    clientId = created.id;
    revalidatePath("/clients");
  } else {
    const formClientId = formData.get("clientId");
    if (typeof formClientId !== "string" || !formClientId) {
      return {
        errors: { clientId: ["Pick a client or add a new one."] },
        message: "Pick a client or add a new one.",
      };
    }
    const existing = await db.client.findUnique({ where: { id: formClientId } });
    if (!existing || existing.userId !== userId) {
      return { message: "Client not found." };
    }
    clientId = existing.id;
  }

  const fenceJob = parseFenceJob(formData);
  const customLines = parseLineItems(formData);

  let allLines: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPriceCents: number;
    totalCents: number;
  }> = [];

  if (fenceJob) {
    const calc = calculateFenceJob(buildCalcInput(fenceJob));
    allLines = allLines.concat(calc.lines);
  }

  for (const li of customLines) {
    const unitPriceCents = dollarsToCents(li.unitPriceDollars);
    const totalCents = Math.round(unitPriceCents * li.quantity);
    allLines.push({
      description: li.description,
      quantity: li.quantity,
      unit: li.unit,
      unitPriceCents,
      totalCents,
    });
  }

  if (allLines.length === 0) {
    return {
      message:
        "Add the fence calculator or at least one line item before saving.",
    };
  }

  const subtotalCents = allLines.reduce((s, l) => s + l.totalCents, 0);
  const taxRate = data.taxRate ?? 0;
  const taxCents = Math.round((subtotalCents * taxRate) / 100);
  const totalCents = subtotalCents + taxCents;

  const number = await nextEstimateNumber(userId);

  const created = await db.estimate.create({
    data: {
      userId,
      clientId,
      number,
      status: "draft",
      issueDate: new Date(),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      notes: data.notes || null,
      terms: data.terms || null,
      subtotalCents,
      taxRate,
      taxCents,
      totalCents,
      depositMode: data.depositMode,
      depositPercent: data.depositPercent,
      depositFixedCents: Math.round(data.depositFixedDollars * 100),
      lineItems: {
        create: allLines.map((l, i) => ({ ...l, sortOrder: i })),
      },
      fenceJobs: fenceJob
        ? {
            create: [
              {
                // Core dimensions
                fenceType: fenceJob.fenceType,
                heightFeet: fenceJob.heightFeet,
                linearFeet: fenceJob.linearFeet,
                postSpacingFeet: fenceJob.postSpacingFeet,
                // Layout
                numGatesSingle: fenceJob.numGatesSingle,
                numGatesDouble: fenceJob.numGatesDouble,
                numCorners: fenceJob.numCorners,
                numEnds: fenceJob.numEnds,
                // Removal & prep
                removeExisting: fenceJob.removeExisting,
                removeLinearFeet: fenceJob.removeLinearFeet,
                haulAway: fenceJob.haulAway,
                // Site conditions
                terrain: fenceJob.terrain,
                soilType: fenceJob.soilType,
                access: fenceJob.access,
                poolAdjacent: fenceJob.poolAdjacent,
                hvhz: fenceJob.hvhz,
                // Aesthetic
                style: fenceJob.style || null,
                color: fenceJob.color || null,
                purpose: fenceJob.purpose ?? null,
                // Gates
                gateStyle: fenceJob.gateStyle,
                gateMotor: fenceJob.gateMotor,
                // Permits & engineering
                permitRequired: fenceJob.permitRequired,
                permitCents: fenceJob.permitRequired
                  ? Math.round(fenceJob.permitDollars * 100)
                  : 0,
                engineeringRequired: fenceJob.engineeringRequired,
                engineeringCents: fenceJob.engineeringRequired
                  ? Math.round(fenceJob.engineeringDollars * 100)
                  : 0,
                // Labor
                laborMode: fenceJob.laborMode,
                laborRatePerFootCents: Math.round(
                  fenceJob.laborRatePerFootDollars * 100,
                ),
                laborRatePerHourCents: Math.round(
                  fenceJob.laborRatePerHourDollars * 100,
                ),
                crewSize: fenceJob.crewSize,
                estimatedHours: fenceJob.estimatedHours,
                // Pricing strategy
                marginMode: fenceJob.marginMode,
                marginPercent: fenceJob.marginPercent,
                marginFixedCents: Math.round(
                  fenceJob.marginFixedDollars * 100,
                ),
                marginMinimumCents: Math.round(
                  fenceJob.marginMinimumDollars * 100,
                ),
                // Wood orientation
                finishedSide: fenceJob.finishedSide ?? null,
              },
            ],
          }
        : undefined,
    },
  });

  revalidatePath("/estimates");
  revalidatePath("/");
  // After-save destination is controlled by the form's "afterSave"
  // hidden input — defaults to the estimate detail, but the new
  // "Save and visualize" button on Step 7 sets it to "visualize"
  // so the contractor lands directly in the photo / fence-render
  // workflow.
  const afterSave = formData.get("afterSave");
  if (afterSave === "visualize") {
    redirect(`/estimates/${created.id}/visualize`);
  }
  redirect(`/estimates/${created.id}`);
}

export async function setEstimateStatus(
  id: string,
  status: "draft" | "sent" | "accepted" | "declined" | "expired",
): Promise<void> {
  const userId = await getCurrentUserId();
  const est = await db.estimate.findUnique({ where: { id } });
  if (!est || est.userId !== userId) return;
  await db.estimate.update({ where: { id }, data: { status } });
  revalidatePath(`/estimates/${id}`);
  revalidatePath("/estimates");
}

export async function deleteEstimate(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const est = await db.estimate.findUnique({ where: { id } });
  if (!est || est.userId !== userId) return;
  await db.estimate.delete({ where: { id } });
  revalidatePath("/estimates");
  redirect("/estimates");
}

export async function convertEstimateToInvoice(
  estimateId: string,
): Promise<void> {
  const userId = await getCurrentUserId();
  const est = await db.estimate.findUnique({
    where: { id: estimateId },
    include: { lineItems: true },
  });
  if (!est || est.userId !== userId) return;

  const existing = await db.invoice.findUnique({ where: { estimateId } });
  if (existing) {
    redirect(`/invoices/${existing.id}`);
  }

  const number = await nextInvoiceNumber(userId);
  const due = new Date();
  due.setDate(due.getDate() + 30);

  const invoice = await db.invoice.create({
    data: {
      userId,
      clientId: est.clientId,
      estimateId: est.id,
      number,
      status: "draft",
      issueDate: new Date(),
      dueDate: due,
      notes: est.notes,
      terms: est.terms,
      subtotalCents: est.subtotalCents,
      taxRate: est.taxRate,
      taxCents: est.taxCents,
      totalCents: est.totalCents,
      lineItems: {
        create: est.lineItems.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitPriceCents: l.unitPriceCents,
          totalCents: l.totalCents,
          sortOrder: l.sortOrder,
        })),
      },
    },
  });

  if (est.status === "draft") {
    await db.estimate.update({
      where: { id: est.id },
      data: { status: "accepted" },
    });
  }

  revalidatePath("/invoices");
  revalidatePath("/");
  redirect(`/invoices/${invoice.id}`);
}

// ─── Send proposal (placeholder: queues, doesn't actually email yet) ───
//
// When a real email service (Resend, etc.) lands, this action's only change
// is the bit that flips status="sent" + persists provider message id. Until
// then, it: (a) generates a share token if missing, (b) records what would
// have been sent into EmailMessage with status="queued", (c) creates a
// contractor Notification, (d) marks the estimate "sent".

const SendProposalSchema = z.object({
  estimateId: z.string().min(1),
});

export type SendProposalState = {
  ok?: boolean;
  message?: string;
  shareUrl?: string;
};

function buildBaseUrl(): string {
  // Best-effort: prefer NEXT_PUBLIC_APP_URL if set; otherwise fall back to the
  // current request's origin from headers, otherwise a sensible dev default.
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3002";
}

export async function sendEstimateProposal(
  _prev: SendProposalState,
  formData: FormData,
): Promise<SendProposalState> {
  const userId = await getCurrentUserId();
  const parsed = SendProposalSchema.safeParse({
    estimateId: formData.get("estimateId"),
  });
  if (!parsed.success) {
    return { message: "Missing or invalid estimate id." };
  }
  const { estimateId } = parsed.data;

  const estimate = await db.estimate.findUnique({
    where: { id: estimateId },
    include: { client: true, user: true },
  });
  if (!estimate || estimate.userId !== userId) {
    return { message: "Estimate not found." };
  }
  if (!estimate.client.email) {
    return {
      message:
        "Customer has no email on file — add an email to the customer record first.",
    };
  }

  // Persist a share token if this is the first send.
  let shareToken = estimate.shareToken;
  if (!shareToken) {
    shareToken = generateShareToken();
    await db.estimate.update({
      where: { id: estimate.id },
      data: { shareToken },
    });
  }

  // Try to read the request's host so the share URL works regardless of port
  // (dev sometimes lands on 3000/3001/3002). Falls back to env / localhost.
  let baseUrl = buildBaseUrl();
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host");
    if (host) baseUrl = `${proto}://${host}`;
  } catch {
    // headers() can throw outside a request context; ignore.
  }
  const shareUrl = `${baseUrl}/p/${shareToken}`;

  // Compose the email content. Stored as a snapshot on EmailMessage so what
  // the contractor sees in the activity feed matches what was queued.
  const total = formatMoney(estimate.totalCents);
  const expires = estimate.expiryDate
    ? new Date(estimate.expiryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const composed = proposalEmail({
    clientName: estimate.client.name,
    contractorName: estimate.user.name ?? estimate.user.email,
    contractorCompany: estimate.user.companyName,
    estimateNumber: estimate.number,
    shareUrl,
    totalDisplay: total,
    expiresOn: expires,
  });

  await db.emailMessage.create({
    data: {
      userId,
      estimateId: estimate.id,
      kind: "proposal",
      toAddress: estimate.client.email,
      fromAddress:
        estimate.user.email || `quotes@fencequotepros.com`,
      subject: composed.subject,
      bodyText: composed.body,
      status: "queued",
      // No real provider has accepted it yet — leave sentAt null and
      // providerId null. Real sending flips status → "sent" and fills these.
    },
  });

  await db.notification.create({
    data: {
      userId,
      kind: "estimate_sent",
      title: `Proposal queued for ${estimate.client.name}`,
      body: `${estimate.number} · ${total} · queued for ${estimate.client.email}. (No real email service hooked up yet — recorded in the activity feed.)`,
      estimateId: estimate.id,
      channels: "in_app",
    },
  });

  if (estimate.status === "draft") {
    await db.estimate.update({
      where: { id: estimate.id },
      data: { status: "sent" },
    });
  }

  revalidatePath(`/estimates/${estimate.id}`);
  revalidatePath("/estimates");
  revalidatePath("/");
  return { ok: true, shareUrl };
}

// ── E-signature ──────────────────────────────────────────────────────────
// Customer signs the estimate on the public /p/[token] page using a
// canvas. We capture the drawing as a base64 PNG, their typed name, and
// request metadata as a basic audit trail. No DocuSign — in-house only.

const SignSchema = z.object({
  token: z.string().min(8),
  signatureDataUrl: z
    .string()
    .startsWith("data:image/png;base64,", "Signature must be a PNG data URL.")
    // Generous cap — typical canvas signatures are under 80KB.
    .max(2_000_000, "Signature image is too large."),
  signedByName: z.string().trim().min(2, "Please type your full name.").max(120),
});

export type SignEstimateState = {
  ok?: boolean;
  message?: string;
};

export async function signEstimate(
  _prev: SignEstimateState,
  formData: FormData,
): Promise<SignEstimateState> {
  const parsed = SignSchema.safeParse({
    token: formData.get("token"),
    signatureDataUrl: formData.get("signatureDataUrl"),
    signedByName: formData.get("signedByName"),
  });
  if (!parsed.success) {
    return {
      message:
        parsed.error.issues[0]?.message ?? "Couldn't read your signature.",
    };
  }
  const { token, signatureDataUrl, signedByName } = parsed.data;

  const estimate = await db.estimate.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      userId: true,
      number: true,
      totalCents: true,
      signedAt: true,
      permitDocsAutoTrigger: true,
      client: { select: { name: true } },
    },
  });
  if (!estimate) return { message: "Estimate not found." };
  if (estimate.signedAt) {
    return { message: "This estimate has already been signed." };
  }

  let ipAddress: string | null = null;
  let userAgent: string | null = null;
  try {
    const h = await headers();
    ipAddress =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    userAgent = h.get("user-agent") ?? null;
  } catch {
    // headers() can throw outside a request context — leave nulls.
  }

  await db.estimate.update({
    where: { id: estimate.id },
    data: {
      status: "accepted",
      signedAt: new Date(),
      signatureDataUrl,
      signedByName,
      signedIp: ipAddress,
      signedUserAgent: userAgent,
    },
  });

  await db.notification.create({
    data: {
      userId: estimate.userId,
      kind: "estimate_signed",
      title: `${estimate.client.name} signed your estimate`,
      body: `${estimate.number} · ${formatMoney(estimate.totalCents)} · signed by ${signedByName}.`,
      estimateId: estimate.id,
      channels: "in_app",
    },
  });

  // If auto-trigger is on, enqueue the applicable permit documents so the
  // customer can sign them immediately without contractor intervention.
  if (estimate.permitDocsAutoTrigger) {
    try {
      await enqueuePermitDocs(estimate.id);
    } catch (err) {
      console.error("enqueuePermitDocs failed after estimate sign", err);
    }
  }

  revalidatePath(`/p/${token}`);
  revalidatePath(`/estimates/${estimate.id}`);
  revalidatePath("/estimates");
  revalidatePath("/");
  return { ok: true };
}
