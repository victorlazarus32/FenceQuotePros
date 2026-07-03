"use server";

// Contract/terms template CRUD. Radio-default semantics (PS rule): at most
// one default-for-estimates and one default-for-invoices per user — setting
// a default CLEARS the flag on every other template in the same transaction.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

const TemplateSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  body: z.string().trim().min(1, "Body is required.").max(10_000),
  isDefaultEstimate: z.boolean(),
  isDefaultInvoice: z.boolean(),
});

function parseForm(formData: FormData) {
  return TemplateSchema.safeParse({
    name: formData.get("name") ?? "",
    body: formData.get("body") ?? "",
    isDefaultEstimate: formData.get("isDefaultEstimate") === "on",
    isDefaultInvoice: formData.get("isDefaultInvoice") === "on",
  });
}

export async function createContractTemplate(
  formData: FormData,
): Promise<void> {
  const userId = await getCurrentUserId();
  const parsed = parseForm(formData);
  if (!parsed.success) redirect("/contracts/new?error=1");
  const d = parsed.data;

  await db.$transaction([
    ...(d.isDefaultEstimate
      ? [
          db.contractTemplate.updateMany({
            where: { userId, isDefaultEstimate: true },
            data: { isDefaultEstimate: false },
          }),
        ]
      : []),
    ...(d.isDefaultInvoice
      ? [
          db.contractTemplate.updateMany({
            where: { userId, isDefaultInvoice: true },
            data: { isDefaultInvoice: false },
          }),
        ]
      : []),
    db.contractTemplate.create({
      data: { userId, ...d },
    }),
  ]);
  revalidatePath("/contracts");
  redirect("/contracts");
}

export async function updateContractTemplate(
  id: string,
  formData: FormData,
): Promise<void> {
  const userId = await getCurrentUserId();
  const existing = await db.contractTemplate.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) redirect("/contracts");
  const parsed = parseForm(formData);
  if (!parsed.success) redirect(`/contracts/${id}/edit?error=1`);
  const d = parsed.data;

  await db.$transaction([
    ...(d.isDefaultEstimate
      ? [
          db.contractTemplate.updateMany({
            where: { userId, isDefaultEstimate: true, id: { not: id } },
            data: { isDefaultEstimate: false },
          }),
        ]
      : []),
    ...(d.isDefaultInvoice
      ? [
          db.contractTemplate.updateMany({
            where: { userId, isDefaultInvoice: true, id: { not: id } },
            data: { isDefaultInvoice: false },
          }),
        ]
      : []),
    db.contractTemplate.update({ where: { id }, data: d }),
  ]);
  revalidatePath("/contracts");
  redirect("/contracts");
}

export async function deleteContractTemplate(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  const existing = await db.contractTemplate.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) return;
  await db.contractTemplate.delete({ where: { id } });
  revalidatePath("/contracts");
}
