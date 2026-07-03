"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import {
  recordDepositShortfall,
  type DepositActionState,
} from "../actions";

const METHODS = ["zelle", "check", "cash", "card", "ach", "other"] as const;

// One-click deposit collection: pays the shortfall to reach the deposit
// figure from the linked estimate (deposit − already-paid).
export function DepositQuickCollect({
  invoiceId,
  shortfallDisplay,
}: {
  invoiceId: string;
  shortfallDisplay: string;
}) {
  const [state, formAction, pending] = useActionState<
    DepositActionState,
    FormData
  >(recordDepositShortfall, {});

  return (
    <form
      action={formAction}
      className="flex items-center gap-2 flex-wrap rounded-md border border-teal-200 bg-teal-50 px-3 py-2"
    >
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <span className="text-sm text-teal-900 font-medium">
        Deposit due: {shortfallDisplay}
      </span>
      <select
        name="method"
        defaultValue="zelle"
        className="rounded-md border border-slate-300 px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand"
      >
        {METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Recording…" : "Record deposit"}
      </Button>
      {state.message && (
        <span className="text-xs text-slate-600">{state.message}</span>
      )}
    </form>
  );
}
