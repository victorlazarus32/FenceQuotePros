"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { dollarsToCents, formatMoney } from "@/lib/format";
import { invoiceEmail } from "@/lib/emailTemplates";
import { deliverEmailMessage, isMailConfigured } from "@/lib/mail";
import { generateShareToken } from "@/lib/tokens";

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

// ─── Send invoice to the customer ────────────────────────────────
// Mirrors sendEstimateProposal: mint a share token on first send, snapshot
// the composed email into EmailMessage, attempt real delivery via lib/mail,
// notify the contractor with the actual outcome, and mark a draft "sent".

export type SendInvoiceState = {
  ok?: boolean;
  message?: string;
  shareUrl?: string;
  delivered?: boolean;
};

export async function sendInvoice(
  _prev: SendInvoiceState,
  formData: FormData,
): Promise<SendInvoiceState> {
  const userId = await getCurrentUserId();
  const invoiceId = String(formData.get("invoiceId") ?? "");
  if (!invoiceId) return { message: "Missing invoice id." };

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: true, user: true },
  });
  if (!invoice || invoice.userId !== userId) {
    return { message: "Invoice not found." };
  }
  if (!invoice.client.email) {
    return {
      message:
        "Customer has no email on file — add an email to the customer record first.",
    };
  }

  let shareToken = invoice.shareToken;
  if (!shareToken) {
    shareToken = generateShareToken();
    await db.invoice.update({
      where: { id: invoice.id },
      data: { shareToken },
    });
  }

  let baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3002";
  try {
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host");
    if (host) baseUrl = `${proto}://${host}`;
  } catch {
    // headers() can throw outside a request context; ignore.
  }
  const shareUrl = `${baseUrl}/p/inv/${shareToken}`;

  const balance = Math.max(0, invoice.totalCents - invoice.paidCents);
  const composed = invoiceEmail({
    clientName: invoice.client.name,
    contractorName: invoice.user.name ?? invoice.user.email,
    contractorCompany: invoice.user.companyName,
    invoiceNumber: invoice.number,
    shareUrl,
    totalDisplay: formatMoney(invoice.totalCents),
    balanceDisplay: formatMoney(balance),
    dueOn: invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null,
  });

  const emailRow = await db.emailMessage.create({
    data: {
      userId,
      invoiceId: invoice.id,
      kind: "invoice",
      toAddress: invoice.client.email,
      fromAddress: invoice.user.email || `quotes@fencequotepros.com`,
      subject: composed.subject,
      bodyText: composed.body,
      status: "queued",
    },
  });

  const delivery = await deliverEmailMessage(emailRow.id);

  const notif = delivery.delivered
    ? {
        kind: "invoice_sent",
        title: `Invoice emailed to ${invoice.client.name}`,
        body: `${invoice.number} · ${formatMoney(invoice.totalCents)} · sent to ${invoice.client.email}.`,
      }
    : isMailConfigured()
      ? {
          kind: "email_failed",
          title: `Invoice email to ${invoice.client.name} FAILED`,
          body: `${invoice.number} · ${invoice.client.email} · ${delivery.error ?? "unknown error"}. Share the link manually or retry.`,
        }
      : {
          kind: "invoice_sent",
          title: `Invoice queued for ${invoice.client.name}`,
          body: `${invoice.number} · queued for ${invoice.client.email}. (Email sending not configured — set RESEND_API_KEY. Share the link manually meanwhile.)`,
        };
  await db.notification.create({
    data: {
      userId,
      kind: notif.kind,
      title: notif.title,
      body: notif.body,
      channels: "in_app",
    },
  });

  if (invoice.status === "draft") {
    await db.invoice.update({
      where: { id: invoice.id },
      data: { status: "sent" },
    });
  }

  revalidatePath(`/invoices/${invoice.id}`);
  revalidatePath("/invoices");
  revalidatePath("/");
  return { ok: true, shareUrl, delivered: delivery.delivered };
}
