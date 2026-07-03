// Invoice money-state rules, extracted as PURE functions so every branch is
// unit-testable without a database. These encode the hardest-won behaviors
// from years of running the Permit Solutions invoicing engine:
//
//   1. `overdue` is DERIVED at read time, never stored. Storing it drifts
//      the moment midnight passes; deriving is always correct.
//   2. Payments are ADDITIVE; the exact-set correction path walks status
//      BACKWARD (e.g. a mistaken double-payment corrected to $0 returns the
//      invoice to "sent", not "paid").
//   3. Void is terminal, idempotent, reason-logged — and voided invoices
//      drop out of work lists and revenue.
//
// All money is INTEGER CENTS. (PS needed a +0.005 float epsilon for its
// "fully paid" test; integers make that class of bug impossible — do not
// reintroduce float dollars here.)

export const STORED_INVOICE_STATUSES = [
  "draft",
  "sent",
  "partial",
  "paid",
  "void",
] as const;
export type StoredInvoiceStatus = (typeof STORED_INVOICE_STATUSES)[number];

export interface InvoiceMoneyState {
  status: string;
  totalCents: number;
  paidCents: number;
  dueDate?: Date | string | null;
}

// ── Derived overdue ──
// Overdue = still owed money (sent or partial) AND the due date has passed.
// Date-level comparison: an invoice due 2026-07-01 becomes overdue at
// 2026-07-02 00:00 local — not the moment the clock passes its timestamp.
export function isInvoiceOverdue(
  inv: Pick<InvoiceMoneyState, "status" | "dueDate">,
  now: Date = new Date(),
): boolean {
  if (inv.status !== "sent" && inv.status !== "partial") return false;
  if (!inv.dueDate) return false;
  const due = new Date(inv.dueDate);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return due < startOfToday;
}

// What the UI shows. Never store this value.
export function displayInvoiceStatus(
  inv: Pick<InvoiceMoneyState, "status" | "dueDate">,
  now: Date = new Date(),
): string {
  if (isInvoiceOverdue(inv, now)) return "overdue";
  return inv.status;
}

// ── Guards ──
export function canEditInvoice(status: string): boolean {
  return status === "draft"; // PS web rule: edits are for drafts only
}

export function canRecordPayment(status: string): boolean {
  // No payments on drafts (send it first) or voided invoices (terminal).
  return status !== "draft" && status !== "void";
}

export function canSendInvoice(status: string): boolean {
  return status !== "void";
}

// ── Additive payment ──
export type PaymentResult =
  | { ok: true; paidCents: number; status: StoredInvoiceStatus }
  | { ok: false; reason: string };

export function applyPayment(
  inv: Pick<InvoiceMoneyState, "status" | "totalCents" | "paidCents">,
  amountCents: number,
): PaymentResult {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return { ok: false, reason: "Payment amount must be a positive amount." };
  }
  if (inv.status === "draft") {
    return { ok: false, reason: "Send the invoice before recording payments." };
  }
  if (inv.status === "void") {
    return { ok: false, reason: "This invoice is void — payments can't be recorded." };
  }
  const paidCents = inv.paidCents + amountCents;
  const status: StoredInvoiceStatus =
    paidCents >= inv.totalCents ? "paid" : "partial";
  return { ok: true, paidCents, status };
}

// ── Exact-set correction ──
// Fixes double/mistaken recordings. Sets the TOTAL received to an exact
// figure and derives status from scratch — including walking BACKWARD to
// "sent" when corrected to zero.
export function setExactPaid(
  inv: Pick<InvoiceMoneyState, "status" | "totalCents">,
  exactCents: number,
): PaymentResult {
  if (!Number.isInteger(exactCents) || exactCents < 0) {
    return { ok: false, reason: "Corrected total must be zero or a positive amount." };
  }
  if (inv.status === "draft" || inv.status === "void") {
    return {
      ok: false,
      reason: "Corrections apply to sent, partial, or paid invoices only.",
    };
  }
  const status: StoredInvoiceStatus =
    exactCents === 0
      ? "sent"
      : exactCents >= inv.totalCents
        ? "paid"
        : "partial";
  return { ok: true, paidCents: exactCents, status };
}

// The audit-preserving delta for the correction: recorded as an adjustment
// Payment row so sum(payments) always equals paidCents.
export function correctionDeltaCents(
  currentPaidCents: number,
  exactCents: number,
): number {
  return exactCents - currentPaidCents;
}

// ── Deposit shortfall ──
// PS rule: "record deposit" pays the SHORTFALL to reach the deposit figure,
// not a fixed amount — if the customer already paid part of it, only the
// remainder is collected; if the deposit is already covered, nothing is due.
export function depositShortfallCents(
  depositCents: number,
  paidCents: number,
): number {
  return Math.max(0, depositCents - paidCents);
}

// ── Void ──
export type VoidResult =
  | { changed: false }
  | { changed: true; status: "void"; voidedAt: Date; voidReason: string };

export function voidInvoice(
  inv: Pick<InvoiceMoneyState, "status">,
  reason: string,
  now: Date = new Date(),
): VoidResult {
  if (inv.status === "void") return { changed: false }; // idempotent
  return {
    changed: true,
    status: "void",
    voidedAt: now,
    voidReason: reason.trim() || "(no reason given)",
  };
}
