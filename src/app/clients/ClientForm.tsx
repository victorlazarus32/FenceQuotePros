"use client";

import { useActionState, useState } from "react";
import { Button, LinkButton } from "@/components/Button";
import type { ClientFormState } from "./actions";

// US phone formatter — strips non-digits, drops a leading "1" country code,
// then injects hyphens at the standard 3-3-4 split as the user types.
// "3057268324" → "305-726-8324", "305" → "305", "30572" → "305-72".
function formatUsPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

type Initial = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  folioNumber?: string | null;
  hoaRequired?: boolean | null;
  hoaName?: string | null;
  hoaContactName?: string | null;
  hoaContactEmail?: string | null;
  hoaContactPhone?: string | null;
  hoaSubmissionUrl?: string | null;
  hoaNotes?: string | null;
  notes?: string | null;
};

export function ClientForm({
  action,
  initial,
  cancelHref,
  submitLabel,
}: {
  action: (prev: ClientFormState, fd: FormData) => Promise<ClientFormState>;
  initial?: Initial;
  cancelHref: string;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(
    action,
    {},
  );
  const [phone, setPhone] = useState(formatUsPhone(initial?.phone ?? ""));
  const [hoaRequired, setHoaRequired] = useState<boolean>(initial?.hoaRequired ?? false);
  const [hoaContactPhone, setHoaContactPhone] = useState(
    formatUsPhone(initial?.hoaContactPhone ?? ""),
  );

  return (
    <form action={formAction} className="space-y-5 bg-white rounded-lg border border-slate-200 p-6">
      <Field label="Name" name="name" required defaultValue={initial?.name} error={state.errors?.name?.[0]} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(formatUsPhone(e.target.value))}
            inputMode="tel"
            autoComplete="tel"
            placeholder="305-726-8324"
            maxLength={12}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <Field label="Email" name="email" defaultValue={initial?.email} type="email" error={state.errors?.email?.[0]} />
      </div>
      <Field label="Street address" name="addressLine1" defaultValue={initial?.addressLine1} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="City" name="city" defaultValue={initial?.city} />
        <Field label="State" name="state" defaultValue={initial?.state} />
        <Field label="Zip" name="zip" defaultValue={initial?.zip} />
      </div>
      <Field
        label="Folio / parcel number"
        name="folioNumber"
        defaultValue={initial?.folioNumber}
        placeholder="e.g. 30-3033-024-0010 (Miami-Dade)"
        helperText="Property folio / parcel ID — pulls onto permit applications."
      />

      <div className="border-t border-slate-200 pt-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="hoaRequired"
            checked={hoaRequired}
            onChange={(e) => setHoaRequired(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
          />
          <span>
            <span className="block text-sm font-medium text-slate-800">
              This property is in an HOA
            </span>
            <span className="block text-xs text-slate-500">
              Flag this job for ARC approval. We&apos;ll surface it on the
              estimate and pull contact details onto the HOA application packet.
            </span>
          </span>
        </label>

        {hoaRequired && (
          <div className="mt-4 space-y-4 bg-slate-50 border border-slate-200 rounded-md p-4">
            <Field
              label="HOA / association name"
              name="hoaName"
              defaultValue={initial?.hoaName}
              placeholder="e.g. Doral Isles Master Association"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Contact name"
                name="hoaContactName"
                defaultValue={initial?.hoaContactName}
                placeholder="ARC chair / community manager"
              />
              <Field
                label="Contact email"
                name="hoaContactEmail"
                defaultValue={initial?.hoaContactEmail}
                type="email"
                error={state.errors?.hoaContactEmail?.[0]}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contact phone
                </label>
                <input
                  type="tel"
                  name="hoaContactPhone"
                  value={hoaContactPhone}
                  onChange={(e) => setHoaContactPhone(formatUsPhone(e.target.value))}
                  inputMode="tel"
                  placeholder="305-555-0100"
                  maxLength={12}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
              <Field
                label="Submission portal URL"
                name="hoaSubmissionUrl"
                defaultValue={initial?.hoaSubmissionUrl}
                placeholder="https://…"
                error={state.errors?.hoaSubmissionUrl?.[0]}
                helperText="Online ARC portal, if the HOA uses one."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                HOA notes
              </label>
              <textarea
                name="hoaNotes"
                defaultValue={initial?.hoaNotes ?? ""}
                rows={2}
                placeholder="Setback rules, approved colors, neighbor sign-off needed, etc."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          name="notes"
          defaultValue={initial?.notes ?? ""}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
        />
      </div>

      {state.message && (
        <p className="text-sm text-red-600" aria-live="polite">{state.message}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <LinkButton href={cancelHref} variant="secondary">Cancel</LinkButton>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  error,
  placeholder,
  helperText,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
  error?: string;
  placeholder?: string;
  helperText?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-red-600"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
      />
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
