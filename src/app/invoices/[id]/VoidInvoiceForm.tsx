"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/Button";
import { voidInvoiceAction, type VoidInvoiceState } from "../actions";

// Void is destructive-adjacent (terminal), so it's a two-step affordance:
// the button reveals a reason field + confirm, never a one-click void.
export function VoidInvoiceForm({ invoiceId }: { invoiceId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    VoidInvoiceState,
    FormData
  >(voidInvoiceAction, {});

  if (!open) {
    return (
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Void…
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="inline-flex items-center gap-2 flex-wrap"
    >
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <input
        name="reason"
        placeholder="Reason (e.g. duplicate, refunded)"
        required
        maxLength={200}
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <Button type="submit" variant="danger" size="sm" disabled={pending}>
        {pending ? "Voiding…" : "Confirm void"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
      >
        Cancel
      </Button>
      {state.message && (
        <span className="text-xs text-slate-500">{state.message}</span>
      )}
    </form>
  );
}
