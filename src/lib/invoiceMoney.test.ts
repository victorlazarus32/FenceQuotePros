import { describe, expect, it } from "vitest";
import {
  applyPayment,
  canEditInvoice,
  canRecordPayment,
  canSendInvoice,
  correctionDeltaCents,
  displayInvoiceStatus,
  isInvoiceOverdue,
  setExactPaid,
  voidInvoice,
} from "./invoiceMoney";

// Fixed "now": Thursday 2026-07-02 14:30 local.
const NOW = new Date(2026, 6, 2, 14, 30, 0);

describe("isInvoiceOverdue (derived, never stored)", () => {
  it("sent + due date in the past → overdue", () => {
    expect(
      isInvoiceOverdue({ status: "sent", dueDate: new Date(2026, 6, 1) }, NOW),
    ).toBe(true);
  });
  it("partial + past due → overdue", () => {
    expect(
      isInvoiceOverdue({ status: "partial", dueDate: new Date(2026, 5, 15) }, NOW),
    ).toBe(true);
  });
  it("due TODAY is not overdue yet (date-level grace)", () => {
    expect(
      isInvoiceOverdue({ status: "sent", dueDate: new Date(2026, 6, 2, 0, 0) }, NOW),
    ).toBe(false);
  });
  it("due yesterday 23:59 IS overdue at 00:01 today", () => {
    const justAfterMidnight = new Date(2026, 6, 2, 0, 1);
    expect(
      isInvoiceOverdue(
        { status: "sent", dueDate: new Date(2026, 6, 1, 23, 59) },
        justAfterMidnight,
      ),
    ).toBe(true);
  });
  it("future due date → not overdue", () => {
    expect(
      isInvoiceOverdue({ status: "sent", dueDate: new Date(2026, 7, 1) }, NOW),
    ).toBe(false);
  });
  it("paid invoices are never overdue, even past due date", () => {
    expect(
      isInvoiceOverdue({ status: "paid", dueDate: new Date(2026, 0, 1) }, NOW),
    ).toBe(false);
  });
  it("void invoices are never overdue", () => {
    expect(
      isInvoiceOverdue({ status: "void", dueDate: new Date(2026, 0, 1) }, NOW),
    ).toBe(false);
  });
  it("draft invoices are never overdue", () => {
    expect(
      isInvoiceOverdue({ status: "draft", dueDate: new Date(2026, 0, 1) }, NOW),
    ).toBe(false);
  });
  it("no due date → never overdue", () => {
    expect(isInvoiceOverdue({ status: "sent", dueDate: null }, NOW)).toBe(false);
  });
  it("accepts ISO-string due dates", () => {
    expect(
      isInvoiceOverdue({ status: "sent", dueDate: "2026-01-01T00:00:00.000Z" }, NOW),
    ).toBe(true);
  });
});

describe("displayInvoiceStatus", () => {
  it("shows overdue for a past-due sent invoice", () => {
    expect(
      displayInvoiceStatus({ status: "sent", dueDate: new Date(2026, 5, 1) }, NOW),
    ).toBe("overdue");
  });
  it("passes through stored status otherwise", () => {
    for (const s of ["draft", "paid", "void", "partial"]) {
      expect(displayInvoiceStatus({ status: s, dueDate: null }, NOW)).toBe(s);
    }
  });
});

describe("guards", () => {
  it("only drafts are editable", () => {
    expect(canEditInvoice("draft")).toBe(true);
    for (const s of ["sent", "partial", "paid", "void"]) {
      expect(canEditInvoice(s)).toBe(false);
    }
  });
  it("payments allowed on sent/partial/paid, not draft/void", () => {
    for (const s of ["sent", "partial", "paid"]) {
      expect(canRecordPayment(s)).toBe(true);
    }
    expect(canRecordPayment("draft")).toBe(false);
    expect(canRecordPayment("void")).toBe(false);
  });
  it("void invoices can't be sent", () => {
    expect(canSendInvoice("void")).toBe(false);
    expect(canSendInvoice("draft")).toBe(true);
  });
});

describe("applyPayment (additive)", () => {
  const inv = { status: "sent", totalCents: 10_000, paidCents: 0 };

  it("partial payment → partial", () => {
    const r = applyPayment(inv, 4_000);
    expect(r).toEqual({ ok: true, paidCents: 4_000, status: "partial" });
  });
  it("payments accumulate; reaching total → paid", () => {
    const first = applyPayment(inv, 4_000);
    if (!first.ok) throw new Error("unreachable");
    const second = applyPayment(
      { status: first.status, totalCents: 10_000, paidCents: first.paidCents },
      6_000,
    );
    expect(second).toEqual({ ok: true, paidCents: 10_000, status: "paid" });
  });
  it("exact-to-the-cent payoff is paid — no float epsilon needed", () => {
    // PS needed amount_paid + 0.005 >= total in float dollars. Integer
    // cents make 9999 + 1 === 10000 exact.
    const r = applyPayment({ ...inv, paidCents: 9_999 }, 1);
    expect(r).toEqual({ ok: true, paidCents: 10_000, status: "paid" });
  });
  it("overpayment still lands on paid", () => {
    const r = applyPayment(inv, 12_500);
    expect(r).toEqual({ ok: true, paidCents: 12_500, status: "paid" });
  });
  it("rejects zero, negative, and fractional cents", () => {
    expect(applyPayment(inv, 0).ok).toBe(false);
    expect(applyPayment(inv, -500).ok).toBe(false);
    expect(applyPayment(inv, 10.5).ok).toBe(false);
  });
  it("rejects payments on drafts (send first)", () => {
    expect(applyPayment({ ...inv, status: "draft" }, 1_000).ok).toBe(false);
  });
  it("rejects payments on void invoices", () => {
    expect(applyPayment({ ...inv, status: "void" }, 1_000).ok).toBe(false);
  });
});

describe("setExactPaid (correction path)", () => {
  const inv = { status: "paid", totalCents: 10_000 };

  it("correcting to zero walks status BACKWARD to sent", () => {
    expect(setExactPaid(inv, 0)).toEqual({
      ok: true,
      paidCents: 0,
      status: "sent",
    });
  });
  it("correcting to a partial figure → partial", () => {
    expect(setExactPaid(inv, 2_500)).toEqual({
      ok: true,
      paidCents: 2_500,
      status: "partial",
    });
  });
  it("correcting to exactly total → paid", () => {
    expect(setExactPaid(inv, 10_000)).toEqual({
      ok: true,
      paidCents: 10_000,
      status: "paid",
    });
  });
  it("rejects negatives and non-integers", () => {
    expect(setExactPaid(inv, -1).ok).toBe(false);
    expect(setExactPaid(inv, 99.9).ok).toBe(false);
  });
  it("rejects corrections on draft and void", () => {
    expect(setExactPaid({ status: "draft", totalCents: 10_000 }, 0).ok).toBe(false);
    expect(setExactPaid({ status: "void", totalCents: 10_000 }, 0).ok).toBe(false);
  });
  it("correctionDeltaCents keeps sum(payments) == paidCents", () => {
    expect(correctionDeltaCents(9_000, 4_500)).toBe(-4_500); // negative adjustment row
    expect(correctionDeltaCents(0, 2_000)).toBe(2_000);
    expect(correctionDeltaCents(5_000, 5_000)).toBe(0);
  });
});

describe("voidInvoice", () => {
  it("voids with reason + timestamp", () => {
    const r = voidInvoice({ status: "sent" }, "duplicate billing", NOW);
    expect(r).toEqual({
      changed: true,
      status: "void",
      voidedAt: NOW,
      voidReason: "duplicate billing",
    });
  });
  it("void is idempotent — voiding a void changes nothing", () => {
    expect(voidInvoice({ status: "void" }, "again", NOW)).toEqual({
      changed: false,
    });
  });
  it("paid → void is allowed (refund case)", () => {
    const r = voidInvoice({ status: "paid" }, "refunded in full", NOW);
    expect(r.changed).toBe(true);
  });
  it("blank reason gets an explicit placeholder", () => {
    const r = voidInvoice({ status: "sent" }, "   ", NOW);
    if (!r.changed) throw new Error("unreachable");
    expect(r.voidReason).toBe("(no reason given)");
  });
});
