"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

const ClientSchema = z.object({
  name: z.string().min(1, "Name required").max(120),
  email: z.string().email().or(z.literal("")).optional(),
  phone: z.string().max(40).optional(),
  addressLine1: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  state: z.string().max(40).optional(),
  zip: z.string().max(20).optional(),
  folioNumber: z.string().max(40).optional(),
  hoaRequired: z.preprocess((v) => v === "on" || v === true, z.boolean()).optional(),
  hoaName: z.string().max(160).optional(),
  hoaContactName: z.string().max(120).optional(),
  hoaContactEmail: z.string().email().or(z.literal("")).optional(),
  hoaContactPhone: z.string().max(40).optional(),
  hoaSubmissionUrl: z.string().url().or(z.literal("")).optional(),
  hoaNotes: z.string().max(2000).optional(),
  hoaTemplateId: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
});

export type ClientFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function parseForm(formData: FormData) {
  return ClientSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    addressLine1: formData.get("addressLine1") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
    zip: formData.get("zip") ?? "",
    folioNumber: formData.get("folioNumber") ?? "",
    hoaRequired: formData.get("hoaRequired"),
    hoaName: formData.get("hoaName") ?? "",
    hoaContactName: formData.get("hoaContactName") ?? "",
    hoaContactEmail: formData.get("hoaContactEmail") ?? "",
    hoaContactPhone: formData.get("hoaContactPhone") ?? "",
    hoaSubmissionUrl: formData.get("hoaSubmissionUrl") ?? "",
    hoaNotes: formData.get("hoaNotes") ?? "",
    hoaTemplateId: formData.get("hoaTemplateId") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export async function createClient(
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const userId = await getCurrentUserId();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }
  const data = parsed.data;
  const created = await db.client.create({
    data: {
      userId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      addressLine1: data.addressLine1 || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      folioNumber: data.folioNumber || null,
      hoaRequired: data.hoaRequired ?? false,
      hoaName: data.hoaName || null,
      hoaContactName: data.hoaContactName || null,
      hoaContactEmail: data.hoaContactEmail || null,
      hoaContactPhone: data.hoaContactPhone || null,
      hoaSubmissionUrl: data.hoaSubmissionUrl || null,
      hoaNotes: data.hoaNotes || null,
      hoaTemplateId: data.hoaTemplateId || null,
      notes: data.notes || null,
    },
  });
  revalidatePath("/clients");
  redirect(`/clients/${created.id}`);
}

export async function updateClient(
  id: string,
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const userId = await getCurrentUserId();
  const existing = await db.client.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return { message: "Not found" };
  }
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }
  const data = parsed.data;
  await db.client.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      addressLine1: data.addressLine1 || null,
      city: data.city || null,
      state: data.state || null,
      zip: data.zip || null,
      folioNumber: data.folioNumber || null,
      hoaRequired: data.hoaRequired ?? false,
      hoaName: data.hoaName || null,
      hoaContactName: data.hoaContactName || null,
      hoaContactEmail: data.hoaContactEmail || null,
      hoaContactPhone: data.hoaContactPhone || null,
      hoaSubmissionUrl: data.hoaSubmissionUrl || null,
      hoaNotes: data.hoaNotes || null,
      hoaTemplateId: data.hoaTemplateId || null,
      notes: data.notes || null,
    },
  });
  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const existing = await db.client.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return;
  await db.client.delete({ where: { id } });
  revalidatePath("/clients");
  redirect("/clients");
}
