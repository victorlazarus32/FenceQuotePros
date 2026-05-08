"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import {
  saveContractorProfile,
  type SaveProfileState,
} from "@/app/estimates/permitDocActions";

interface Props {
  initial: {
    name: string | null;
    companyName: string | null;
    phone: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    licenseNumber: string | null;
    qualifierLast4: string | null;
  };
}

export function ContractorProfileForm({ initial }: Props) {
  const [state, formAction, pending] = useActionState<
    SaveProfileState,
    FormData
  >(saveContractorProfile, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          name="companyName"
          label="Contractor Name (company)"
          defaultValue={initial.companyName ?? ""}
          placeholder="Allday Fence Co."
        />
        <Field
          name="name"
          label="Qualifier Name"
          defaultValue={initial.name ?? ""}
          placeholder="Victor Moreno"
        />
        <Field
          name="licenseNumber"
          label="Contractor No. (full license #)"
          defaultValue={initial.licenseNumber ?? ""}
          placeholder="CGC1518234"
        />
        <Field
          name="qualifierLast4"
          label="Last 4 digits of Qualifier No."
          defaultValue={initial.qualifierLast4 ?? ""}
          placeholder="1234"
          maxLength={8}
          inputMode="numeric"
        />
        <Field
          name="phone"
          label="Phone"
          defaultValue={initial.phone ?? ""}
          placeholder="305-555-1212"
        />
      </div>

      <Field
        name="addressLine1"
        label="Business Address"
        defaultValue={initial.addressLine1 ?? ""}
        placeholder="100 SW 1st St"
      />
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_140px] gap-3">
        <Field
          name="city"
          label="City"
          defaultValue={initial.city ?? ""}
          placeholder="Miami"
        />
        <Field
          name="state"
          label="State"
          defaultValue={initial.state ?? ""}
          placeholder="FL"
          maxLength={6}
        />
        <Field
          name="zip"
          label="Zip"
          defaultValue={initial.zip ?? ""}
          placeholder="33125"
        />
      </div>

      {state.message && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {state.message}
        </div>
      )}
      {state.ok && (
        <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2">
          Saved.
        </div>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  maxLength,
  inputMode,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className="w-full mt-1"
      />
    </label>
  );
}
