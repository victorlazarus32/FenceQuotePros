"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { correctPaidAmount, type CorrectPaymentState } from "../actions";

// Exact-set correction for double/mistaken payment entries. Writes an
// adjustment payment row for the delta (audit trail) and can walk status
// backward — correcting to $0 returns a "paid" invoice to "sent".
export function CorrectPaymentForm({
  invoiceId,
  currentPaidDollars,
}: {
  invoiceId: string;
  currentPaidDollars: string;
}) {
  const [state, formAction, pending] = useActionState<
    CorrectPaymentState,
    FormData
  >(correctPaidAmount, {});

  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer text-slate-500 hover:text-ink">
        Fix recorded total (double-entry / mistake)
      </summary>
      <form
        action={formAction}
        className="mt-2 flex items-center gap-2 flex-wrap"
      >
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <label htmlFor="exactAmount" className="text-slate-600">
          Total actually received: $
        </label>
        <input
          id="exactAmount"
          name="exactAmount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={currentPaidDollars}
          required
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm w-32 tabular-nums focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "Correcting…" : "Set exact total"}
        </Button>
        {state.message && (
          <span className="text-xs text-slate-500">{state.message}</span>
        )}
      </form>
      <p className="text-xs text-slate-400 mt-1">
        Records an adjustment entry for the difference — payment history stays
        auditable. Setting $0 returns the invoice to “sent”.
      </p>
    </details>
  );
}
