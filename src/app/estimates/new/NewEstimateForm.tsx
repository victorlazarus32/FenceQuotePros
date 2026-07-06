"use client";

import {
  Briefcase,
  BrickWall,
  ChevronDown,
  Columns3,
  EyeOff,
  Grid3x3,
  Image as ImageIcon,
  Lightbulb,
  Lock,
  PawPrint,
  Shield,
  Sparkles,
  Trees,
  VolumeX,
  Waves,
} from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { Button, LinkButton } from "@/components/Button";
import {
  ComplianceAlerts,
  hasBlocker,
} from "@/components/ComplianceAlerts";
import { cn } from "@/lib/cn";
import { computeDepositCents } from "@/lib/deposit";
import { formatMoney } from "@/lib/format";
import {
  ACCESS_LABELS,
  COLOR_OPTIONS_BY_TYPE,
  FENCE_TYPE_LABELS,
  GATE_MOTOR_LABELS,
  GATE_STANDARD_WIDTH_FEET,
  GATE_STYLE_LABELS,
  QUICK_ADD_PRESETS,
  SOIL_LABELS,
  STYLE_OPTIONS_BY_TYPE,
  analyzeCompliance,
  calculateFenceJob,
  defaultGateSpec,
  defaultLaborConfig,
  finishedSideApplies,
  gateCountSummary,
  reconcileStyleColor,
  type AccessType,
  type ChoosableGateStyle,
  type FenceCalcInput,
  type FenceType,
  type GateMotor,
  type GateSpec,
  type MarginConfig,
  type SoilType,
} from "@/lib/fence";
import { detectJurisdiction } from "@/lib/jurisdictions";
import { PropertyIntelligence } from "@/components/PropertyIntelligence";
import { createEstimate, type EstimateFormState } from "../actions";

type ClientOpt = {
  id: string;
  name: string;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

type CustomLine = {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  /** Compliance reminder copied from the preset (if any). Internal only —
   *  never written to the customer doc; rendered as an amber inline note
   *  next to the editable row. */
  complianceHint?: string;
};

type NewClientDraft = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  folioNumber: string;
  notes: string;
};

const EMPTY_NEW_CLIENT: NewClientDraft = {
  name: "",
  email: "",
  phone: "",
  addressLine1: "",
  city: "",
  state: "",
  zip: "",
  folioNumber: "",
  notes: "",
};

// US phone formatter — mirrors the standalone ClientForm implementation.
function formatUsPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Fence types exposed in the new-estimate dropdown, in the display order
// Victor specified. wood_picket / wrought_iron / composite are omitted here
// but remain valid FenceType values for back-compat with older estimates.
const fenceTypes: FenceType[] = [
  "wood_privacy",
  "chain_link",
  "vinyl",
  "aluminum",
  "dura_fence",
  "concrete_wall",
  "concrete_column",
];

// Visual metadata for the material card grid — icon + tagline per type.
// Keep in sync with fenceTypes; if a new fence type is added there, add
// an entry here too or the card grid will fall back to no icon.
const FENCE_TYPE_VISUAL: Record<
  FenceType,
  { icon: typeof Trees; tagline: string }
> = {
  wood_privacy: { icon: Trees, tagline: "Pressure-treated pine panels" },
  wood_picket: { icon: Trees, tagline: "Classic picket fencing" },
  chain_link: { icon: Grid3x3, tagline: "Galvanized · pet & boundary" },
  vinyl: { icon: Columns3, tagline: "Maintenance-free PVC" },
  aluminum: { icon: Shield, tagline: "Ornamental · pool-rated" },
  wrought_iron: { icon: Shield, tagline: "Heavy-duty ornamental" },
  composite: { icon: Columns3, tagline: "Premium composite panels" },
  dura_fence: { icon: BrickWall, tagline: "Engineer-sealed steel" },
  concrete_wall: { icon: BrickWall, tagline: "Solid masonry wall" },
  concrete_column: { icon: BrickWall, tagline: "Pier + column system" },
};

// Purpose options — drives recommendations + conditional UI later.
const PURPOSE_OPTIONS = [
  { value: "privacy", label: "Privacy", icon: EyeOff },
  { value: "security", label: "Security", icon: Lock },
  { value: "pool_safety", label: "Pool safety", icon: Waves },
  { value: "pets", label: "Pets", icon: PawPrint },
  { value: "decorative", label: "Decorative", icon: Sparkles },
  { value: "hoa", label: "HOA compliance", icon: Shield },
  { value: "commercial", label: "Commercial", icon: Briefcase },
  { value: "noise", label: "Noise reduction", icon: VolumeX },
] as const;
const PURPOSE_LABELS: Record<(typeof PURPOSE_OPTIONS)[number]["value"], string> =
  Object.fromEntries(PURPOSE_OPTIONS.map((p) => [p.value, p.label])) as Record<
    (typeof PURPOSE_OPTIONS)[number]["value"],
    string
  >;

// Lightweight recommendation engine. Reads purpose + material + height
// and surfaces a contextual hint that helps the contractor make a
// stronger pitch. Returns null when no specific advice applies — the
// UI hides the card in that case.
function buildRecommendation(input: {
  purpose: string;
  fenceType: FenceType | "";
  heightFeet: number;
}): { title: string; body: string } | null {
  const { purpose, fenceType, heightFeet } = input;
  if (!fenceType && !purpose) return null;

  if (purpose === "pool_safety") {
    if (heightFeet < 4) {
      return {
        title: "Pool barrier code requires ≥ 4 ft",
        body: "FBC R4501 sets a 4 ft minimum for residential pool barriers. Bump the height before printing.",
      };
    }
    if (fenceType === "wood_privacy") {
      return {
        title: "Wood privacy isn't pool-rated by default",
        body: "Solid wood panels don't meet R4501 climbability requirements. Aluminum picket is the standard pool-barrier choice.",
      };
    }
    return {
      title: "Pool-rated build",
      body: "Confirm self-closing latch ≥ 54\" + outward-swinging gate. Aluminum picket at 4–6 ft is the most common spec.",
    };
  }

  if (purpose === "privacy") {
    if (heightFeet < 6 && (fenceType === "wood_privacy" || fenceType === "vinyl")) {
      return {
        title: "Most privacy fences are 6 ft",
        body: "4–5 ft solid panels still leave eye-line visible. Side / rear yards in MDC allow up to 6 ft — worth offering.",
      };
    }
    if (fenceType === "chain_link" || fenceType === "aluminum") {
      return {
        title: "Material gap for privacy",
        body: "Chain link / aluminum picket are see-through. Wood, vinyl, or composite are the typical privacy specs.",
      };
    }
  }

  if (purpose === "pets") {
    if (heightFeet < 4) {
      return {
        title: "Pets typically need ≥ 4 ft",
        body: "Most dogs clear 3 ft easily. 4–5 ft chain link or aluminum picket is the common pet-containment spec.",
      };
    }
  }

  if (purpose === "security" && fenceType === "wood_privacy") {
    return {
      title: "Security + wood is uncommon",
      body: "Wood is climbable and rots. Aluminum picket or DuraFence steel is the typical security spec.",
    };
  }

  if (purpose === "commercial" && (fenceType === "wood_privacy" || fenceType === "wood_picket")) {
    return {
      title: "Commercial typically uses metal",
      body: "Chain link or DuraFence steel is more common for commercial sites — stronger, lower maintenance.",
    };
  }

  if (purpose === "noise" && fenceType !== "concrete_wall") {
    return {
      title: "Noise reduction needs mass",
      body: "Concrete wall is the only option that meaningfully attenuates traffic noise. Wood / vinyl give visual privacy but minimal sound dampening.",
    };
  }

  return null;
}

const SOIL_TYPES: SoilType[] = ["sand", "clay", "rock"];
const ACCESS_TYPES: AccessType[] = ["easy", "limited", "restricted"];

const STEPS = [
  "Project",
  "Fence",
  "Layout",
  "Site",
  "Gates",
  "Extras",
  "Pricing",
] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function NewEstimateForm({
  clients,
  defaultClientId,
}: {
  clients: ClientOpt[];
  defaultClientId?: string;
}) {
  const [state, formAction, pending] = useActionState<
    EstimateFormState,
    FormData
  >(createEstimate, {});

  const [step, setStep] = useState<StepIndex>(0);
  const [clientMode, setClientMode] = useState<"existing" | "new">(
    clients.length === 0 ? "new" : "existing",
  );
  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [newClient, setNewClient] = useState<NewClientDraft>(EMPTY_NEW_CLIENT);
  const [fenceEnabled, setFenceEnabled] = useState(true);
  // Form-level fence state allows an empty fenceType for "no selection yet".
  // Engine calls (calculateFenceJob, analyzeCompliance) guard on truthy
  // fenceType and cast the rest of the shape to FenceCalcInput.
  type FormFenceState = Omit<FenceCalcInput, "fenceType"> & {
    fenceType: FenceType | "";
  };
  const [fence, setFence] = useState<FormFenceState>(() => {
    return {
      fenceType: "",
      heightFeet: 6,
      linearFeet: 100,
      postSpacingFeet: 8,
      numGatesSingle: 1,
      numGatesDouble: 0,
      numCorners: 0,
      numEnds: 2,
      removeExisting: false,
      removeLinearFeet: 0,
      haulAway: true,
      terrain: "flat",
      soilType: "sand",
      access: "easy",
      poolAdjacent: false,
      hvhz: true,
      // One default walk gate — most jobs have at least one. The legacy
      // count/style/motor fields are kept in sync by setGates().
      gates: [defaultGateSpec()],
      gateStyle: "swing_walk",
      gateMotor: "none",
      style: undefined,
      color: undefined,
      labor: { mode: "per_foot", ratePerFootCents: 0 },
      pricing: { margin: { mode: "percent", value: 0.2 } },
      permitRequired: false,
      engineeringRequired: false,
    };
  });
  // Goal of the fence — drives recommendations + future upsell paths.
  // Stored separately from FenceCalcInput since the calc engine doesn't
  // use it (yet); posted to the server via a hidden input.
  type FencePurpose =
    | "privacy"
    | "security"
    | "pool_safety"
    | "pets"
    | "decorative"
    | "hoa"
    | "commercial"
    | "noise";
  const [purpose, setPurpose] = useState<FencePurpose | "">("");
  // After the form submits we either land on the estimate detail
  // (default) or the visualization workflow. Set by the two Step 7
  // submit buttons; read by the server action via formData.
  const [afterSave, setAfterSave] = useState<"view" | "visualize">("view");
  const [taxRate, setTaxRate] = useState(0);
  const [customLines, setCustomLines] = useState<CustomLine[]>([]);
  const [depositMode, setDepositMode] = useState<"none" | "percent" | "fixed">(
    "percent",
  );
  const [depositPercent, setDepositPercent] = useState(50);
  const [depositFixedDollars, setDepositFixedDollars] = useState(0);

  // ── Reconcilers ─────────────────────────────────────────────────
  const setFenceType = (newType: FenceType | "") => {
    if (newType === "") {
      setFence({
        ...fence,
        fenceType: "",
        style: undefined,
        color: undefined,
        labor: { mode: "per_foot", ratePerFootCents: 0 },
      });
      return;
    }
    const sc = reconcileStyleColor(newType, fence.style, fence.color);
    setFence({
      ...fence,
      fenceType: newType,
      style: sc.style,
      color: sc.color,
      labor: defaultLaborConfig(newType),
    });
  };

  // Gate list — the array is the source of truth; the legacy summary
  // fields (numGates*/gateStyle/gateMotor) are derived so the compliance
  // analyzer and anything else reading them stays consistent.
  const setGates = (gates: GateSpec[]) => {
    setFence({ ...fence, gates, ...gateCountSummary(gates) });
  };

  const updateGate = (index: number, patch: Partial<GateSpec>) => {
    setGates(
      (fence.gates ?? []).map((g, i) => (i === index ? { ...g, ...patch } : g)),
    );
  };

  // Style change follows the new style's standard width — but only when the
  // width still matches the old style's standard (i.e. the user never
  // touched it). A hand-entered width survives style switches.
  const updateGateStyle = (index: number, style: ChoosableGateStyle) => {
    const g = (fence.gates ?? [])[index];
    if (!g) return;
    const widthFeet =
      g.widthFeet === GATE_STANDARD_WIDTH_FEET[g.style]
        ? GATE_STANDARD_WIDTH_FEET[style]
        : g.widthFeet;
    updateGate(index, { style, widthFeet });
  };

  const setLaborMode = (mode: "per_foot" | "per_hour") => {
    if (mode === "per_foot") {
      const next = fence.fenceType
        ? defaultLaborConfig(fence.fenceType)
        : ({ mode: "per_foot", ratePerFootCents: 0 } as const);
      setFence({ ...fence, labor: next });
    } else {
      setFence({
        ...fence,
        labor: {
          mode: "per_hour",
          ratePerHourCents: 7500,
          crewSize: 2,
          estimatedHours: 8,
        },
      });
    }
  };

  const setMarginMode = (mode: MarginConfig["mode"]) => {
    let margin: MarginConfig;
    if (mode === "percent") margin = { mode: "percent", value: 0.2 };
    else if (mode === "fixed") margin = { mode: "fixed", cents: 50000 };
    else margin = { mode: "minimum", floorCents: 100000 };
    setFence({
      ...fence,
      pricing: { ...(fence.pricing ?? {}), margin },
    });
  };

  const updatePercentMargin = (percentDisplay: number) => {
    setFence({
      ...fence,
      pricing: {
        ...(fence.pricing ?? {}),
        margin: { mode: "percent", value: Math.max(0, percentDisplay) / 100 },
      },
    });
  };

  const updateFixedMargin = (dollars: number) => {
    setFence({
      ...fence,
      pricing: {
        ...(fence.pricing ?? {}),
        margin: { mode: "fixed", cents: Math.round(Math.max(0, dollars) * 100) },
      },
    });
  };

  const updateMinimumMargin = (dollars: number) => {
    setFence({
      ...fence,
      pricing: {
        ...(fence.pricing ?? {}),
        margin: {
          mode: "minimum",
          floorCents: Math.round(Math.max(0, dollars) * 100),
        },
      },
    });
  };

  const addPresetLine = (preset: (typeof QUICK_ADD_PRESETS)[number]) => {
    setCustomLines((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        description: preset.description,
        quantity: String(preset.defaultQty),
        unit: preset.defaultUnit,
        unitPrice: String(preset.defaultPriceDollars),
        complianceHint: preset.complianceHint,
      },
    ]);
  };

  // ── Computed ────────────────────────────────────────────────────
  const fenceCalc = useMemo(() => {
    if (!fenceEnabled || !fence.fenceType) {
      return { lines: [], totalCents: 0 };
    }
    return calculateFenceJob(fence as FenceCalcInput);
  }, [fenceEnabled, fence]);

  const complianceWarnings = useMemo(() => {
    if (!fenceEnabled || !fence.fenceType) return [];
    return analyzeCompliance(fence as FenceCalcInput);
  }, [fenceEnabled, fence]);

  const customSubtotal = useMemo(
    () =>
      customLines.reduce((sum, l) => {
        const q = parseFloat(l.quantity) || 0;
        const p = parseFloat(l.unitPrice) || 0;
        return sum + Math.round(q * p * 100);
      }, 0),
    [customLines],
  );

  const subtotal = fenceCalc.totalCents + customSubtotal;
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + tax;
  const depositCents = computeDepositCents(total, {
    mode: depositMode,
    percent: depositPercent,
    fixedCents: Math.round(depositFixedDollars * 100),
  });
  const balanceDueCents = Math.max(0, total - depositCents);
  const blocker = hasBlocker(complianceWarnings);

  const step0Valid =
    clientMode === "existing"
      ? clientId !== ""
      : newClient.name.trim().length > 0;

  const canAdvance: Record<StepIndex, boolean> = {
    0: step0Valid,
    1: fenceEnabled ? !!fence.fenceType : true,
    2: fence.linearFeet >= 1,
    3: true,
    4: true,
    5: true,
    6: !blocker,
  };

  const next = () => setStep((s) => (Math.min(6, s + 1) as StepIndex));
  const prev = () => setStep((s) => (Math.max(0, s - 1) as StepIndex));

  const selectedClient = clients.find((c) => c.id === clientId);
  const labor =
    fence.labor ??
    (fence.fenceType
      ? defaultLaborConfig(fence.fenceType)
      : ({ mode: "per_foot", ratePerFootCents: 0 } as const));
  const margin =
    fence.pricing?.margin ?? ({ mode: "percent", value: 0.2 } as MarginConfig);

  return (
    <form action={formAction}>
      {/* Step progress bar */}
      <div className="bg-white rounded-md border border-line p-2 mb-4 flex gap-1 sticky top-0 z-20 overflow-x-auto">
        {STEPS.map((label, i) => {
          const reached = i <= step;
          const isCurrent = i === step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (i <= step) setStep(i as StepIndex);
              }}
              className="flex-1 min-w-[60px] flex flex-col items-center gap-1.5 py-1.5 disabled:opacity-50"
              disabled={i > step}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div
                className="h-1.5 w-full rounded-full"
                style={{
                  background: reached ? "var(--brand)" : "#e2e1dc",
                }}
              />
              <div
                className="text-[10px] sm:text-xs font-semibold"
                style={{
                  color: reached ? "var(--ink)" : "#94a3b8",
                  fontFamily: "var(--font-display)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {i + 1} {label}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Step 1 — Project & client ─────────────────────────── */}
      <StepPanel show={step === 0} title="Project & client">
        {/* Client mode toggle — pick existing or add new inline */}
        <div className="flex flex-wrap gap-2 mb-5">
          <ModeButton
            selected={clientMode === "existing"}
            onClick={() => setClientMode("existing")}
          >
            Existing customer
          </ModeButton>
          <ModeButton
            selected={clientMode === "new"}
            onClick={() => setClientMode("new")}
          >
            + New customer
          </ModeButton>
        </div>
        <input type="hidden" name="clientMode" value={clientMode} />

        {clientMode === "existing" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client <span className="text-red-600">*</span>
              </label>
              {clients.length === 0 ? (
                <div className="rounded-md border border-dashed border-line bg-paper px-3 py-3 text-sm text-slate-500">
                  No saved customers. Switch to{" "}
                  <span className="font-semibold">+ New customer</span> to add
                  one.
                </div>
              ) : (
                <select
                  name="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-md border border-line px-3 py-3 text-base bg-white focus:border-brand focus:ring-2 focus:ring-brand"
                >
                  <option value="" disabled>
                    Select a customer…
                  </option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
              {state.errors?.clientId?.[0] && (
                <p className="mt-1 text-xs text-red-600">
                  {state.errors.clientId[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expires
              </label>
              <input
                type="date"
                name="expiryDate"
                className="w-full rounded-md border border-line px-3 py-3 text-base focus:border-brand focus:ring-2 focus:ring-brand"
              />
            </div>
            {selectedClient && (
              <p className="sm:col-span-3 text-xs text-slate-500">
                Job-site address pulls from the customer record.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Customer name"
                required
                name="newClient_name"
                value={newClient.name}
                onChange={(v) => setNewClient({ ...newClient, name: v })}
                error={state.errors?.name?.[0]}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="newClient_phone"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      phone: formatUsPhone(e.target.value),
                    })
                  }
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="305-726-8324"
                  maxLength={12}
                  className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
            <TextField
              label="Email"
              type="email"
              name="newClient_email"
              value={newClient.email}
              onChange={(v) => setNewClient({ ...newClient, email: v })}
              error={state.errors?.email?.[0]}
            />
            <TextField
              label="Job-site street address"
              name="newClient_addressLine1"
              value={newClient.addressLine1}
              onChange={(v) =>
                setNewClient({ ...newClient, addressLine1: v })
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TextField
                label="City"
                name="newClient_city"
                value={newClient.city}
                onChange={(v) => setNewClient({ ...newClient, city: v })}
              />
              <TextField
                label="State"
                name="newClient_state"
                value={newClient.state}
                onChange={(v) => setNewClient({ ...newClient, state: v })}
              />
              <TextField
                label="Zip"
                name="newClient_zip"
                value={newClient.zip}
                onChange={(v) => setNewClient({ ...newClient, zip: v })}
              />
            </div>
            <TextField
              label="Folio / parcel number"
              name="newClient_folioNumber"
              value={newClient.folioNumber}
              onChange={(v) =>
                setNewClient({ ...newClient, folioNumber: v })
              }
              placeholder="e.g. 30-3033-024-0010 (Miami-Dade)"
              helperText="Property folio / parcel ID — pulls onto permit applications when this estimate is approved."
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Customer notes (internal)
              </label>
              <textarea
                name="newClient_notes"
                value={newClient.notes}
                onChange={(e) =>
                  setNewClient({ ...newClient, notes: e.target.value })
                }
                rows={2}
                className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2 border-t border-line">
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estimate expires
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand"
                />
              </div>
              <p className="sm:col-span-2 text-xs text-slate-500">
                The new customer record will be saved when you create this
                estimate.
              </p>
            </div>
          </div>
        )}
      </StepPanel>

      {/* ── Step 2 — Fence type, style, color ─────────────────── */}
      <StepPanel show={step === 1} title="Fence type, style, color">
        {/* Property Intelligence — detected from the selected client's
            address. Surfaces here so the contractor sees jurisdiction,
            permit category, max heights, and HOA likelihood right
            before they spec the fence. */}
        {selectedClient &&
          (selectedClient.addressLine1 ||
            selectedClient.city ||
            selectedClient.zip) && (
            <div className="mb-5">
              {(() => {
                const detection = detectJurisdiction({
                  city: selectedClient.city,
                  state: selectedClient.state,
                  zip: selectedClient.zip,
                });
                const addressLine = [
                  selectedClient.addressLine1,
                  [selectedClient.city, selectedClient.state, selectedClient.zip]
                    .filter(Boolean)
                    .join(", "),
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <PropertyIntelligence
                    rules={detection.rules}
                    confidence={detection.confidence}
                    addressLine={addressLine}
                  />
                );
              })()}
            </div>
          )}

        <div className="flex items-center justify-between mb-4">
          <label className="text-sm flex items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              name="fenceJob_enabled"
              checked={fenceEnabled}
              onChange={(e) => setFenceEnabled(e.target.checked)}
              className="rounded border-line"
            />
            Include fence design
          </label>
        </div>

        <div
          className={
            fenceEnabled ? "" : "opacity-40 pointer-events-none select-none"
          }
        >
          {(() => {
            const styleOpts = fence.fenceType
              ? (STYLE_OPTIONS_BY_TYPE[fence.fenceType] ?? [])
              : [];
            const colorOpts = fence.fenceType
              ? (COLOR_OPTIONS_BY_TYPE[fence.fenceType] ?? [])
              : [];
            const styleLabel =
              styleOpts.find((s) => s.value === fence.style)?.label ??
              "Pick a style";
            const colorOpt = colorOpts.find((c) => c.value === fence.color);
            const colorLabel = colorOpt?.label ?? "Pick a color";
            const fenceTypeSummary = fence.fenceType
              ? FENCE_TYPE_LABELS[fence.fenceType]
              : "Select a fence type";

            return (
              <div className="space-y-3">
                <EstimateSection
                  title="What's the goal?"
                  summary={
                    purpose
                      ? PURPOSE_LABELS[purpose]
                      : "Pick the primary reason for the fence"
                  }
                  defaultOpen
                >
                  <input type="hidden" name="purpose" value={purpose} />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PURPOSE_OPTIONS.map((p) => {
                      const selected = purpose === p.value;
                      const Icon = p.icon;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() =>
                            setPurpose(selected ? "" : p.value)
                          }
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-lg border-2 text-center transition-colors min-h-[88px]",
                            selected
                              ? "border-brand bg-brand-soft text-ink"
                              : "border-line bg-white text-slate-700 hover:border-ink",
                          )}
                          aria-pressed={selected}
                        >
                          <Icon
                            className={cn(
                              "w-5 h-5",
                              selected ? "text-brand" : "text-slate-500",
                            )}
                          />
                          <span className="text-xs font-semibold uppercase tracking-wide leading-tight">
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </EstimateSection>

                <EstimateSection
                  title="Type of fence"
                  summary={fenceTypeSummary}
                  defaultOpen
                >
                  <input
                    type="hidden"
                    name="fenceType"
                    value={fence.fenceType}
                  />
                  <input
                    type="hidden"
                    name="heightFeet"
                    value={fence.heightFeet}
                  />
                  <div
                    role="radiogroup"
                    aria-label="Fence material"
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                  >
                    {fenceTypes.map((t) => {
                      const selected = fence.fenceType === t;
                      const meta = FENCE_TYPE_VISUAL[t];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFenceType(t)}
                          className={cn(
                            "rounded-xl border-2 p-4 text-left transition-all flex flex-col gap-2 min-h-[120px]",
                            selected
                              ? "border-brand bg-brand-soft shadow-[3px_3px_0_var(--brand)]"
                              : "border-line bg-white hover:border-ink",
                          )}
                          aria-pressed={selected}
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              selected
                                ? "bg-brand text-ink"
                                : "bg-paper text-brand",
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div
                            className="text-ink mt-auto"
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 800,
                              textTransform: "uppercase",
                              fontSize: "var(--text-md)",
                              letterSpacing: "0.005em",
                              lineHeight: 1.05,
                            }}
                          >
                            {FENCE_TYPE_LABELS[t]}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug">
                            {meta.tagline}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                      Height
                    </div>
                    <div
                      role="radiogroup"
                      aria-label="Fence height"
                      className="flex flex-wrap gap-2"
                    >
                      {[3, 4, 5, 6, 8, 10, 12].map((h) => {
                        const selected = fence.heightFeet === h;
                        return (
                          <button
                            key={h}
                            type="button"
                            onClick={() =>
                              setFence({ ...fence, heightFeet: h })
                            }
                            className={cn(
                              "px-5 h-12 min-w-[64px] rounded-lg border-2 font-semibold transition-colors",
                              selected
                                ? "border-brand bg-brand text-white"
                                : "border-line bg-white text-slate-700 hover:border-ink",
                            )}
                            aria-pressed={selected}
                          >
                            {h} ft
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Smart recommendation — surfaces when purpose +
                      material + height combo has a known advisory. */}
                  {(() => {
                    const rec = buildRecommendation({
                      purpose,
                      fenceType: fence.fenceType,
                      heightFeet: fence.heightFeet,
                    });
                    if (!rec) return null;
                    return (
                      <div className="mt-5 rounded-lg border-2 border-brand bg-brand-soft p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center shrink-0">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider font-bold text-brand mb-1">
                            Recommendation
                          </div>
                          <div className="text-sm font-semibold text-ink">
                            {rec.title}
                          </div>
                          <div className="text-sm text-slate-700 mt-1 leading-relaxed">
                            {rec.body}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </EstimateSection>

                <EstimateSection title="Style" summary={styleLabel}>
                  {fence.fenceType ? (
                    <>
                      <input
                        type="hidden"
                        name="style"
                        value={fence.style ?? ""}
                      />
                      <div
                        role="radiogroup"
                        aria-label={`Style options for ${FENCE_TYPE_LABELS[fence.fenceType].toLowerCase()}`}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
                      >
                        {styleOpts.map((opt) => {
                          const selected = fence.style === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setFence({ ...fence, style: opt.value })
                              }
                              aria-pressed={selected}
                              className={cn(
                                "rounded-lg border-2 p-3 text-left transition-colors min-h-[60px]",
                                selected
                                  ? "border-brand bg-brand-soft"
                                  : "border-line bg-white hover:border-ink",
                              )}
                            >
                              <div
                                className="text-ink"
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontWeight: 800,
                                  textTransform: "uppercase",
                                  fontSize: "var(--text-sm)",
                                  letterSpacing: "0.005em",
                                }}
                              >
                                {opt.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Pick a fence type first to see available styles.
                    </p>
                  )}
                </EstimateSection>

                <EstimateSection
                  title="Color / finish"
                  summary={
                    <span className="inline-flex items-center gap-2">
                      {colorOpt?.swatch && (
                        <span
                          aria-hidden
                          className="inline-block w-4 h-4 rounded-full border border-line"
                          style={{ background: colorOpt.swatch }}
                        />
                      )}
                      {colorLabel}
                    </span>
                  }
                >
                  {fence.fenceType ? (
                    <div
                      role="radiogroup"
                      aria-label="Color / finish"
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                    >
                      {colorOpts.map((c) => {
                        const selected = fence.color === c.value;
                        return (
                          <button
                            key={c.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() =>
                              setFence({ ...fence, color: c.value })
                            }
                            className={cn(
                              "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                              selected
                                ? "border-brand bg-brand-soft"
                                : "border-line bg-white hover:border-brand",
                            )}
                          >
                            {c.swatch && (
                              <span
                                aria-hidden
                                className="inline-block w-5 h-5 rounded-full border border-line shrink-0"
                                style={{ background: c.swatch }}
                              />
                            )}
                            <span className="truncate">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Pick a fence type first to see available colors.
                    </p>
                  )}
                  <input type="hidden" name="color" value={fence.color ?? ""} />
                </EstimateSection>

                {fence.fenceType &&
                  finishedSideApplies(fence.fenceType, fence.style) && (
                  <EstimateSection
                    title="Finished side"
                    summary={
                      fence.finishedSide === "in"
                        ? "Faces in (customer's yard)"
                        : fence.finishedSide === "out"
                          ? "Faces out (neighbor's side)"
                          : "Pick which side gets the smooth face"
                    }
                  >
                    <p className="text-xs text-slate-500 mb-3">
                      Wood-privacy fences have a smooth picket-only face and a
                      framework face. Pick which side the customer wants to
                      see.
                    </p>
                    <div
                      role="radiogroup"
                      aria-label="Finished side"
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    >
                      {(
                        [
                          {
                            value: "in",
                            label: "Faces in",
                            sub: "Customer sees the smooth side",
                          },
                          {
                            value: "out",
                            label: "Faces out",
                            sub: "Neighbor sees the smooth side",
                          },
                        ] as Array<{
                          value: "in" | "out";
                          label: string;
                          sub: string;
                        }>
                      ).map((opt) => {
                        const selected = fence.finishedSide === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() =>
                              setFence({
                                ...fence,
                                finishedSide: opt.value,
                              })
                            }
                            className={cn(
                              "flex flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 text-left transition-colors",
                              selected
                                ? "border-brand bg-brand-soft"
                                : "border-line bg-white hover:border-brand",
                            )}
                          >
                            <span className="text-sm font-medium text-ink">
                              {opt.label}
                            </span>
                            <span className="text-xs text-slate-500">
                              {opt.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {fence.finishedSide === "in" && (
                      <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 leading-relaxed">
                        ⚠ <span className="font-semibold">Heads up</span> —
                        Miami-Dade requires the finished side to face outward
                        by default. Facing inward needs the neighbor to sign
                        the{" "}
                        <a
                          href="https://www.miamidade.gov/resources/economy/permits/documents/fence-waiver-for-finished-side.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold underline hover:text-brand"
                        >
                          Affidavit to Waive the Finished Side of Fence
                        </a>
                        . Attach to the permit submission.
                      </p>
                    )}
                    <input
                      type="hidden"
                      name="finishedSide"
                      value={fence.finishedSide ?? ""}
                    />
                  </EstimateSection>
                )}
              </div>
            );
          })()}
        </div>
      </StepPanel>

      {/* ── Step 3 — Layout ────────────────────────────────────── */}
      <StepPanel show={step === 2} title="Layout & dimensions">
        <div
          className={
            fenceEnabled ? "" : "opacity-40 pointer-events-none select-none"
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <NumField
              label="Total linear feet"
              name="linearFeet"
              value={fence.linearFeet}
              step={1}
              min={1}
              onChange={(v) => setFence({ ...fence, linearFeet: v })}
            />
            <NumField
              label="Post spacing (ft)"
              name="postSpacingFeet"
              value={fence.postSpacingFeet}
              step={0.5}
              min={4}
              max={12}
              onChange={(v) => setFence({ ...fence, postSpacingFeet: v })}
            />
            <NumField
              label="Number of corners"
              name="numCorners"
              value={fence.numCorners ?? 0}
              step={1}
              min={0}
              onChange={(v) => setFence({ ...fence, numCorners: v })}
            />
            <NumField
              label="Number of ends"
              name="numEnds"
              value={fence.numEnds ?? 2}
              step={1}
              min={0}
              onChange={(v) => setFence({ ...fence, numEnds: v })}
            />
          </div>
          <p className="text-xs text-slate-500">
            Corner posts are heavier-duty than line posts; end posts sit at
            terminations or where the fence meets a wall.
          </p>
        </div>
      </StepPanel>

      {/* ── Step 4 — Site conditions ──────────────────────────── */}
      <StepPanel show={step === 3} title="Site conditions">
        <div
          className={
            fenceEnabled ? "" : "opacity-40 pointer-events-none select-none"
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <SelectField
              label="Terrain"
              name="terrain"
              value={fence.terrain}
              onChange={(v) =>
                setFence({
                  ...fence,
                  terrain: v as "flat" | "sloped" | "rocky",
                })
              }
              options={[
                { value: "flat", label: "Flat (1.0×)" },
                { value: "sloped", label: "Sloped (1.15×)" },
                { value: "rocky", label: "Rocky / steep (1.30×)" },
              ]}
            />
            <SelectField
              label="Soil type"
              name="soilType"
              value={fence.soilType ?? "sand"}
              onChange={(v) => setFence({ ...fence, soilType: v as SoilType })}
              options={SOIL_TYPES.map((s) => ({
                value: s,
                label:
                  SOIL_LABELS[s] +
                  (s === "sand"
                    ? " (1.0×)"
                    : s === "clay"
                      ? " (1.1×)"
                      : " (1.4×)"),
              }))}
            />
            <SelectField
              label="Site access"
              name="access"
              value={fence.access ?? "easy"}
              onChange={(v) =>
                setFence({ ...fence, access: v as AccessType })
              }
              options={ACCESS_TYPES.map((a) => ({
                value: a,
                label:
                  ACCESS_LABELS[a] +
                  (a === "easy"
                    ? " (1.0×)"
                    : a === "limited"
                      ? " (1.15×)"
                      : " (1.25×)"),
              }))}
            />
          </div>

          <div className="border-t border-line pt-4 space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="removeExisting"
                checked={fence.removeExisting}
                onChange={(e) =>
                  setFence({
                    ...fence,
                    removeExisting: e.target.checked,
                  })
                }
                className="rounded border-line"
              />
              Tear out existing fence
            </label>
            {fence.removeExisting && (
              <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumField
                  label="Removal linear feet"
                  name="removeLinearFeet"
                  value={fence.removeLinearFeet}
                  step={1}
                  min={0}
                  onChange={(v) =>
                    setFence({ ...fence, removeLinearFeet: v })
                  }
                />
                <label className="flex items-center gap-2 text-sm self-end pb-2">
                  <input
                    type="checkbox"
                    name="haulAway"
                    checked={fence.haulAway ?? true}
                    onChange={(e) =>
                      setFence({ ...fence, haulAway: e.target.checked })
                    }
                    className="rounded border-line"
                  />
                  Haul away debris
                </label>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="poolAdjacent"
                checked={fence.poolAdjacent ?? false}
                onChange={(e) =>
                  setFence({
                    ...fence,
                    poolAdjacent: e.target.checked,
                  })
                }
                className="rounded border-line"
              />
              Pool barrier (Miami-Dade code)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="hvhz"
                checked={fence.hvhz ?? false}
                onChange={(e) =>
                  setFence({ ...fence, hvhz: e.target.checked })
                }
                className="rounded border-line"
              />
              HVHZ (high-velocity hurricane zone)
            </label>
          </div>

          {complianceWarnings.length > 0 && (
            <div className="mt-4">
              <ComplianceAlerts warnings={complianceWarnings} />
            </div>
          )}
        </div>
      </StepPanel>

      {/* ── Step 5 — Gates & motors ──────────────────────────── */}
      <StepPanel
        show={step === 4}
        title="Gates & motors"
        right={
          <button
            type="button"
            onClick={() =>
              setGates([...(fence.gates ?? []), defaultGateSpec()])
            }
            className="text-sm font-semibold text-brand hover:text-ink"
          >
            + Add gate
          </button>
        }
      >
        <div
          className={
            fenceEnabled ? "" : "opacity-40 pointer-events-none select-none"
          }
        >
          {/* Per-gate specs travel to the server as one JSON payload; the
              per-row inputs below are UI state only. */}
          <input
            type="hidden"
            name="gatesJson"
            value={JSON.stringify(fence.gates ?? [])}
          />
          {(fence.gates ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">
              No gates on this job. Use{" "}
              <span className="font-semibold">+ Add gate</span> to add one —
              each gate gets its own style, width, and motor (e.g. a 4 ft
              walk gate plus a 12 ft roll gate).
            </p>
          ) : (
            <div className="space-y-4">
              {(fence.gates ?? []).map((g, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-line bg-slate-50/50 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Gate {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setGates(
                          (fence.gates ?? []).filter((_, idx) => idx !== i),
                        )
                      }
                      className="text-sm text-slate-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SelectField
                      label="Gate style"
                      name={`gate_${i}_style`}
                      value={g.style}
                      onChange={(v) =>
                        updateGateStyle(i, v as ChoosableGateStyle)
                      }
                      options={(
                        [
                          "swing_walk",
                          "swing_drive",
                          "sliding",
                          "cantilever",
                          "bi_parting",
                        ] as ChoosableGateStyle[]
                      ).map((s) => ({
                        value: s,
                        label: GATE_STYLE_LABELS[s],
                      }))}
                    />
                    <NumField
                      label="Width (ft)"
                      name={`gate_${i}_widthFeet`}
                      value={g.widthFeet}
                      step={1}
                      min={2}
                      max={60}
                      onChange={(v) => updateGate(i, { widthFeet: v })}
                    />
                    <SelectField
                      label="Motor / opener"
                      name={`gate_${i}_motor`}
                      value={g.motor}
                      onChange={(v) => updateGate(i, { motor: v as GateMotor })}
                      options={(
                        [
                          "none",
                          "swing_single",
                          "swing_double",
                          "slide",
                          "solar",
                          "hydraulic",
                        ] as GateMotor[]
                      ).map((m) => ({
                        value: m,
                        label: GATE_MOTOR_LABELS[m],
                      }))}
                    />
                    <NumField
                      label="Quantity"
                      name={`gate_${i}_qty`}
                      value={g.qty}
                      step={1}
                      min={1}
                      max={20}
                      onChange={(v) =>
                        updateGate(i, { qty: Math.max(1, Math.round(v)) })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </StepPanel>

      {/* ── Step 6 — Add-ons & extras ─────────────────────────── */}
      <StepPanel
        show={step === 5}
        title="Add-ons & extras"
        right={
          <button
            type="button"
            onClick={() =>
              setCustomLines([
                ...customLines,
                {
                  id: Math.random().toString(36).slice(2),
                  description: "",
                  quantity: "1",
                  unit: "ea",
                  unitPrice: "0",
                },
              ])
            }
            className="text-sm font-semibold text-brand hover:text-ink"
          >
            + Blank line
          </button>
        }
      >
        {/* Permit + engineering */}
        <div className="space-y-3 border-b border-line pb-4 mb-4">
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="permitRequired"
                checked={fence.permitRequired ?? false}
                onChange={(e) =>
                  setFence({ ...fence, permitRequired: e.target.checked })
                }
                className="rounded border-line"
              />
              Building permit required
            </label>
            {fence.permitRequired && (
              <div className="ml-6 mt-2 max-w-xs">
                <NumField
                  label="Permit fee ($)"
                  name="permitDollars"
                  value={Math.round((fence.permitCents ?? 25000) / 100)}
                  step={1}
                  min={0}
                  onChange={(v) =>
                    setFence({
                      ...fence,
                      permitCents: Math.round(v * 100),
                    })
                  }
                />
              </div>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="engineeringRequired"
                checked={fence.engineeringRequired ?? false}
                onChange={(e) =>
                  setFence({
                    ...fence,
                    engineeringRequired: e.target.checked,
                  })
                }
                className="rounded border-line"
              />
              Engineering letter / sealed spec required
            </label>
            {fence.engineeringRequired && (
              <div className="ml-6 mt-2 max-w-xs">
                <NumField
                  label="Engineering fee ($)"
                  name="engineeringDollars"
                  value={Math.round((fence.engineeringCents ?? 45000) / 100)}
                  step={1}
                  min={0}
                  onChange={(v) =>
                    setFence({
                      ...fence,
                      engineeringCents: Math.round(v * 100),
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick-add chips */}
        <div className="mb-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
            Quick add
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_ADD_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addPresetLine(p)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-line bg-white hover:bg-brand-soft hover:border-brand transition-colors flex items-center gap-1.5"
              >
                <span>+ {p.label}</span>
                <span className="text-slate-400 font-mono tabular-nums">
                  ${p.defaultPriceDollars}
                  {p.defaultUnit !== "ea" && `/${p.defaultUnit}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {customLines.length === 0 ? (
          <p className="text-sm text-slate-500 border-t border-line pt-4">
            Tap a chip above for permits / cleanup / stain / etc., or use{" "}
            <span className="font-semibold">+ Blank line</span> for anything
            custom.
          </p>
        ) : (
          <ul className="space-y-3">
            {customLines.map((l, idx) => (
              <li key={l.id} className="space-y-1.5">
                <div className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  name="li_description"
                  value={l.description}
                  onChange={(e) =>
                    setCustomLines(
                      customLines.map((x, i) =>
                        i === idx ? { ...x, description: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="Description"
                  className="col-span-5 rounded-md border border-line px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  name="li_quantity"
                  value={l.quantity}
                  onChange={(e) =>
                    setCustomLines(
                      customLines.map((x, i) =>
                        i === idx ? { ...x, quantity: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="Qty"
                  className="col-span-2 rounded-md border border-line px-2 py-1.5 text-sm"
                />
                <select
                  name="li_unit"
                  value={l.unit}
                  onChange={(e) =>
                    setCustomLines(
                      customLines.map((x, i) =>
                        i === idx ? { ...x, unit: e.target.value } : x,
                      ),
                    )
                  }
                  className="col-span-2 rounded-md border border-line px-2 py-1.5 text-sm bg-white"
                >
                  <option value="ea">ea</option>
                  <option value="lf">lf</option>
                  <option value="hr">hr</option>
                  <option value="bag">bag</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  name="li_unitPrice"
                  value={l.unitPrice}
                  onChange={(e) =>
                    setCustomLines(
                      customLines.map((x, i) =>
                        i === idx ? { ...x, unitPrice: e.target.value } : x,
                      ),
                    )
                  }
                  placeholder="$ unit"
                  className="col-span-2 rounded-md border border-line px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    setCustomLines(customLines.filter((_, i) => i !== idx))
                  }
                  className="col-span-1 text-slate-400 hover:text-red-600 text-sm"
                  aria-label="Remove line"
                >
                  ✕
                </button>
                </div>
                {l.complianceHint && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 leading-relaxed">
                    ⚠ {l.complianceHint}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </StepPanel>

      {/* ── Step 7 — Pricing & review ─────────────────────────── */}
      <StepPanel show={step === 6} title="Pricing & review">
        <input type="hidden" name="afterSave" value={afterSave} />
        {/* Visualization preview teaser. Shown when the contractor has
            picked a fence type — the actual visualization happens on
            /estimates/[id]/visualize after save (we need an estimate
            ID to attach uploaded photos to). The "Save and visualize"
            button on the bottom bar sets afterSave="visualize" so the
            redirect after createEstimate lands here directly. */}
        {fence.fenceType && (
          <div className="mb-6 rounded-xl border-2 border-ink overflow-hidden bg-ink shadow-[6px_6px_0_var(--brand)]">
            <div className="px-4 py-3 bg-ink/95 border-b border-paper/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-paper">
                <Sparkles className="w-4 h-4 text-brand" />
                <span
                  className="uppercase tracking-wider"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "var(--text-md)",
                    letterSpacing: "0.005em",
                  }}
                >
                  Fence Preview
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-paper/60 font-semibold">
                Available after save
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-paper/30" />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-ink/80 text-paper text-[10px] uppercase tracking-wider font-bold">
                  Before
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-center text-paper/60 text-[10px] uppercase tracking-wider font-semibold">
                  Property photo · No fence
                </div>
              </div>
              <div className="relative aspect-[16/10] bg-gradient-to-br from-ink via-ink-deep to-brand-dark flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-brand/40" />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-brand text-ink text-[10px] uppercase tracking-wider font-bold">
                  After
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-center text-paper/70 text-[10px] uppercase tracking-wider font-semibold">
                  {fence.heightFeet} ft{" "}
                  {FENCE_TYPE_LABELS[fence.fenceType].toLowerCase()}{" "}
                  rendered
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-ink text-paper text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-paper/80">
                Save the estimate, then upload property photos. Renders
                drop into the customer&apos;s quote automatically.
              </div>
              <Sparkles className="w-4 h-4 text-brand shrink-0 hidden sm:block" />
            </div>
          </div>
        )}

        {/* Labor mode */}
        <div className="mb-5">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
            Labor pricing
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <ModeButton
              selected={labor.mode === "per_foot"}
              onClick={() => setLaborMode("per_foot")}
            >
              Per foot
            </ModeButton>
            <ModeButton
              selected={labor.mode === "per_hour"}
              onClick={() => setLaborMode("per_hour")}
            >
              Per hour (crew)
            </ModeButton>
          </div>
          <input type="hidden" name="laborMode" value={labor.mode} />
          {labor.mode === "per_foot" ? (
            <div className="max-w-xs">
              <NumField
                label="Rate per foot ($)"
                name="laborRatePerFootDollars"
                value={Math.round((labor.ratePerFootCents / 100) * 100) / 100}
                step={0.5}
                min={0}
                onChange={(v) =>
                  setFence({
                    ...fence,
                    labor: {
                      mode: "per_foot",
                      ratePerFootCents: Math.round(v * 100),
                    },
                  })
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              <NumField
                label="Rate per hour ($)"
                name="laborRatePerHourDollars"
                value={Math.round((labor.ratePerHourCents / 100) * 100) / 100}
                step={1}
                min={0}
                onChange={(v) =>
                  setFence({
                    ...fence,
                    labor: {
                      ...labor,
                      ratePerHourCents: Math.round(v * 100),
                    },
                  })
                }
              />
              <NumField
                label="Crew size"
                name="crewSize"
                value={labor.crewSize}
                step={1}
                min={1}
                onChange={(v) =>
                  setFence({
                    ...fence,
                    labor: {
                      ...labor,
                      crewSize: Math.max(1, Math.round(v)),
                    },
                  })
                }
              />
              <NumField
                label="Estimated hours"
                name="estimatedHours"
                value={labor.estimatedHours}
                step={0.5}
                min={0}
                onChange={(v) =>
                  setFence({
                    ...fence,
                    labor: { ...labor, estimatedHours: v },
                  })
                }
              />
            </div>
          )}
        </div>

        {/* Margin mode */}
        <div className="mb-5 border-t border-line pt-5">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
            Margin / pricing strategy
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <ModeButton
              selected={margin.mode === "percent"}
              onClick={() => setMarginMode("percent")}
            >
              Percent markup
            </ModeButton>
            <ModeButton
              selected={margin.mode === "fixed"}
              onClick={() => setMarginMode("fixed")}
            >
              Fixed profit
            </ModeButton>
            <ModeButton
              selected={margin.mode === "minimum"}
              onClick={() => setMarginMode("minimum")}
            >
              Minimum job price
            </ModeButton>
          </div>
          <input type="hidden" name="marginMode" value={margin.mode} />
          {margin.mode === "percent" && (
            <div className="max-w-xs">
              <NumField
                label="Markup (%)"
                name="marginPercent"
                value={Math.round(margin.value * 1000) / 10}
                step={0.5}
                min={0}
                onChange={updatePercentMargin}
              />
            </div>
          )}
          {margin.mode === "fixed" && (
            <div className="max-w-xs">
              <NumField
                label="Profit ($)"
                name="marginFixedDollars"
                value={Math.round(margin.cents / 100)}
                step={10}
                min={0}
                onChange={updateFixedMargin}
              />
            </div>
          )}
          {margin.mode === "minimum" && (
            <div className="max-w-xs">
              <NumField
                label="Minimum job price ($)"
                name="marginMinimumDollars"
                value={Math.round(margin.floorCents / 100)}
                step={50}
                min={0}
                onChange={updateMinimumMargin}
              />
            </div>
          )}
        </div>

        {/* Tax */}
        <div className="mb-5 border-t border-line pt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tax rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              name="taxRate"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Deposit */}
        <div className="mb-5 border-t border-line pt-5">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
            Deposit due upon acceptance
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mode
              </label>
              <select
                name="depositMode"
                value={depositMode}
                onChange={(e) =>
                  setDepositMode(
                    e.target.value as "none" | "percent" | "fixed",
                  )
                }
                className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
              >
                <option value="percent">Percent of total</option>
                <option value="fixed">Fixed dollar amount</option>
                <option value="none">No deposit</option>
              </select>
            </div>
            {depositMode === "percent" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Percent (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={100}
                  name="depositPercent"
                  value={depositPercent}
                  onChange={(e) =>
                    setDepositPercent(parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded-md border border-line px-3 py-2 text-sm"
                />
              </div>
            )}
            {depositMode === "fixed" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Deposit amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  name="depositFixedDollars"
                  value={depositFixedDollars}
                  onChange={(e) =>
                    setDepositFixedDollars(parseFloat(e.target.value) || 0)
                  }
                  className="w-full rounded-md border border-line px-3 py-2 text-sm"
                />
              </div>
            )}
            {depositMode !== "none" && (
              <div className="rounded border border-line bg-slate-50 px-3 py-2 text-sm">
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                  Deposit
                </div>
                <div className="font-mono tabular-nums text-ink font-semibold">
                  {formatMoney(depositCents)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Balance due {formatMoney(balanceDueCents)}
                </div>
              </div>
            )}
          </div>
          {/* Hidden submitters for whichever value isn't currently visible —
              keeps both fields in the FormData so the server always gets both. */}
          {depositMode !== "percent" && (
            <input type="hidden" name="depositPercent" value={depositPercent} />
          )}
          {depositMode !== "fixed" && (
            <input
              type="hidden"
              name="depositFixedDollars"
              value={depositFixedDollars}
            />
          )}
        </div>

        {/* Notes & terms */}
        <div className="border-t border-line pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes (visible to client)
            </label>
            <textarea
              name="notes"
              rows={5}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Terms
            </label>
            <textarea
              name="terms"
              rows={6}
              defaultValue={`50% deposit due upon acceptance. Balance due upon completion.

After installation, the owner is responsible for maintaining the fence in good repair per Miami-Dade Sec. 17-28 / Sec. 19-15.11 — exterior surfaces protected from the elements by paint or coating, free of structural deterioration, sagging, cracking, rotting, graffiti, or peeling.`}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Compliance summary */}
        {complianceWarnings.length > 0 && (
          <div className="mt-5">
            <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
              Compliance summary
            </div>
            <ComplianceAlerts warnings={complianceWarnings} />
          </div>
        )}

        {/* Calc preview */}
        <div className="mt-5 bg-paper rounded-md border border-line p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
            Line items
          </div>
          <ul className="space-y-1 text-sm">
            {fenceCalc.lines.map((l, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-3"
              >
                <span className="text-slate-700">{l.description}</span>
                <span className="text-slate-500 font-mono tabular-nums whitespace-nowrap">
                  {l.quantity} {l.unit} × {formatMoney(l.unitPriceCents)} ={" "}
                  <span className="text-ink font-medium">
                    {formatMoney(l.totalCents)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </StepPanel>

      {state.message && (
        <p className="text-sm text-red-600 mt-2" aria-live="polite">
          {state.message}
        </p>
      )}

      {/* Bottom navigation bar. On mobile it's fixed to the bottom edge for
          thumb access; on desktop it's just a right-aligned button row. */}
      <div className="fixed sm:static bottom-0 left-0 right-0 mt-6 sm:mt-8 border-t-2 sm:border-0 border-ink bg-paper sm:bg-transparent px-4 sm:px-0 py-3 sm:py-0 z-10">
        <div className="flex items-center justify-end gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={prev}
            >
              ← Back
            </Button>
          )}
          {step === 0 && (
            <LinkButton href="/estimates" variant="secondary" size="md">
              Cancel
            </LinkButton>
          )}
          {step < 6 ? (
            <Button
              type="button"
              size="md"
              disabled={!canAdvance[step]}
              onClick={next}
            >
              Next →
            </Button>
          ) : (
            <>
              {fence.fenceType && (
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  disabled={pending || blocker}
                  onClick={() => setAfterSave("visualize")}
                  title="Save and jump straight into the photo + render workflow"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Save & visualize
                </Button>
              )}
              <Button
                type="submit"
                size="md"
                disabled={pending || blocker}
                onClick={() => setAfterSave("view")}
              >
                {pending
                  ? "Saving…"
                  : blocker
                    ? "Resolve blocker"
                    : "Create estimate"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-24 sm:h-0" />
    </form>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function StepPanel({
  show,
  title,
  right,
  children,
}: {
  show: boolean;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      hidden={!show}
      className="bg-white rounded-lg border border-line"
    >
      <header className="flex items-center justify-between px-4 py-3 border-b border-line">
        <h2 className="h-card">{title}</h2>
        {right}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function NumField({
  label,
  name,
  value,
  onChange,
  step,
  min,
  max,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}

function EstimateSection({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-md border border-line bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-paper transition-colors text-left"
      >
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide font-semibold text-slate-500">
            {title}
          </div>
          <div
            className="h-card text-ink mt-0.5 truncate"
            style={{ fontSize: "var(--text-md)" }}
          >
            {summary}
          </div>
        </div>
        <ChevronDown
          size={20}
          className={cn(
            "shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-line">{children}</div>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  hideLabel = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  /** When true, label is rendered with `sr-only` (screen-reader-only). Use
   *  when a parent context already names the field (e.g. accordion title). */
  hideLabel?: boolean;
}) {
  return (
    <div>
      <label
        className={
          hideLabel
            ? "sr-only"
            : "block text-sm font-medium text-slate-700 mb-1"
        }
      >
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-line px-3 py-2 text-sm bg-white focus:border-brand focus:ring-2 focus:ring-brand"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  helperText,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand"
      />
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ModeButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "px-3 py-2 rounded-md border text-sm font-medium transition-colors",
        selected
          ? "border-brand bg-brand-soft text-ink"
          : "border-line bg-white hover:border-brand text-slate-700",
      )}
    >
      {children}
    </button>
  );
}
