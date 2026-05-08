"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { SignaturePad, type SignaturePadHandle } from "@/components/SignaturePad";
import {
  saveContractorSignature,
  type SaveSigState,
} from "@/app/estimates/permitDocActions";

export function ContractorSignatureForm({
  initialName = "",
  hasExisting = false,
  existingDataUrl,
  existingName,
  existingSavedAt,
}: {
  initialName?: string;
  hasExisting?: boolean;
  existingDataUrl?: string | null;
  existingName?: string | null;
  existingSavedAt?: Date | string | null;
}) {
  const [state, formAction, pending] = useActionState<SaveSigState, FormData>(
    saveContractorSignature,
    {},
  );
  const padRef = useRef<SignaturePadHandle | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(!hasExisting);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!editing && hasExisting && existingDataUrl) {
    const when = existingSavedAt
      ? new Date(existingSavedAt).toLocaleDateString("en-US", {
          dateStyle: "long",
        })
      : "";
    return (
      <div className="space-y-4">
        <div className="bg-white rounded border-2 border-line p-4 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingDataUrl}
            alt="Saved signature"
            className="max-h-32 block"
          />
        </div>
        <div className="text-sm text-slate-600">
          Saved as <span className="font-semibold text-ink">{existingName}</span>
          {when && <> on {when}.</>}
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Replace signature
        </Button>
      </div>
    );
  }

  function handleSubmit(formData: FormData) {
    const dataUrl = padRef.current?.toDataUrl();
    if (!dataUrl) {
      setLocalError("Please draw your signature first.");
      return;
    }
    formData.set("signatureDataUrl", dataUrl);
    formData.set("signatureName", name);
    setLocalError(null);
    formAction(formData);
  }

  const error = localError ?? state.message ?? null;
  const success = state.ok;

  return (
    <form action={handleSubmit} className="space-y-4">
      <SignaturePad
        ariaLabel="Your signature"
        placeholder="Sign here"
        onChange={setHasInk}
        ref={padRef}
      />
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1">
          Print full name (used as the typed signature name)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full legal name"
          required
          minLength={2}
          className="w-full"
        />
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2">
          Signature saved.
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={pending || !hasInk || name.trim().length < 2}
        >
          {pending ? "Saving…" : "Save signature"}
        </Button>
        {hasExisting && (
          <Button
            variant="secondary"
            type="button"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
