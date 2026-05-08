"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { dollarsToCents } from "@/lib/format";

const PaymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be > 0"),
  method: z.enum(["cash", "check", "card", "ach", "zelle", "other"]),
  reference: z.string().max(120).optional(),
  notes: z.string().max(1000).optional(),
});

export type PaymentFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function recordPayment(
  invoiceId: string,
  _prev: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const userId = await getCurrentUserId();
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.userId !== userId) {
    return { message: "Not found" };
  }
  const parsed = PaymentSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method"),
    reference: formData.get("reference") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }
  const data = parsed.data;
  const amountCents = dollarsToCents(data.amount);

  const newPaid = invoice.paidCents + amountCents;
  let newStatus = invoice.status;
  if (newPaid >= invoice.totalCents) newStatus = "paid";
  else if (newPaid > 0) newStatus = "partial";

  await db.$transaction([
    db.payment.create({
      data: {
        invoiceId,
        amountCents,
        method: data.method,
        reference: data.reference || null,
        notes: data.notes || null,
      },
    }),
    db.invoice.update({
      where: { id: invoiceId },
      data: { paidCents: newPaid, status: newStatus },
    }),
  ]);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/");
  return { message: "Payment recorded." };
}

export async function setInvoiceStatus(
  id: string,
  status: "draft" | "sent" | "overdue",
): Promise<void> {
  const userId = await getCurrentUserId();
  const inv = await db.invoice.findUnique({ where: { id } });
  if (!inv || inv.userId !== userId) return;
  await db.invoice.update({ where: { id }, data: { status } });
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
}
