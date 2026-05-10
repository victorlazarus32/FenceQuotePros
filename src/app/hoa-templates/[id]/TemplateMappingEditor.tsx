"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, LinkButton } from "@/components/Button";
import {
  HOA_DEFAULT_SOURCE_LABELS,
  type HoaFieldMapping,
  type HoaDefaultSource,
} from "@/lib/hoaTemplates";
import { updateHoaTemplate, deleteHoaTemplate } from "../actions";

const DEFAULT_SOURCE_OPTIONS = Object.entries(HOA_DEFAULT_SOURCE_LABELS) as Array<
  [HoaDefaultSource, string]
>;

interface Initial {
  name: string;
  ownerSignatureFieldName: string | null;
  contractorSignatureFieldName: string | null;
  requiresOwnerSignature: boolean;
  requiresContractorSignature: boolean;
  mappings: HoaFieldMapping[];
}

export function TemplateMappingEditor({
  templateId,
  initial,
}: {
  templateId: string;
  initial: Initial;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(initial.name);
  const [ownerSig, setOwnerSig] = useState(initial.ownerSignatureFieldName ?? "");
  const [contractorSig, setContractorSig] = useState(
    initial.contractorSignatureFieldName ?? "",
  );
  const [requiresOwnerSig, setRequiresOwnerSig] = useState(
    initial.requiresOwnerSignature,
  );
  const [requiresContractorSig, setRequiresContractorSig] = useState(
    initial.requiresContractorSignature,
  );
  const [mappings, setMappings] = useState<HoaFieldMapping[]>(initial.mappings);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateMapping = (idx: number, patch: Partial<HoaFieldMapping>) => {
    setMappings((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    );
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateHoaTemplate(templateId, {
        name,
        ownerSignatureFieldName: ownerSig || null,
        contractorSignatureFieldName: contractorSig || null,
        requiresOwnerSignature: requiresOwnerSig,
        requiresContractorSignature: requiresContractorSig,
        mappings,
      });
      if (res.ok) {
        setSavedAt(new Date());
      } else {
        setError(res.message ?? "Save failed.");
      }
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        "Delete this HOA template? Any clients pointing at it will be unassigned.",
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteHoaTemplate(templateId);
      router.push("/hoa-templates");
    });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Association name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
      </section>

      <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <header>
          <h2 className="font-medium">Signatures</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Match each role to a signature field name from the source PDF, or
            uncheck the role if the form doesn&apos;t need it.
          </p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={requiresOwnerSig}
                onChange={(e) => setRequiresOwnerSig(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <span className="text-sm font-medium text-slate-700">
                Owner signature required
              </span>
            </label>
            <input
              type="text"
              value={ownerSig}
              onChange={(e) => setOwnerSig(e.target.value)}
              disabled={!requiresOwnerSig}
              placeholder="AcroForm signature field name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-brand focus:ring-1 focus:ring-brand disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={requiresContractorSig}
                onChange={(e) => setRequiresContractorSig(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <span className="text-sm font-medium text-slate-700">
                Contractor signature required
              </span>
            </label>
            <input
              type="text"
              value={contractorSig}
              onChange={(e) => setContractorSig(e.target.value)}
              disabled={!requiresContractorSig}
              placeholder="AcroForm signature field name"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-brand focus:ring-1 focus:ring-brand disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-slate-200">
        <header className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-medium">Field mappings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mappings.length === 0
              ? "No AcroForm fields detected in this PDF. Re-upload a fillable version, or signers will fill it out manually after download."
              : `${mappings.length} field${mappings.length === 1 ? "" : "s"} extracted. Pick a data source for each, paste a static value, or leave blank for the signer to fill in.`}
          </p>
        </header>
        {mappings.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {mappings.map((m, idx) => (
              <li key={`${m.formFieldName}-${idx}`} className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500">
                      {m.kind}
                    </div>
                    <div className="font-mono text-sm break-all">
                      {m.formFieldName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={m.defaultFrom ?? ""}
                      onChange={(e) =>
                        updateMapping(idx, {
                          defaultFrom: e.target.value
                            ? (e.target.value as HoaDefaultSource)
                            : undefined,
                        })
                      }
                      className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                    >
                      <option value="">— Leave blank for signer —</option>
                      {DEFAULT_SOURCE_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={m.staticValue ?? ""}
                      onChange={(e) =>
                        updateMapping(idx, {
                          staticValue: e.target.value || undefined,
                        })
                      }
                      placeholder={
                        m.kind === "checkbox"
                          ? 'Static value (e.g. "yes" to always check)'
                          : "Static value (overrides data source)"
                      }
                      className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p className="text-sm text-red-600" aria-live="polite">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Delete template
        </button>
        <div className="flex items-center gap-3">
          {savedAt && (
            <span className="text-xs text-slate-500">
              Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
          <LinkButton href="/hoa-templates" variant="secondary">
            Back
          </LinkButton>
          <Button type="button" onClick={handleSave} disabled={pending}>
            {pending ? "Saving…" : "Save mappings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
