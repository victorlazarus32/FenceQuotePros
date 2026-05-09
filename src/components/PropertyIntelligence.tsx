"use client";

// Inline panel that appears on Step 2 of the Fence Project Builder
// once the contractor has picked (or is creating) a client with a
// non-empty address. Shows the detected jurisdiction, max heights,
// HVHZ flag, HOA likelihood, and a one-line note when the
// jurisdiction's ordinance differs from the MDC default.
//
// Pure-presentation: takes a JurisdictionRules + confidence and
// renders it. Detection logic lives in lib/jurisdictions.ts so it
// can be reused outside the wizard later.

import { Building2, Check, MapPin, ShieldCheck, Wind } from "lucide-react";
import type { JurisdictionRules } from "@/lib/jurisdictions";

interface Props {
  /** Resolved jurisdiction. */
  rules: JurisdictionRules;
  /** How confident the detection is. Drives the badge color. */
  confidence: "high" | "medium" | "low";
  /** Human-readable address line for context. */
  addressLine?: string | null;
}

export function PropertyIntelligence({ rules, confidence, addressLine }: Props) {
  const tone =
    confidence === "high"
      ? { dot: "bg-emerald-500", label: "Detected" }
      : confidence === "medium"
        ? { dot: "bg-amber-500", label: "Likely" }
        : { dot: "bg-slate-400", label: "Assumed" };

  return (
    <div className="rounded-xl border-2 border-line bg-paper overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-line px-4 py-3 flex items-center gap-3 flex-wrap">
        <MapPin className="w-4 h-4 text-brand shrink-0" />
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
          Property intelligence
        </div>
        <div className="grow text-xs text-slate-700 truncate">
          {addressLine ?? "No address on file"}
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-line text-[10px] uppercase tracking-wider font-bold text-slate-700">
          <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
          {tone.label}
        </span>
      </div>

      {/* Rows */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Row
          icon={<Building2 className="w-3.5 h-3.5" />}
          label="Jurisdiction"
          value={rules.name}
        />
        <Row
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          label="Permit category"
          value={
            rules.buildingCategory === "—"
              ? "Verify locally"
              : `Cat. ${rules.buildingCategory} · Building`
          }
        />
        <Row
          icon={<Wind className="w-3.5 h-3.5" />}
          label="Wind-load zone"
          value={rules.hvhz ? "HVHZ — V_ult 175 mph" : "Standard"}
        />
        <Row
          label="HOA likelihood"
          value={
            rules.hoaLikelihood === "high"
              ? "High — review board likely"
              : rules.hoaLikelihood === "medium"
                ? "Medium — confirm with owner"
                : "Low"
          }
          tone={
            rules.hoaLikelihood === "high"
              ? "warn"
              : rules.hoaLikelihood === "medium"
                ? "neutral"
                : "ok"
          }
        />
        <Row
          label="Max height — front"
          value={`${rules.maxHeightFrontFt} ft`}
        />
        <Row
          label="Max height — rear / side"
          value={`${rules.maxHeightRearFt} ft`}
        />
      </div>

      {rules.note && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{rules.note}</span>
        </div>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  tone?: "ok" | "warn" | "neutral";
}) {
  const valueColor =
    tone === "ok" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-ink";
  return (
    <div className="flex items-start gap-2">
      <div className="w-5 shrink-0 text-slate-400 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </div>
        <div className={`text-sm font-medium ${valueColor} mt-0.5 break-words`}>
          {value}
        </div>
      </div>
    </div>
  );
}
