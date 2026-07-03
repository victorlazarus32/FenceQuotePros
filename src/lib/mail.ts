// Real outbound email transport. Driver selection is env-based:
//
//   RESEND_API_KEY set   → send via the Resend REST API (plain fetch, no SDK)
//   otherwise            → "not configured": callers leave EmailMessage rows
//                          in status "queued" exactly like the pre-wiring
//                          behavior, so dev without keys stays harmless.
//
// From-address rules: Resend only accepts senders on a verified domain, so
// the actual From is RESEND_FROM_ADDRESS (e.g. "Fence Quote Pros
// <quotes@fencequotepros.com>") and the contractor's own email rides along
// as Reply-To. That way customer replies still land in the contractor's
// inbox without any per-tenant DNS setup.

import { db } from "@/lib/db";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function platformFromAddress(): string {
  return (
    process.env.RESEND_FROM_ADDRESS ??
    "Fence Quote Pros <quotes@fencequotepros.com>"
  );
}

export interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string | null;
}

export type SendMailResult =
  | { ok: true; providerId: string | null }
  | { ok: false; error: string };

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "No email provider configured (RESEND_API_KEY missing)." };
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: platformFromAddress(),
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html ?? textToHtml(input.text),
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Resend ${res.status}: ${body.slice(0, 500)}`,
      };
    }
    const json = (await res.json().catch(() => null)) as { id?: string } | null;
    return { ok: true, providerId: json?.id ?? null };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// Minimal, safe plain-text → HTML: escape, then linkify URLs and convert
// newlines. Keeps the email visually identical to the stored text snapshot.
export function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const linked = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    (url) => `<a href="${url}" style="color:#0f766e">${url}</a>`,
  );
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;white-space:pre-wrap">${linked}</div>`;
}

// Load a queued EmailMessage row, attempt real delivery, and record the
// outcome on the row (sent / failed). Never throws — a mail failure must
// not break the calling flow (estimate send, public page view, …).
export async function deliverEmailMessage(
  emailMessageId: string,
): Promise<{ delivered: boolean; error?: string }> {
  if (!isMailConfigured()) {
    // Leave the row queued — honest state, matches pre-wiring behavior.
    return { delivered: false, error: "not_configured" };
  }
  try {
    const msg = await db.emailMessage.findUnique({
      where: { id: emailMessageId },
    });
    if (!msg) return { delivered: false, error: "message_not_found" };
    if (msg.status === "sent") return { delivered: true };

    const html = textToHtml(msg.bodyText);
    const result = await sendMail({
      to: msg.toAddress,
      subject: msg.subject,
      text: msg.bodyText,
      html,
      // The contractor's address was snapshotted as fromAddress at queue
      // time; it becomes Reply-To on the real send.
      replyTo: msg.fromAddress,
    });

    if (result.ok) {
      await db.emailMessage.update({
        where: { id: msg.id },
        data: {
          status: "sent",
          sentAt: new Date(),
          providerId: result.providerId,
          bodyHtml: html,
          errorMessage: null,
        },
      });
      return { delivered: true };
    }
    await db.emailMessage.update({
      where: { id: msg.id },
      data: { status: "failed", errorMessage: result.error.slice(0, 1000) },
    });
    return { delivered: false, error: result.error };
  } catch (err) {
    return { delivered: false, error: (err as Error).message };
  }
}
