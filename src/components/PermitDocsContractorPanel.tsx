"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Download, FileSignature, FileText, RotateCcw, Wand2 } from "lucide-react";
import {
  contractorSignPermitDocument,
  demoCompletePermitPacket,
  setPermitValueOfWork,
  togglePermitAutoTrigger,
  triggerPermitDocsManually,
} from "@/app/estimates/permitDocActions";
import { Button } from "@/components/Button";

interface DocRow {
  id: string;
  templateSlug: string;
  templateName: string;
  templateSourcePdfFilename: string;
  status: string;
  ownerSignedAt: Date | string | null;
  ownerSignedByName: string | null;
  contractorSignedAt: Date | string | null;
  contractorRequired: boolean;
  generatedPdfKey: string | null;
  hasContractorSavedSig: boolean;
}

export function PermitDocsContractorPanel({
  estimateId,
  estimateSigned,
  permitDocsAutoTrigger,
  permitDocsTriggeredAt,
  permitValueOfWorkDollars,
  estimateTotalDollars,
  documents,
  showDemoButton,
}: {
  estimateId: string;
  estimateSigned: boolean;
  permitDocsAutoTrigger: boolean;
  permitDocsTriggeredAt: Date | string | null;
  /** Current override (string like "1500.00") or empty when using fallback. */
  permitValueOfWorkDollars: string;
  /** Estimate total formatted as plain dollars — shown as fallback hint. */
  estimateTotalDollars: string;
  documents: DocRow[];
  showDemoButton?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [autoTrigger, setAutoTrigger] = useState(permitDocsAutoTrigger);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);
  const [valueInput, setValueInput] = useState(permitValueOfWorkDollars);
  const [valueMessage, setValueMessage] = useState<string | null>(null);

  function onToggle(next: boolean) {
    setAutoTrigger(next);
    startTransition(async () => {
      await togglePermitAutoTrigger(estimateId, next);
    });
  }

  function onTriggerNow() {
    startTransition(async () => {
      await triggerPermitDocsManually(estimateId);
    });
  }

  function onContractorSign(documentId: string) {
    startTransition(async () => {
      await contractorSignPermitDocument(documentId);
    });
  }

  function onSaveValue() {
    setValueMessage(null);
    startTransition(async () => {
      const result = await setPermitValueOfWork(estimateId, valueInput);
      if (!result.ok) {
        setValueMessage(result.message ?? "Couldn't save.");
      } else {
        setValueMessage("Saved.");
      }
    });
  }

  function onDemoComplete() {
    setDemoMessage(null);
    startTransition(async () => {
      const result = await demoCompletePermitPacket(estimateId);
      if (!result.ok) {
        setDemoMessage(result.message ?? "Demo run failed.");
      } else {
        setDemoMessage("Demo packet generated. Download links below.");
      }
    });
  }

  const hasTriggered = Boolean(permitDocsTriggeredAt);

  return (
    <div className="rounded-lg border-2 border-line bg-white p-5 no-print">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-brand" />
            <h3 className="h-card text-ink">Permit packet</h3>
          </div>
          <p className="text-sm text-slate-600 mt-1 max-w-md">
            Documents sent to the customer for signature after the estimate is
            accepted. Each one renders to PDF once both signatures are in.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={autoTrigger}
            onChange={(e) => onToggle(e.target.checked)}
            className="!w-4 !h-4"
          />
          Auto-send on signing
        </label>
      </div>

      <div className="mt-4 flex items-end gap-3 flex-wrap rounded border border-line bg-paper p-3">
        <div className="grow min-w-[200px]">
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Value of Work (on every permit)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
              placeholder={estimateTotalDollars}
              className="w-full"
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Leave blank to use the estimate total ({estimateTotalDollars}).
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={onSaveValue}
          disabled={pending}
        >
          {pending ? "Saving…" : "Save value"}
        </Button>
        {valueMessage && (
          <div className="text-xs text-slate-700 ml-1">{valueMessage}</div>
        )}
      </div>

      {!estimateSigned && !hasTriggered && (
        <div className="mt-4 rounded border border-line bg-paper p-3 text-sm text-slate-600">
          Documents will appear here once the customer signs the estimate
          {autoTrigger ? "." : " — or trigger manually below."}
          {!autoTrigger && (
            <div className="mt-2">
              <Button
                variant="secondary"
                onClick={onTriggerNow}
                disabled={pending}
              >
                Send permit docs now
              </Button>
            </div>
          )}
        </div>
      )}

      {documents.length === 0 && hasTriggered && (
        <div className="mt-4 rounded border border-line bg-paper p-3 text-sm text-slate-600">
          No applicable permit documents for this estimate. (No fence type
          and jurisdiction combination matched a template.)
        </div>
      )}

      {documents.length > 0 && (
        <ul className="mt-4 space-y-2">
          {documents.map((d) => (
            <DocRowView
              key={d.id}
              row={d}
              onContractorSign={() => onContractorSign(d.id)}
              pending={pending}
            />
          ))}
        </ul>
      )}

      {!hasTriggered && estimateSigned && (
        <div className="mt-4">
          <Button onClick={onTriggerNow} disabled={pending}>
            {pending ? "Sending…" : "Send permit docs now"}
          </Button>
        </div>
      )}
      {hasTriggered && (
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={onTriggerNow}
            disabled={pending}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Re-check applicable documents
          </Button>
        </div>
      )}

      {showDemoButton && (
        <div className="mt-6 rounded border-2 border-dashed border-amber-400 bg-amber-50 p-3">
          <div className="text-xs uppercase tracking-wider text-amber-800 font-bold mb-1">
            Dev mode — test the workflow
          </div>
          <div className="text-sm text-slate-700 mb-3">
            One click: enqueue any missing docs, stamp placeholder signatures
            (uses your saved signature for both owner + contractor), fill
            sample data, and render every PDF.
          </div>
          <Button
            variant="secondary"
            onClick={onDemoComplete}
            disabled={pending}
          >
            <Wand2 className="w-4 h-4 mr-1" />
            {pending ? "Running…" : "Demo: complete packet"}
          </Button>
          {demoMessage && (
            <div className="mt-2 text-sm text-slate-700">{demoMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}

function DocRowView({
  row,
  onContractorSign,
  pending,
}: {
  row: DocRow;
  onContractorSign: () => void;
  pending: boolean;
}) {
  const ownerDone = Boolean(row.ownerSignedAt);
  const contractorDone = Boolean(row.contractorSignedAt);
  const completed = row.status === "completed" && row.generatedPdfKey;
  const failed = row.status === "render_failed";

  return (
    <li className="rounded border border-line bg-paper p-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="font-semibold text-sm text-ink">
            {row.templateName}
          </div>
          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <Pill ok={ownerDone}>
                {ownerDone
                  ? `Owner signed${row.ownerSignedByName ? ` — ${row.ownerSignedByName}` : ""}`
                  : "Owner pending"}
              </Pill>
              {row.contractorRequired && (
                <Pill ok={contractorDone}>
                  {contractorDone ? "Contractor signed" : "Contractor pending"}
                </Pill>
              )}
              {completed && <Pill ok>PDF ready</Pill>}
              {failed && <Pill error>Render failed</Pill>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {row.contractorRequired && !contractorDone && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onContractorSign}
              disabled={pending || !row.hasContractorSavedSig}
              title={
                row.hasContractorSavedSig
                  ? undefined
                  : "Save a signature on your profile first."
              }
            >
              Sign as contractor
            </Button>
          )}
          {completed && row.generatedPdfKey && (
            <Link
              href={`/api/permit-docs/${row.id}/pdf`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-ink"
            >
              <Download className="w-4 h-4" />
              Download
            </Link>
          )}
          <Link
            href={`/forms/${row.templateSourcePdfFilename}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-ink"
            title="View blank form"
          >
            <FileText className="w-3.5 h-3.5" />
            Blank
          </Link>
        </div>
      </div>
    </li>
  );
}

function Pill({
  children,
  ok,
  error,
}: {
  children: React.ReactNode;
  ok?: boolean;
  error?: boolean;
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        error
          ? "bg-red-100 text-red-700"
          : ok
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </span>
  );
}
