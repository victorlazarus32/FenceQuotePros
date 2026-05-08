"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import {
  sendEstimateProposal,
  type SendProposalState,
} from "@/app/estimates/actions";

export function SendProposalButton({
  estimateId,
  hasShareToken,
  hasClientEmail,
}: {
  estimateId: string;
  hasShareToken: boolean;
  hasClientEmail: boolean;
}) {
  const [state, formAction, pending] = useActionState<
    SendProposalState,
    FormData
  >(sendEstimateProposal, {});

  const label = pending
    ? "Sending…"
    : hasShareToken
      ? "Resend proposal"
      : "Send proposal";

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="estimateId" value={estimateId} />
      <Button
        type="submit"
        size="sm"
        disabled={pending || !hasClientEmail}
        title={
          hasClientEmail
            ? undefined
            : "Customer has no email — add one to the customer record first."
        }
      >
        ✉ {label}
      </Button>
      {state.message && (
        <p className="text-xs text-red-600 max-w-xs text-right">
          {state.message}
        </p>
      )}
      {state.ok && state.shareUrl && (
        <p className="text-xs text-slate-500 max-w-xs text-right">
          Queued · share link:{" "}
          <a
            href={state.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono break-all hover:text-brand"
          >
            {state.shareUrl}
          </a>
        </p>
      )}
    </form>
  );
}
