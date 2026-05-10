"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { getStorage, keys as storageKeys } from "@/lib/storage";
import {
  extractAcroFormFields,
  parseFieldMappings,
  type HoaFieldMapping,
} from "@/lib/hoaTemplates";

export type HoaTemplateFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

const NewTemplateSchema = z.object({
  name: z.string().min(1, "Name required").max(160),
});

const MAX_PDF_BYTES = 8 * 1024 * 1024; // 8MB

// Upload + auto-extract fields. The contractor lands on the detail page after
// this with every AcroForm field shown for mapping.
export async function createHoaTemplate(
  _prev: HoaTemplateFormState,
  formData: FormData,
): Promise<HoaTemplateFormState> {
  const userId = await getCurrentUserId();
  const parsed = NewTemplateSchema.safeParse({
    name: formData.get("name") ?? "",
  });
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) {
    return { message: "Please attach the HOA application PDF." };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { message: "PDF must be 8 MB or smaller." };
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { message: "File must be a PDF." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Inspect the PDF first so an unparsable upload doesn't create a row.
  let extracted;
  try {
    extracted = await extractAcroFormFields(buffer);
  } catch (err) {
    return {
      message: `Could not parse PDF: ${(err as Error).message}`,
    };
  }

  const templateId = randomUUID();
  const storageKey = storageKeys.hoaTemplate(userId, templateId);
  await getStorage().put(storageKey, buffer, { contentType: "application/pdf" });

  const initialMappings: HoaFieldMapping[] = extracted.fields.map((f) => ({
    formFieldName: f.formFieldName,
    kind: f.kind,
  }));

  // Pick a reasonable default for owner/contractor signatures from the
  // signatures the source PDF declares. The contractor can change these
  // on the detail page if the heuristic is wrong.
  const sigNames = extracted.signatureFieldNames;
  const ownerSig =
    sigNames.find((s) => /owner|homeowner|applicant|resident/i.test(s)) ??
    sigNames[0] ??
    null;
  const contractorSig =
    sigNames.find((s) => /contractor|company|installer|qualifier/i.test(s)) ??
    sigNames.find((s) => s !== ownerSig) ??
    null;

  await db.hoaApplicationTemplate.create({
    data: {
      id: templateId,
      userId,
      name: parsed.data.name,
      pdfStorageKey: storageKey,
      pdfFilename: file.name,
      fieldMappings: JSON.stringify(initialMappings),
      ownerSignatureFieldName: ownerSig,
      contractorSignatureFieldName: contractorSig,
      requiresOwnerSignature: ownerSig !== null,
      requiresContractorSignature: contractorSig !== null,
    },
  });

  revalidatePath("/hoa-templates");
  redirect(`/hoa-templates/${templateId}`);
}

const MappingSchema = z.object({
  formFieldName: z.string(),
  kind: z.enum(["text", "checkbox", "dropdown"]),
  defaultFrom: z.string().optional(),
  staticValue: z.string().optional(),
  label: z.string().optional(),
});

const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(160),
  ownerSignatureFieldName: z.string().optional().nullable(),
  contractorSignatureFieldName: z.string().optional().nullable(),
  requiresOwnerSignature: z.boolean().optional(),
  requiresContractorSignature: z.boolean().optional(),
  mappings: z.array(MappingSchema),
});

export async function updateHoaTemplate(
  templateId: string,
  body: {
    name: string;
    ownerSignatureFieldName: string | null;
    contractorSignatureFieldName: string | null;
    requiresOwnerSignature: boolean;
    requiresContractorSignature: boolean;
    mappings: HoaFieldMapping[];
  },
): Promise<{ ok: boolean; message?: string }> {
  const userId = await getCurrentUserId();
  const existing = await db.hoaApplicationTemplate.findUnique({
    where: { id: templateId },
    select: { userId: true },
  });
  if (!existing || existing.userId !== userId) {
    return { ok: false, message: "Not found" };
  }

  const parsed = UpdateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, message: "Invalid data." };
  }

  await db.hoaApplicationTemplate.update({
    where: { id: templateId },
    data: {
      name: parsed.data.name,
      ownerSignatureFieldName: parsed.data.ownerSignatureFieldName || null,
      contractorSignatureFieldName: parsed.data.contractorSignatureFieldName || null,
      requiresOwnerSignature: parsed.data.requiresOwnerSignature ?? true,
      requiresContractorSignature: parsed.data.requiresContractorSignature ?? true,
      // Filter empty defaultFrom/staticValue back to undefined before saving.
      fieldMappings: JSON.stringify(
        parsed.data.mappings.map((m) => ({
          formFieldName: m.formFieldName,
          kind: m.kind,
          ...(m.defaultFrom ? { defaultFrom: m.defaultFrom } : {}),
          ...(m.staticValue ? { staticValue: m.staticValue } : {}),
          ...(m.label ? { label: m.label } : {}),
        })),
      ),
    },
  });

  revalidatePath(`/hoa-templates/${templateId}`);
  revalidatePath("/hoa-templates");
  return { ok: true };
}

export async function deleteHoaTemplate(templateId: string): Promise<void> {
  const userId = await getCurrentUserId();
  const existing = await db.hoaApplicationTemplate.findUnique({
    where: { id: templateId },
    select: { userId: true, pdfStorageKey: true },
  });
  if (!existing || existing.userId !== userId) return;

  // Best-effort: detach from any clients that reference this template before
  // deletion (the FK is ON DELETE SET NULL but we revalidate paths here too).
  await db.client.updateMany({
    where: { userId, hoaTemplateId: templateId },
    data: { hoaTemplateId: null },
  });

  await db.hoaApplicationTemplate.delete({ where: { id: templateId } });
  try {
    await getStorage().remove(existing.pdfStorageKey);
  } catch (err) {
    console.warn("hoa template PDF remove failed", err);
  }
  revalidatePath("/hoa-templates");
  redirect("/hoa-templates");
}

export async function getTemplateForUser(templateId: string) {
  const userId = await getCurrentUserId();
  const t = await db.hoaApplicationTemplate.findUnique({
    where: { id: templateId },
  });
  if (!t || t.userId !== userId) return null;
  return {
    ...t,
    parsedMappings: parseFieldMappings(t.fieldMappings),
  };
}
