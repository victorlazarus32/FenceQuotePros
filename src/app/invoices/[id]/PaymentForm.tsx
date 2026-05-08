"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { recordPayment, type PaymentFormState } from "../actions";

export function PaymentForm({
  invoiceId,
  remainingCents,
}: {
  invoiceId: string;
  remainingCents: number;
}) {
  const action = recordPayment.bind(null, invoiceId);
  const [state, formAction, pending] = useActionState<
    PaymentFormState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-wide text-slate-500 font-medium mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            name="amount"
            min={0.01}
            defaultValue={(remainingCents / 100).toFixed(2)}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {state.errors?.amount?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.errors.amount[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-slate-500 font-medium mb-1">
            Method
          </label>
          <select
            name="method"
            defaultValue="check"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="card">Card</option>
            <option value="ach">ACH / bank transfer</option>
            <option value="zelle">Zelle</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="reference"
          placeholder="Reference (e.g. check #1042)"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="notes"
          placeholder="Notes (optional)"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center justify-between">
        {state.message && (
          <p className="text-sm text-slate-600" aria-live="polite">{state.message}</p>
        )}
        <Button type="submit" size="sm" disabled={pending} className="ml-auto">
          {pending ? "Recording…" : "Record payment"}
        </Button>
      </div>
    </form>
  );
}
