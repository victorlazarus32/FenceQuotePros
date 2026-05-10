"use client";

import { useActionState } from "react";
import { Button, LinkButton } from "@/components/Button";
import type { HoaTemplateFormState } from "../actions";

export function NewHoaTemplateForm({
  action,
}: {
  action: (
    prev: HoaTemplateFormState,
    fd: FormData,
  ) => Promise<HoaTemplateFormState>;
}) {
  const [state, formAction, pending] = useActionState<
    HoaTemplateFormState,
    FormData
  >(action, {});

  return (
    <form
      action={formAction}
      className="space-y-5 bg-white rounded-lg border border-slate-200 p-6"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Association name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          maxLength={160}
          placeholder="e.g. Doral Isles Master Association"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
        />
        {state.errors?.name?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          ARC application PDF <span className="text-red-600">*</span>
        </label>
        <input
          type="file"
          name="pdf"
          accept="application/pdf"
          required
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded file:border file:border-slate-300 file:bg-slate-50 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-100"
        />
        <p className="mt-1 text-xs text-slate-500">
          AcroForm-fillable PDFs work best — we read the field names directly.
          Flat scans can still be used but will leave every field blank for
          manual entry on the signing page. Max 8 MB.
        </p>
      </div>

      {state.message && (
        <p className="text-sm text-red-600" aria-live="polite">
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <LinkButton href="/hoa-templates" variant="secondary">
          Cancel
        </LinkButton>
        <Button type="submit" disabled={pending}>
          {pending ? "Uploading…" : "Upload + extract fields"}
        </Button>
      </div>
    </form>
  );
}
