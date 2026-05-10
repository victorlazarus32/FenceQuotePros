// Crew Accountability List. A printable scope sheet that consolidates
// every detail an installer needs to roll out and execute the job
// without calling back to the office: scope, materials, post layout,
// gate orientation, site conditions, special notes, photos, and
// compliance gotchas. Pulls everything from the existing FenceJob row
// — no extra contractor data entry required.
//
// Print-friendly: hides nav and CTAs in print mode, lays out as a
// single-column document on letter-size paper.

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Hammer,
  MapPin,
  Ruler,
  Shield,
  Wrench,
} from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { LinkButton } from "@/components/Button";
import { PrintButton } from "@/components/PrintButton";
import BrandWordmark from "@/components/BrandWordmark";
import {
  ACCESS_LABELS,
  FENCE_TYPE_LABELS,
  GATE_MOTOR_LABELS,
  GATE_STYLE_LABELS,
  SOIL_LABELS,
  analyzeCompliance,
  calculateFenceJob,
  fenceJobRowToCalcInput,
  type FenceType,
} from "@/lib/fence";
import { getStorage } from "@/lib/storage";
import { detectJurisdiction } from "@/lib/jurisdictions";
import { formatDate } from "@/lib/format";

export default async function AccountabilityListPage(
  props: PageProps<"/estimates/[id]/accountability">,
) {
  const { id } = await props.params;
  const userId = await getCurrentUserId();

  const est = await db.estimate.findUnique({
    where: { id },
    include: {
      client: true,
      user: true,
      fenceJobs: true,
      photos: { orderBy: { uploadedAt: "asc" } },
    },
  });
  if (!est || est.userId !== userId) notFound();

  const fenceJob = est.fenceJobs[0];
  if (!fenceJob) {
    return (
      <div className="space-y-4">
        <Link
          href={`/estimates/${id}`}
          className="text-sm text-slate-600 hover:text-ink"
        >
          ← Back to estimate
        </Link>
        <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          This estimate has no fence job yet. Add a fence configuration
          first to generate the accountability list.
        </div>
      </div>
    );
  }

  const calcInput = fenceJobRowToCalcInput(fenceJob);
  const calcResult = calculateFenceJob(calcInput);
  const alerts = analyzeCompliance(calcInput);
  const blockers = alerts.filter((a) => a.severity === "blocker");
  const warnings = alerts.filter((a) => a.severity === "warning");

  // Resolve photo URLs through the storage abstraction so this works
  // for local-FS dev and Supabase prod.
  const storage = getStorage();
  const photos = await Promise.all(
    est.photos.map(async (p) => ({
      id: p.id,
      url: await storage.publicUrl(p.storageKey),
      angleLabel: p.angleLabel,
    })),
  );

  const jurisdiction = detectJurisdiction({
    city: est.client.city,
    state: est.client.state,
    zip: est.client.zip,
  });

  const totalGates = fenceJob.numGatesSingle + fenceJob.numGatesDouble;
  const fenceTypeLabel =
    FENCE_TYPE_LABELS[fenceJob.fenceType as FenceType] ?? fenceJob.fenceType;

  return (
    <div className="space-y-6">
      {/* Top action bar — hidden in print */}
      <div className="no-print flex items-center justify-between gap-2 flex-wrap">
        <Link
          href={`/estimates/${id}`}
          className="text-sm text-slate-600 hover:text-ink"
        >
          ← Back to {est.number}
        </Link>
        <div className="flex gap-2 items-center">
          <PrintButton />
          <LinkButton href={`/estimates/${id}`} variant="secondary" size="sm">
            Done
          </LinkButton>
        </div>
      </div>

      <article className="bg-white rounded-lg border-2 border-ink overflow-hidden print:border-0 print:rounded-none">
        {/* Header */}
        <header className="bg-ink text-paper px-8 py-6 flex items-center gap-4 flex-wrap print:bg-white print:text-ink print:border-b-2 print:border-ink">
          <div className="flex items-center gap-3 grow">
            <Image
              src="/logo-v2.png"
              alt=""
              width={1536}
              height={1024}
              className="h-16 w-auto shrink-0 print:hidden"
            />
            <div>
              <div className="text-xs uppercase tracking-wider opacity-70">
                Crew accountability list
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.005em",
                  fontSize: "var(--text-xl)",
                  lineHeight: 1.05,
                }}
              >
                {est.user.companyName ?? est.user.name ?? "Fence Quote Pros"}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-brand"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: "var(--text-2xl)",
                lineHeight: 1,
              }}
            >
              {est.number}
            </div>
            <div className="font-mono text-xs opacity-80 mt-1">
              Issued {formatDate(est.issueDate)}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Project + property block */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <SectionLabel>Customer</SectionLabel>
              <div className="font-bold text-ink mt-1">{est.client.name}</div>
              {est.client.phone && (
                <div className="text-sm text-slate-600 mt-0.5 font-mono">
                  {est.client.phone}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <SectionLabel>Property address</SectionLabel>
              <div className="font-bold text-ink mt-1">
                {est.client.addressLine1 ?? "—"}
              </div>
              {(est.client.city || est.client.state || est.client.zip) && (
                <div className="text-sm text-slate-600 mt-0.5">
                  {[est.client.city, est.client.state, est.client.zip]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
              {est.client.folioNumber && (
                <div className="font-mono text-xs text-slate-500 mt-1">
                  Folio {est.client.folioNumber}
                </div>
              )}
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-paper border border-line text-[10px] uppercase tracking-wider font-bold text-slate-700">
                <MapPin className="w-3 h-3 text-brand" />
                {jurisdiction.rules.name}
                {jurisdiction.rules.hvhz && " · HVHZ"}
              </div>
            </div>
          </section>

          {/* Compliance alerts */}
          {(blockers.length > 0 || warnings.length > 0) && (
            <section className="rounded-md border-2 border-amber-300 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <SectionLabel className="!text-amber-700">
                  Read this before you start
                </SectionLabel>
              </div>
              <ul className="space-y-1.5 text-sm text-amber-900">
                {[...blockers, ...warnings].map((a) => (
                  <li key={a.code} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">•</span>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider mr-2 px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                        {a.severity === "blocker" ? "BLOCKER" : "WARNING"}
                      </span>
                      {a.message}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Scope */}
          <section>
            <SectionHeader icon={<Hammer className="w-4 h-4" />} title="Scope" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <FactCell label="Type" value={fenceTypeLabel} />
              <FactCell label="Height" value={`${fenceJob.heightFeet} ft`} />
              <FactCell
                label="Linear footage"
                value={`${fenceJob.linearFeet} LF`}
              />
              <FactCell
                label="Post spacing"
                value={`${fenceJob.postSpacingFeet} ft`}
              />
              {fenceJob.style && (
                <FactCell label="Style" value={titleCase(fenceJob.style)} />
              )}
              {fenceJob.color && (
                <FactCell label="Color" value={titleCase(fenceJob.color)} />
              )}
              {fenceJob.finishedSide && (
                <FactCell
                  label="Finished side"
                  value={
                    fenceJob.finishedSide === "in"
                      ? "Facing customer's yard"
                      : fenceJob.finishedSide === "out"
                        ? "Facing neighbor / street"
                        : "Both sides"
                  }
                />
              )}
            </div>
          </section>

          {/* Layout — posts + corners + ends */}
          <section>
            <SectionHeader
              icon={<Ruler className="w-4 h-4" />}
              title="Post layout"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <FactCell
                label="Total posts"
                value={String(calcResult.materialList.totalPostCount)}
                emphasis
              />
              <FactCell
                label="Corner posts"
                value={String(calcResult.materialList.cornerPostCount)}
              />
              <FactCell
                label="End posts"
                value={String(calcResult.materialList.endPostCount)}
              />
              <FactCell
                label="Line posts"
                value={String(calcResult.materialList.linePostCount)}
              />
              <FactCell
                label="Concrete bags"
                value={`${calcResult.materialList.concreteBags} bags`}
              />
              <FactCell
                label="Concrete (cubic ft)"
                value={`${calcResult.materialList.concreteCubicFeet.toFixed(1)} ft³`}
              />
              {calcResult.materialList.railCount > 0 && (
                <FactCell
                  label="Rails"
                  value={String(calcResult.materialList.railCount)}
                />
              )}
              {calcResult.materialList.picketCount > 0 && (
                <FactCell
                  label="Pickets"
                  value={String(calcResult.materialList.picketCount)}
                />
              )}
            </div>
          </section>

          {/* Gates */}
          {totalGates > 0 && (
            <section>
              <SectionHeader
                icon={<Wrench className="w-4 h-4" />}
                title={`Gates (${totalGates})`}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                {fenceJob.numGatesSingle > 0 && (
                  <FactCell
                    label="Single gates"
                    value={String(fenceJob.numGatesSingle)}
                  />
                )}
                {fenceJob.numGatesDouble > 0 && (
                  <FactCell
                    label="Double gates"
                    value={String(fenceJob.numGatesDouble)}
                  />
                )}
                <FactCell
                  label="Style"
                  value={
                    GATE_STYLE_LABELS[
                      fenceJob.gateStyle as keyof typeof GATE_STYLE_LABELS
                    ] ?? fenceJob.gateStyle
                  }
                />
                <FactCell
                  label="Motor"
                  value={
                    GATE_MOTOR_LABELS[
                      fenceJob.gateMotor as keyof typeof GATE_MOTOR_LABELS
                    ] ?? fenceJob.gateMotor
                  }
                />
              </div>
              {fenceJob.poolAdjacent && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-300 text-sm text-amber-900">
                  <Shield className="w-4 h-4 shrink-0" />
                  Pool barrier — gate must be self-closing, latch ≥ 54&quot;,
                  swing OUT away from the pool.
                </div>
              )}
            </section>
          )}

          {/* Site conditions */}
          <section>
            <SectionHeader
              icon={<MapPin className="w-4 h-4" />}
              title="Site conditions"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <FactCell label="Terrain" value={titleCase(fenceJob.terrain)} />
              <FactCell
                label="Soil"
                value={
                  SOIL_LABELS[fenceJob.soilType as keyof typeof SOIL_LABELS] ??
                  fenceJob.soilType
                }
              />
              <FactCell
                label="Access"
                value={
                  ACCESS_LABELS[
                    fenceJob.access as keyof typeof ACCESS_LABELS
                  ] ?? fenceJob.access
                }
              />
              <FactCell
                label="HVHZ"
                value={fenceJob.hvhz ? "Yes — 175 mph" : "No"}
              />
              {fenceJob.removeExisting && (
                <FactCell
                  label="Remove existing"
                  value={`${fenceJob.removeLinearFeet} LF${fenceJob.haulAway ? " · haul away" : ""}`}
                />
              )}
            </div>
          </section>

          {/* Notes */}
          {fenceJob.notes && (
            <section>
              <SectionHeader
                icon={<ClipboardList className="w-4 h-4" />}
                title="Notes for the crew"
              />
              <div className="mt-3 rounded-md border-2 border-line bg-paper p-4 whitespace-pre-wrap text-sm text-ink">
                {fenceJob.notes}
              </div>
            </section>
          )}

          {/* Site photos */}
          {photos.length > 0 && (
            <section>
              <SectionHeader
                icon={<MapPin className="w-4 h-4" />}
                title={`Site photos (${photos.length})`}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                {photos.map((p) => (
                  <figure
                    key={p.id}
                    className="overflow-hidden rounded border border-line bg-slate-50 print:break-inside-avoid"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.angleLabel ?? "Property photo"}
                      className="block w-full h-auto"
                    />
                    {p.angleLabel && (
                      <figcaption className="px-2 py-1 text-xs text-slate-600">
                        {p.angleLabel}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Sign-off */}
          <section className="border-t-2 border-ink pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 print:break-inside-avoid">
            <SignOff label="Crew lead" />
            <SignOff label="Date completed" />
          </section>

          <div className="text-[10px] text-slate-500 text-center mt-2 print:mt-4">
            Generated by <BrandWordmark /> · {est.number} ·{" "}
            {formatDate(est.issueDate)}
          </div>
        </div>
      </article>

      <div className="text-xs text-slate-500 no-print">
        Tip: <span className="font-mono">Ctrl+P</span> (or{" "}
        <span className="font-mono">⌘P</span> on Mac) to print or save as PDF.
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-[10px] uppercase tracking-wider text-slate-500 font-bold ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-line pb-2">
      <span className="text-brand">{icon}</span>
      <h2
        className="text-ink"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          textTransform: "uppercase",
          fontSize: "var(--text-md)",
          letterSpacing: "0.005em",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function FactCell({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
        {label}
      </div>
      <div
        className={`mt-1 ${emphasis ? "text-brand" : "text-ink"}`}
        style={{
          fontFamily: emphasis ? "var(--font-display)" : undefined,
          fontWeight: emphasis ? 900 : 600,
          fontSize: emphasis ? "var(--text-lg)" : "var(--text-md)",
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SignOff({ label }: { label: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">
        {label}
      </div>
      <div className="border-b-2 border-ink h-10 flex items-end">
        <Check className="w-4 h-4 text-slate-300 mb-1" />
      </div>
    </div>
  );
}

function titleCase(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
