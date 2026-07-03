// Shared form fields for the contract-template new/edit pages. Server-
// component friendly (plain inputs; the page wraps them in a <form> bound
// to a server action).

import { STANDARD_VARIABLES } from "@/lib/contractTemplates";

export function TemplateFormFields({
  defaults,
}: {
  defaults?: {
    name: string;
    body: string;
    isDefaultEstimate: boolean;
    isDefaultInvoice: boolean;
  };
}) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={defaults?.name ?? ""}
          placeholder="e.g. Standard residential terms"
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      <div>
        <label
          htmlFor="body"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Body
        </label>
        <textarea
          id="body"
          name="body"
          required
          maxLength={10000}
          rows={12}
          defaultValue={defaults?.body ?? ""}
          placeholder={`50% deposit ({{deposit}}) due upon acceptance; balance due upon completion.\nWorkmanship warranty: 2 years. Materials per manufacturer warranty.\n…`}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <p className="text-xs text-slate-400 mt-1">
          Available variables:{" "}
          <span className="font-mono">
            {STANDARD_VARIABLES.map((v) => `{{${v}}}`).join(" ")}
          </span>{" "}
          — unknown variables stay visible on the document so gaps are
          obvious.
        </p>
      </div>

      <div className="flex gap-6 flex-wrap text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isDefaultEstimate"
            defaultChecked={defaults?.isDefaultEstimate ?? false}
            className="rounded border-slate-300 accent-[var(--brand)]"
          />
          Default for new estimates
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isDefaultInvoice"
            defaultChecked={defaults?.isDefaultInvoice ?? false}
            className="rounded border-slate-300 accent-[var(--brand)]"
          />
          Default for invoices
        </label>
      </div>
      <p className="text-xs text-slate-400">
        Only one template can be the default for each — checking these moves
        the flag here.
      </p>
    </div>
  );
}
