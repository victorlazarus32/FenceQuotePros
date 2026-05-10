// Fence-contractor specific pricing engine.
// Defaults are a reasonable national-average baseline; contractors override per-estimate.

export type FenceType =
  | "chain_link"
  | "wood_privacy"
  | "wood_picket"
  | "vinyl"
  | "aluminum"
  | "wrought_iron"
  | "composite"
  | "dura_fence"
  | "concrete_wall"
  | "concrete_column";

// Display labels are surfaced verbatim in the dropdown, the section summary,
// and the priced line description. Some include "fence" in the name, some
// don't (e.g. "Concrete Wall") — the line-description code uses the label as
// the full prefix and doesn't append " fence" to avoid "Wood Fence fence".
export const FENCE_TYPE_LABELS: Record<FenceType, string> = {
  chain_link: "Chain Link Fence",
  wood_privacy: "Wood Fence",
  wood_picket: "Wood Picket",
  vinyl: "PVC",
  aluminum: "Aluminum Fence",
  wrought_iron: "Wrought Iron",
  composite: "Composite",
  dura_fence: "DuraFence (Metal Fence)",
  concrete_wall: "Concrete Wall",
  concrete_column: "Concrete Column",
};

// Base price per linear foot at the most common (6 ft) height, in cents.
const BASE_PRICE_PER_LF_CENTS: Record<FenceType, number> = {
  chain_link: 1800,
  wood_privacy: 3500,
  wood_picket: 2800,
  vinyl: 4500,
  aluminum: 4800,
  wrought_iron: 6500,
  composite: 5500,
  dura_fence: 5000,
  concrete_wall: 8000,
  concrete_column: 3000,
};

// Per-foot of height above 4 ft (extra material + labor).
const HEIGHT_UPCHARGE_PER_FOOT_CENTS: Record<FenceType, number> = {
  chain_link: 350,
  wood_privacy: 700,
  wood_picket: 500,
  vinyl: 900,
  aluminum: 950,
  wrought_iron: 1200,
  composite: 1100,
  dura_fence: 1000,
  concrete_wall: 1500,
  concrete_column: 800,
};

// Per-post material cost (post + concrete + cap).
const POST_COST_CENTS: Record<FenceType, number> = {
  chain_link: 2200,
  wood_privacy: 1800,
  wood_picket: 1600,
  vinyl: 3500,
  aluminum: 4000,
  wrought_iron: 5500,
  composite: 4200,
  dura_fence: 4500,
  concrete_wall: 0, // continuous footer, not per-post
  concrete_column: 15000, // each column is essentially the post itself
};

// Style options per fence type — what the picket / panel / mesh actually
// looks like. Pricing impact is not modeled yet; recorded on the line so the
// customer doc shows what was selected (e.g. "Wood privacy — board-on-board").
export type StyleOption = { value: string; label: string };

export const STYLE_OPTIONS_BY_TYPE: Record<FenceType, StyleOption[]> = {
  wood_privacy: [
    { value: "shadowbox", label: "Shadow box" },
    { value: "board_on_board", label: "Board on board" },
    { value: "semi_privacy", label: "Semi-private" },
    { value: "horizontal", label: "Horizontal" },
  ],
  wood_picket: [
    { value: "dog_ear", label: "Dog-ear" },
    { value: "gothic", label: "Gothic" },
    { value: "french_gothic", label: "French Gothic" },
    { value: "scallop", label: "Scallop top" },
    { value: "spaced", label: "Spaced picket" },
  ],
  vinyl: [
    { value: "privacy_solid", label: "Solid privacy panel" },
    { value: "privacy_lattice_top", label: "Privacy w/ lattice top" },
    { value: "picket_classic", label: "Classic picket" },
    { value: "picket_gothic", label: "Gothic picket" },
    { value: "split_rail", label: "Split rail" },
    { value: "ranch_rail", label: "Ranch rail" },
  ],
  aluminum: [
    { value: "flat_top_3rail", label: "Flat-top, 3-rail" },
    { value: "spear_top", label: "Spear-point top" },
    { value: "rings_circles", label: "Rings & circles" },
    { value: "press_point", label: "Pressed-point" },
    { value: "puppy_picket", label: "Puppy picket (close-spaced)" },
    { value: "horizontal_no_gap", label: "Horizontal — no gaps" },
    { value: "horizontal_3in_1in_gap", label: "Horizontal 3\" with 1\" gap" },
    { value: "horizontal_3in_2in_gap", label: "Horizontal 3\" with 2\" gap" },
    { value: "horizontal_3in_3in_gap", label: "Horizontal 3\" with 3\" gap" },
  ],
  wrought_iron: [
    { value: "spear_classic", label: "Classic spear-point" },
    { value: "ball_top", label: "Ball-top" },
    { value: "scrollwork", label: "Scrollwork" },
    { value: "flat_top_3rail", label: "Flat-top, 3-rail" },
    { value: "puppy_picket", label: "Puppy picket" },
  ],
  chain_link: [
    { value: "standard", label: "Standard mesh" },
    { value: "with_top_rail", label: "With top rail" },
    { value: "with_top_tension", label: "Top tension wire only" },
    { value: "knuckle_top", label: "Knuckle-top selvedge" },
    { value: "barbed_top", label: "Barbed-top selvedge" },
    { value: "with_slats", label: "With privacy slats" },
  ],
  composite: [
    { value: "horizontal", label: "Horizontal slat" },
    { value: "vertical", label: "Vertical board" },
    { value: "tongue_and_groove", label: "Tongue-and-groove" },
    { value: "louvered", label: "Louvered" },
  ],
  dura_fence: [
    { value: "panel_vertical", label: "Solid panel — vertical" },
    { value: "panel_horizontal", label: "Solid panel — horizontal" },
    { value: "panel_with_top_trim", label: "Panel with decorative top trim" },
  ],
  concrete_wall: [
    { value: "cbs_stucco", label: "CBS — stucco both sides" },
    { value: "decorative_masonry", label: "Decorative masonry — painted" },
    { value: "decorative_brick", label: "Decorative brick" },
    { value: "natural_stone", label: "Natural stone" },
  ],
  concrete_column: [
    { value: "square_standard", label: "Square column" },
    { value: "square_decorative", label: "Square column — decorative cap" },
    { value: "round_standard", label: "Round column" },
    { value: "pier_panel", label: "Pier (between fence panels)" },
  ],
};

// Color / finish options per fence type. Same modeling principle: descriptive,
// no pricing impact yet.
export type ColorOption = { value: string; label: string; swatch?: string };

export const COLOR_OPTIONS_BY_TYPE: Record<FenceType, ColorOption[]> = {
  wood_privacy: [
    { value: "natural", label: "Natural / unstained", swatch: "#c9a46a" },
    { value: "cedar", label: "Pine — natural tone", swatch: "#a0673b" },
    { value: "walnut", label: "Walnut stain", swatch: "#5a3a22" },
    { value: "redwood", label: "Redwood stain", swatch: "#8b3a2a" },
    { value: "black_stain", label: "Black stain", swatch: "#1a1a1a" },
    { value: "white_paint", label: "White paint", swatch: "#f5f5f0" },
    { value: "custom", label: "Custom (specify in notes)" },
  ],
  wood_picket: [
    { value: "natural", label: "Natural / unstained", swatch: "#c9a46a" },
    { value: "white_paint", label: "White paint", swatch: "#f5f5f0" },
    { value: "cedar", label: "Pine — natural tone", swatch: "#a0673b" },
    { value: "walnut", label: "Walnut stain", swatch: "#5a3a22" },
    { value: "black_stain", label: "Black stain", swatch: "#1a1a1a" },
    { value: "custom", label: "Custom" },
  ],
  vinyl: [
    { value: "white", label: "White", swatch: "#ffffff" },
    { value: "tan", label: "Tan / almond", swatch: "#c8b793" },
    { value: "khaki", label: "Khaki", swatch: "#9c8c6e" },
    { value: "gray", label: "Gray", swatch: "#888c90" },
    { value: "black", label: "Black", swatch: "#1a1a1a" },
    { value: "wood_grain_oak", label: "Wood-grain — oak", swatch: "#a87a48" },
    { value: "wood_grain_walnut", label: "Wood-grain — walnut", swatch: "#5a3a22" },
  ],
  aluminum: [
    { value: "black", label: "Black", swatch: "#1a1a1a" },
    { value: "bronze", label: "Bronze", swatch: "#5e4630" },
    { value: "white", label: "White", swatch: "#ffffff" },
    { value: "sandstone", label: "Sandstone", swatch: "#c8b58a" },
    { value: "hartford_green", label: "Hartford green", swatch: "#1f4e3d" },
    { value: "charcoal", label: "Charcoal", swatch: "#3a3a3a" },
  ],
  wrought_iron: [
    { value: "black_gloss", label: "Black (gloss)", swatch: "#0d0d0d" },
    { value: "black_matte", label: "Black (matte)", swatch: "#1a1a1a" },
    { value: "bronze", label: "Bronze", swatch: "#5e4630" },
    { value: "white", label: "White", swatch: "#ffffff" },
    { value: "custom", label: "Custom paint" },
  ],
  chain_link: [
    { value: "galvanized", label: "Galvanized (silver)", swatch: "#b8b8b8" },
    { value: "vinyl_black", label: "Vinyl-coated — black", swatch: "#1a1a1a" },
    { value: "vinyl_green", label: "Vinyl-coated — green", swatch: "#2f5c3a" },
    { value: "vinyl_brown", label: "Vinyl-coated — brown", swatch: "#5e4630" },
    { value: "vinyl_white", label: "Vinyl-coated — white", swatch: "#f5f5f0" },
  ],
  composite: [
    { value: "tropical_walnut", label: "Tropical walnut", swatch: "#5a3a22" },
    { value: "espresso", label: "Espresso", swatch: "#3a2418" },
    { value: "gray", label: "Gray", swatch: "#888c90" },
    { value: "tan", label: "Tan", swatch: "#c8b793" },
    { value: "weathered_cedar", label: "Weathered grey", swatch: "#9a8268" },
  ],
  dura_fence: [
    { value: "black", label: "Black", swatch: "#1a1a1a" },
    { value: "bronze", label: "Bronze", swatch: "#5e4630" },
    { value: "tan", label: "Tan", swatch: "#c8b793" },
    { value: "galvanized", label: "Galvanized", swatch: "#b8b8b8" },
    { value: "white", label: "White", swatch: "#ffffff" },
    { value: "custom", label: "Custom (specify)" },
  ],
  concrete_wall: [
    { value: "natural_gray", label: "Natural gray", swatch: "#9a9a9a" },
    { value: "white_paint", label: "White paint", swatch: "#f5f5f0" },
    { value: "off_white_paint", label: "Off-white paint", swatch: "#e8e3d4" },
    { value: "tan_paint", label: "Tan paint", swatch: "#c8b793" },
    { value: "custom", label: "Custom (specify)" },
  ],
  concrete_column: [
    { value: "natural_gray", label: "Natural gray", swatch: "#9a9a9a" },
    { value: "white_paint", label: "White paint", swatch: "#f5f5f0" },
    { value: "off_white_paint", label: "Off-white paint", swatch: "#e8e3d4" },
    { value: "tan_paint", label: "Tan paint", swatch: "#c8b793" },
    { value: "custom", label: "Custom (specify)" },
  ],
};

// Helper for the form: when fence type changes, jump style + color to the
// first available option for the new type. Caller passes current values; we
// return the new values (possibly the same if still valid).
export function reconcileStyleColor(
  fenceType: FenceType,
  currentStyle: string | undefined,
  currentColor: string | undefined,
): { style: string; color: string } {
  const styles = STYLE_OPTIONS_BY_TYPE[fenceType];
  const colors = COLOR_OPTIONS_BY_TYPE[fenceType];
  const style =
    currentStyle && styles.some((s) => s.value === currentStyle)
      ? currentStyle
      : (styles[0]?.value ?? "");
  const color =
    currentColor && colors.some((c) => c.value === currentColor)
      ? currentColor
      : (colors[0]?.value ?? "");
  return { style, color };
}

// Gate add-ons — base prices for swing gates (single walk / double drive).
// Sliding/cantilever/bi-parting variants apply a multiplier (track + rollers
// + heavier construction). See GATE_STYLE_MULTIPLIER below.
export const GATE_SINGLE_CENTS: Record<FenceType, number> = {
  chain_link: 18000,
  wood_privacy: 32000,
  wood_picket: 22000,
  vinyl: 45000,
  aluminum: 55000,
  wrought_iron: 75000,
  composite: 60000,
  dura_fence: 60000,
  concrete_wall: 80000,
  concrete_column: 60000,
};

export const GATE_DOUBLE_CENTS: Record<FenceType, number> = {
  chain_link: 32000,
  wood_privacy: 58000,
  wood_picket: 42000,
  vinyl: 80000,
  aluminum: 95000,
  wrought_iron: 130000,
  composite: 110000,
  dura_fence: 100000,
  concrete_wall: 130000,
  concrete_column: 100000,
};

// Gate style — affects price (sliding > swing because of track + rollers).
// "none" is for jobs without any gates (multiplier irrelevant since gate count = 0).
export type GateStyle =
  | "swing_walk"
  | "swing_drive"
  | "sliding"
  | "cantilever"
  | "bi_parting"
  | "none";

export const GATE_STYLE_LABELS: Record<GateStyle, string> = {
  swing_walk: "Swing — walk gate",
  swing_drive: "Swing — drive gate (double)",
  sliding: "Sliding (rolling on track)",
  cantilever: "Cantilever (track-free)",
  bi_parting: "Bi-parting (two halves)",
  none: "No gates",
};

const GATE_STYLE_MULTIPLIER: Record<GateStyle, number> = {
  swing_walk: 1.0,
  swing_drive: 1.0,
  sliding: 1.4,
  cantilever: 1.7,
  bi_parting: 1.6,
  none: 1.0,
};

// Gate motors / openers. Applied per automated gate.
export type GateMotor =
  | "none"
  | "swing_single"
  | "swing_double"
  | "slide"
  | "solar"
  | "hydraulic";

export const GATE_MOTOR_LABELS: Record<GateMotor, string> = {
  none: "Manual (no motor)",
  swing_single: "Swing operator — single arm",
  swing_double: "Swing operator — dual arm",
  slide: "Slide gate operator",
  solar: "Solar-powered operator",
  hydraulic: "Hydraulic operator (commercial)",
};

const GATE_MOTOR_PRICE_CENTS: Record<GateMotor, number> = {
  none: 0,
  swing_single: 89000,
  swing_double: 145000,
  slide: 175000,
  solar: 215000,
  hydraulic: 350000,
};

const TERRAIN_MULTIPLIER: Record<string, number> = {
  flat: 1.0,
  sloped: 1.15,
  rocky: 1.3,
};

const REMOVAL_PER_LF_CENTS = 400;

// One-tap add-on presets — used by the form's quick-add chips.
// Tapping a chip drops a prefilled custom line into the estimate; the contractor
// can adjust qty/price after.
export type QuickAddPreset = {
  id: string;
  label: string;
  description: string;
  defaultQty: number;
  defaultUnit: string;
  defaultPriceDollars: number;
  /**
   * Optional compliance reminder shown to the contractor when this preset is
   * added — e.g. zoning restrictions or permit requirements that affect when
   * the option is allowed. Surfaced in the form UI, not on the customer doc.
   */
  complianceHint?: string;
};

export const QUICK_ADD_PRESETS: QuickAddPreset[] = [
  {
    id: "permit",
    label: "Permit fee",
    description: "Building permit & filing fees",
    defaultQty: 1,
    defaultUnit: "ea",
    defaultPriceDollars: 250,
  },
  {
    id: "cleanup",
    label: "Site cleanup",
    description: "Post-installation cleanup & haul-off",
    defaultQty: 1,
    defaultUnit: "ea",
    defaultPriceDollars: 200,
  },
  {
    id: "hard_dig",
    label: "Hard dig",
    description: "Hard-dig surcharge (rocky / root-bound)",
    defaultQty: 1,
    defaultUnit: "lf",
    defaultPriceDollars: 4,
  },
  {
    id: "stain",
    label: "Stain & seal",
    description: "Stain & seal (both sides)",
    defaultQty: 1,
    defaultUnit: "lf",
    defaultPriceDollars: 1.5,
  },
  {
    id: "paint",
    label: "Custom paint",
    description: "Custom paint finish",
    defaultQty: 1,
    defaultUnit: "lf",
    defaultPriceDollars: 2.25,
  },
  {
    id: "engineering",
    label: "PE letter",
    description: "Engineering letter (HVHZ / non-standard)",
    defaultQty: 1,
    defaultUnit: "ea",
    defaultPriceDollars: 450,
  },
  {
    id: "survey",
    label: "Survey staking",
    description: "Property survey corner staking & flagging",
    defaultQty: 1,
    defaultUnit: "ea",
    defaultPriceDollars: 175,
  },
  {
    id: "post_caps",
    label: "Decorative post caps",
    description: "Decorative post caps",
    defaultQty: 1,
    defaultUnit: "ea",
    defaultPriceDollars: 8,
  },
  {
    id: "barbed_wire",
    label: "Barbed wire top",
    description: "Barbed wire — 3 strands at top of fence",
    defaultQty: 1,
    defaultUnit: "lf",
    defaultPriceDollars: 3.5,
    complianceHint:
      'Per Miami-Dade Sec. 33-11(g): barbed wire is permitted only in AU zoning. In BU/IU districts it\'s allowed only as a 16" angle extension on top of fences ≥ 6 ft (max 3 strands), and it cannot extend over rights-of-way or neighboring properties. Verify zoning before quoting.',
  },
  {
    id: "privacy_slats",
    label: "Privacy slats",
    description: "Privacy slats (chain-link insert)",
    defaultQty: 1,
    defaultUnit: "lf",
    defaultPriceDollars: 6,
    complianceHint:
      "Per Miami-Dade Sec. 33-11(b)(7): cloth / fabric / mesh / privacy slats may not be used as fence material in residential RU/EU districts. Allowed in IU, BU, OPD, RU-4A, RU-5, RU-5A. If required by law in a residential zone, a separate building permit is required.",
  },
  {
    id: "trim_top",
    label: "Top trim / lattice",
    description: "Decorative top trim or lattice",
    defaultQty: 1,
    defaultUnit: "lf",
    defaultPriceDollars: 8,
  },
  {
    id: "self_close_latch",
    label: "Self-close latch",
    description: "Self-closing self-latching pool gate hardware (54\" min)",
    defaultQty: 1,
    defaultUnit: "ea",
    defaultPriceDollars: 32,
  },
];

// ════════════════════════════════════════════════════════════════════
// MODULAR ENGINE — types + reference data
// Spec sections: 3.2 (material props), 3.5 (site), 3.7 (labor),
//                3.8 (posts/materials), 3.9 (permits), 3.10 (pricing)
// ════════════════════════════════════════════════════════════════════

// — Site conditions §3.5 ——————————————————————————————————————

export type SoilType = "sand" | "clay" | "rock";

export const SOIL_LABELS: Record<SoilType, string> = {
  sand: "Sand / sandy",
  clay: "Clay",
  rock: "Rock / hardpan",
};

const SOIL_MULTIPLIER: Record<SoilType, number> = {
  sand: 1.0,
  clay: 1.1,
  rock: 1.4,
};

export type AccessType = "easy" | "limited" | "restricted";

export const ACCESS_LABELS: Record<AccessType, string> = {
  easy: "Easy (open lot, machine access)",
  limited: "Limited (narrow gates, side yards)",
  restricted: "Restricted (wheelbarrow, hand-carry only)",
};

const ACCESS_MULTIPLIER: Record<AccessType, number> = {
  easy: 1.0,
  limited: 1.15,
  restricted: 1.25,
};

// — Material properties §3.2 ——————————————————————————————————

export type MaterialProperties = {
  costPerFootMinCents: number;
  costPerFootMaxCents: number;
  laborDifficultyMultiplier: number;
  wasteFactor: number;
  railsPerSection: number;
  picketsPerFoot: number;
  concreteCuFtPerPost: number;
};

export const MATERIAL_PROPERTIES: Record<FenceType, MaterialProperties> = {
  chain_link: {
    costPerFootMinCents: 800,
    costPerFootMaxCents: 1200,
    laborDifficultyMultiplier: 0.9,
    wasteFactor: 0.05,
    railsPerSection: 1,
    picketsPerFoot: 0,
    concreteCuFtPerPost: 0.5,
  },
  wood_privacy: {
    costPerFootMinCents: 1200,
    costPerFootMaxCents: 1800,
    laborDifficultyMultiplier: 1.0,
    wasteFactor: 0.1,
    railsPerSection: 2,
    picketsPerFoot: 2.5,
    concreteCuFtPerPost: 0.7,
  },
  wood_picket: {
    costPerFootMinCents: 900,
    costPerFootMaxCents: 1400,
    laborDifficultyMultiplier: 0.95,
    wasteFactor: 0.08,
    railsPerSection: 2,
    picketsPerFoot: 1.6,
    concreteCuFtPerPost: 0.6,
  },
  vinyl: {
    costPerFootMinCents: 2200,
    costPerFootMaxCents: 2800,
    laborDifficultyMultiplier: 1.05,
    wasteFactor: 0.05,
    railsPerSection: 2,
    picketsPerFoot: 0,
    concreteCuFtPerPost: 0.7,
  },
  aluminum: {
    costPerFootMinCents: 2200,
    costPerFootMaxCents: 2800,
    laborDifficultyMultiplier: 1.1,
    wasteFactor: 0.05,
    railsPerSection: 2,
    picketsPerFoot: 3.0,
    concreteCuFtPerPost: 0.7,
  },
  wrought_iron: {
    costPerFootMinCents: 3200,
    costPerFootMaxCents: 4000,
    laborDifficultyMultiplier: 1.4,
    wasteFactor: 0.05,
    railsPerSection: 2,
    picketsPerFoot: 3.0,
    concreteCuFtPerPost: 0.8,
  },
  composite: {
    costPerFootMinCents: 2800,
    costPerFootMaxCents: 3600,
    laborDifficultyMultiplier: 1.1,
    wasteFactor: 0.05,
    railsPerSection: 2,
    picketsPerFoot: 0,
    concreteCuFtPerPost: 0.7,
  },
  dura_fence: {
    costPerFootMinCents: 2500,
    costPerFootMaxCents: 3500,
    laborDifficultyMultiplier: 1.15,
    wasteFactor: 0.05,
    railsPerSection: 2,
    picketsPerFoot: 0,
    concreteCuFtPerPost: 0.7,
  },
  concrete_wall: {
    costPerFootMinCents: 3500,
    costPerFootMaxCents: 5500,
    laborDifficultyMultiplier: 1.5,
    wasteFactor: 0.08,
    railsPerSection: 0,
    picketsPerFoot: 0,
    concreteCuFtPerPost: 0,
  },
  concrete_column: {
    costPerFootMinCents: 1500,
    costPerFootMaxCents: 2500,
    laborDifficultyMultiplier: 1.4,
    wasteFactor: 0.05,
    railsPerSection: 0,
    picketsPerFoot: 0,
    concreteCuFtPerPost: 1.5,
  },
};

export function defaultMaterialCostPerFootCents(t: FenceType): number {
  const p = MATERIAL_PROPERTIES[t];
  return Math.round((p.costPerFootMinCents + p.costPerFootMaxCents) / 2);
}

// — Labor §3.7 ————————————————————————————————————————————————

export type LaborConfig =
  | { mode: "per_foot"; ratePerFootCents: number }
  | {
      mode: "per_hour";
      ratePerHourCents: number;
      crewSize: number;
      estimatedHours: number;
    };

const DEFAULT_LABOR_PER_FOOT_CENTS: Record<FenceType, number> = {
  chain_link: 1200,
  wood_privacy: 1800,
  wood_picket: 1500,
  vinyl: 2000,
  aluminum: 2200,
  wrought_iron: 2800,
  composite: 2300,
  dura_fence: 2400,
  concrete_wall: 3500,
  concrete_column: 2200,
};

export function defaultLaborConfig(t: FenceType): LaborConfig {
  return {
    mode: "per_foot",
    ratePerFootCents: DEFAULT_LABOR_PER_FOOT_CENTS[t],
  };
}

// — Pricing strategy §3.10 ————————————————————————————————————

export type TierRule = {
  minLf: number;
  maxLf?: number;
  ratePerFootCents: number;
};

export type MarginConfig =
  | { mode: "percent"; value: number }
  | { mode: "fixed"; cents: number }
  | { mode: "minimum"; floorCents: number };

export type PricingConfig = {
  tiers?: TierRule[];
  margin?: MarginConfig;
};

const DEFAULT_MARGIN_PERCENT = 0.2;
export const DEFAULT_MARGIN: MarginConfig = {
  mode: "percent",
  value: DEFAULT_MARGIN_PERCENT,
};

export function pickTierRate(
  tiers: TierRule[] | undefined,
  lf: number,
): number | null {
  if (!tiers || tiers.length === 0) return null;
  for (const t of tiers) {
    if (lf >= t.minLf && (t.maxLf == null || lf < t.maxLf)) {
      return t.ratePerFootCents;
    }
  }
  return tiers[tiers.length - 1].ratePerFootCents;
}

// — Concrete & misc constants —————————————————————————————————

const CONCRETE_CUFT_PER_BAG = 0.6;
const DEFAULT_REMOVAL_PER_LF_CENTS = 400;
const DEFAULT_PERMIT_CENTS = 25000;
const DEFAULT_ENGINEERING_CENTS = 45000;

// — Calc input ————————————————————————————————————————————————

export type FenceCalcInput = {
  // Core dimensions
  fenceType: FenceType;
  heightFeet: number;
  linearFeet: number;
  postSpacingFeet: number;

  // Layout §3.3
  numGatesSingle: number;
  numGatesDouble: number;
  numCorners?: number;
  numEnds?: number;

  // Site §3.5
  terrain: "flat" | "sloped" | "rocky";
  soilType?: SoilType;
  access?: AccessType;
  poolAdjacent?: boolean;
  hvhz?: boolean;

  // Aesthetic
  style?: string;
  color?: string;

  // Gates §3.4
  gateStyle?: GateStyle;
  gateMotor?: GateMotor;

  // Removal & prep §3.6
  removeExisting: boolean;
  removeLinearFeet: number;
  removalRatePerFootCentsOverride?: number;
  haulAway?: boolean;

  // Material overrides §3.2
  costPerFootCentsOverride?: number;
  wasteFactorOverride?: number;

  // Labor §3.7
  labor?: LaborConfig;

  // Permits & engineering §3.9
  permitRequired?: boolean;
  permitCents?: number;
  engineeringRequired?: boolean;
  engineeringCents?: number;

  // Pricing strategy §3.10
  pricing?: PricingConfig;

  // Wood-fence orientation — which side gets the smooth/finished face.
  // Only meaningful for one-sided wood styles; "both" applies to shadowbox
  // and board-on-board which are finished on both sides by construction.
  finishedSide?: "in" | "out" | "both";
};

// Helper for the form: only meaningful for wood; shadowbox + board-on-board
// styles are two-sided by construction so the choice doesn't apply.
export function finishedSideApplies(
  fenceType: FenceType,
  style?: string,
): boolean {
  if (fenceType !== "wood_privacy" && fenceType !== "wood_picket") return false;
  if (style === "shadowbox" || style === "board_on_board") return false;
  return true;
}

export type ComplianceWarning = {
  severity: "blocker" | "warning";
  code: string;
  message: string;
};

// Miami-Dade pool barrier (FBC 454.2.17 / FBC-R R4501.17) and HVHZ wind-load
// guidance. Surface as warnings, never auto-modify the estimate — the
// contractor is the one signing off.
export function analyzeCompliance(input: FenceCalcInput): ComplianceWarning[] {
  const w: ComplianceWarning[] = [];

  if (input.poolAdjacent) {
    if (input.heightFeet < 4) {
      w.push({
        severity: "blocker",
        code: "POOL_HEIGHT",
        message: `Pool barrier must be ≥ 4 ft tall (current: ${input.heightFeet} ft). Miami-Dade Sec. 33-12(c); FBC R4501.17.1.1.`,
      });
    }
    if (input.fenceType === "chain_link") {
      w.push({
        severity: "warning",
        code: "POOL_CHAIN_LINK_MESH",
        message:
          'Chain-link as a pool barrier per Miami-Dade Sec. 33-12(i): 2" chain link or diamond weave (nonclimbable), top rail required, heavy galvanized. (FBC residential allows ≤ 1¾" with slats — local MDC ordinance is stricter.)',
      });
    }
    if (input.numGatesSingle + input.numGatesDouble > 0) {
      w.push({
        severity: "warning",
        code: "POOL_GATE_HARDWARE",
        message:
          'Pool gates per Miami-Dade Sec. 33-12(e): spring-lock type, automatically closed and fastened, safe lock, locked when pool not in use. FBC §454.2.17 also requires self-closing/self-latching with latch ≥ 54" and gate opening outward away from the pool.',
      });
    }
    if (input.fenceType === "wood_privacy" || input.fenceType === "wood_picket") {
      w.push({
        severity: "warning",
        code: "POOL_WOOD_NONCLIMBABLE",
        message:
          'Wood pool barrier per Miami-Dade Sec. 33-12(g): boards / pickets / louvers must be spaced and constructed to be nonclimbable AND impenetrable.',
      });
    }
    if (
      input.fenceType === "wood_picket" ||
      input.fenceType === "wrought_iron" ||
      input.fenceType === "aluminum"
    ) {
      w.push({
        severity: "warning",
        code: "POOL_CLIMBABILITY",
        message:
          'No horizontal members within 45" of grade on the pool side (anti-climb). FBC §454.2.17.1.7. Confirm panel orientation.',
      });
    }
  }

  // Wood-fence finished-side affidavit (Miami-Dade County).
  // Per the AHJ, finished side must face outward (neighboring property or
  // street) by default; facing inward requires the neighbor to sign the
  // official "Affidavit to Waive the Finished Side of Fence." Soft warning,
  // not a blocker — contractor may know the job isn't under MDC AHJ.
  if (
    (input.fenceType === "wood_privacy" || input.fenceType === "wood_picket") &&
    input.finishedSide === "in" &&
    finishedSideApplies(input.fenceType, input.style)
  ) {
    w.push({
      severity: "warning",
      code: "WOOD_FINISHED_SIDE_AFFIDAVIT",
      message:
        'Finished side faces inward. Miami-Dade Sec. 33-11(b)(2) requires the finished side to face the neighboring property or street; facing inward needs the neighbor to sign the "Affidavit to Waive the Finished Side of Fence" — attach to the permit submission. (miamidade.gov/resources/economy/permits/documents/fence-waiver-for-finished-side.pdf)',
    });
  }

  // Height-extension affidavit (Miami-Dade County).
  // Standard fence height is 6 ft; rear/interior yards can extend up to 2 ft
  // beyond the build-to-line with neighbor consent + the official "Affidavit
  // to Extend Height for Fences, Wall or Hedge."
  if (input.heightFeet > 6) {
    w.push({
      severity: "warning",
      code: "HEIGHT_EXTENSION_AFFIDAVIT",
      message: `Fence height ${input.heightFeet} ft exceeds the standard 6 ft cap (Miami-Dade Sec. 33-11(h)(1) for RU/EU-M Districts). May require the "Affidavit to Extend Height for Fences, Wall or Hedge" with neighbor consent — verify zoning district with the local AHJ. (miamidade.gov/resources/economy/permits/documents/affidavit-extend-height-fence-wall-hedge.pdf)`,
    });
  }

  if (input.hvhz) {
    const tallSolid =
      input.heightFeet >= 6 &&
      (input.fenceType === "wood_privacy" ||
        input.fenceType === "composite" ||
        input.fenceType === "vinyl");
    if (tallSolid && input.postSpacingFeet > 6) {
      w.push({
        severity: "warning",
        code: "HVHZ_POST_SPACING",
        message: `HVHZ: ${input.heightFeet}' solid fence at ${input.postSpacingFeet}' spacing exceeds recommended 6' max for 175 mph wind load. Reduce spacing or upsize posts.`,
      });
    }
    if (input.fenceType === "wood_privacy" && input.heightFeet >= 6) {
      w.push({
        severity: "warning",
        code: "HVHZ_FOOTING",
        message:
          "HVHZ: 6'+ wood privacy needs concrete footings ≥ 30\" deep, 10\" diameter. Verify against local AHJ.",
      });
    }
  }

  return w;
}

export type FenceCalcLine = {
  description: string;
  quantity: number;
  unit: string;
  unitPriceCents: number;
  totalCents: number;
};

export type FenceCalcBreakdown = {
  // Cost components (pre-margin)
  materialCents: number;
  laborCents: number;
  gatesCents: number;
  motorsCents: number;
  removalCents: number;
  permitCents: number;
  engineeringCents: number;
  // Roll-up
  subtotalCostCents: number;
  marginCents: number;
  finalCents: number; // == sum of emitted line totalCents
  costPerFootCents: number;
  // Multipliers (informational — applied to labor)
  appliedMultipliers: {
    terrain: number;
    soil: number;
    access: number;
    difficulty: number;
  };
};

export type FenceCalcMaterialList = {
  totalPostCount: number;
  cornerPostCount: number;
  endPostCount: number;
  linePostCount: number;
  railCount: number;
  picketCount: number;
  concreteCubicFeet: number;
  concreteBags: number;
};

export type FenceCalcProfit = {
  marginPercent: number; // computed effective margin (final - cost) / cost
  netProfitCents: number;
};

export type FenceCalcResult = {
  // Back-compat: lines + totalCents (consumed by form preview, persistence,
  // and the customer doc rendering).
  lines: FenceCalcLine[];
  totalCents: number;
  // Modular spec output (§4 + §5)
  breakdown: FenceCalcBreakdown;
  materialList: FenceCalcMaterialList;
  profit: FenceCalcProfit;
};

// ─── Saved-row → calc input ──────────────────────────────────────
// Rebuilds the modular FenceCalcInput from a persisted FenceJob row so the
// detail page can recompute the rich breakdown / material list / profit. For
// legacy rows where the new columns are 0/default (created before Phase 1+2),
// fall back to sensible defaults so the panel doesn't show $0 labor or 0%
// margin.
type SavedFenceJobRow = {
  fenceType: string;
  heightFeet: number;
  linearFeet: number;
  postSpacingFeet: number;
  numGatesSingle: number;
  numGatesDouble: number;
  numCorners: number;
  numEnds: number;
  removeExisting: boolean;
  removeLinearFeet: number;
  haulAway: boolean;
  terrain: string;
  soilType: string;
  access: string;
  poolAdjacent: boolean;
  hvhz: boolean;
  style: string | null;
  color: string | null;
  gateStyle: string;
  gateMotor: string;
  permitRequired: boolean;
  permitCents: number;
  engineeringRequired: boolean;
  engineeringCents: number;
  laborMode: string;
  laborRatePerFootCents: number;
  laborRatePerHourCents: number;
  crewSize: number;
  estimatedHours: number;
  marginMode: string;
  marginPercent: number;
  marginFixedCents: number;
  marginMinimumCents: number;
  finishedSide: string | null;
};

export function fenceJobRowToCalcInput(
  row: SavedFenceJobRow,
): FenceCalcInput {
  const fenceType = row.fenceType as FenceType;

  const fallbackLabor = defaultLaborConfig(fenceType);
  const labor: LaborConfig =
    row.laborMode === "per_hour"
      ? {
          mode: "per_hour",
          ratePerHourCents:
            row.laborRatePerHourCents > 0 ? row.laborRatePerHourCents : 7500,
          crewSize: row.crewSize > 0 ? row.crewSize : 2,
          estimatedHours: row.estimatedHours > 0 ? row.estimatedHours : 8,
        }
      : {
          mode: "per_foot",
          ratePerFootCents:
            row.laborRatePerFootCents > 0
              ? row.laborRatePerFootCents
              : fallbackLabor.mode === "per_foot"
                ? fallbackLabor.ratePerFootCents
                : 0,
        };

  let margin: MarginConfig;
  if (row.marginMode === "fixed") {
    margin = { mode: "fixed", cents: row.marginFixedCents };
  } else if (row.marginMode === "minimum") {
    margin = { mode: "minimum", floorCents: row.marginMinimumCents };
  } else {
    margin = {
      mode: "percent",
      value: (row.marginPercent > 0 ? row.marginPercent : 20) / 100,
    };
  }

  return {
    fenceType,
    heightFeet: row.heightFeet,
    linearFeet: row.linearFeet,
    postSpacingFeet: row.postSpacingFeet,
    numGatesSingle: row.numGatesSingle,
    numGatesDouble: row.numGatesDouble,
    numCorners: row.numCorners,
    numEnds: row.numEnds,
    removeExisting: row.removeExisting,
    removeLinearFeet: row.removeLinearFeet,
    haulAway: row.haulAway,
    terrain: row.terrain as "flat" | "sloped" | "rocky",
    soilType: row.soilType as SoilType,
    access: row.access as AccessType,
    poolAdjacent: row.poolAdjacent,
    hvhz: row.hvhz,
    style: row.style ?? undefined,
    color: row.color ?? undefined,
    gateStyle: row.gateStyle as GateStyle,
    gateMotor: row.gateMotor as GateMotor,
    permitRequired: row.permitRequired,
    permitCents: row.permitCents > 0 ? row.permitCents : undefined,
    engineeringRequired: row.engineeringRequired,
    engineeringCents:
      row.engineeringCents > 0 ? row.engineeringCents : undefined,
    labor,
    pricing: { margin },
    finishedSide:
      row.finishedSide === "in" ||
      row.finishedSide === "out" ||
      row.finishedSide === "both"
        ? row.finishedSide
        : undefined,
  };
}

// ════════════════════════════════════════════════════════════════════
// MODULAR PRICING ENGINE
// Spec §4 — material + labor + add-ons + site + permits + margin
// ════════════════════════════════════════════════════════════════════
export function calculateFenceJob(input: FenceCalcInput): FenceCalcResult {
  const props = MATERIAL_PROPERTIES[input.fenceType];

  // ── 1. Post counts (corner / end / line) ─────────────────────────
  const totalPosts = Math.max(
    2,
    Math.ceil(input.linearFeet / input.postSpacingFeet) + 1,
  );
  const requestedCorners = Math.max(0, input.numCorners ?? 0);
  const requestedEnds = Math.max(0, input.numEnds ?? 2);
  const cornerPostCount = Math.min(requestedCorners, totalPosts);
  const endPostCount = Math.min(requestedEnds, totalPosts - cornerPostCount);
  const linePostCount = Math.max(
    0,
    totalPosts - cornerPostCount - endPostCount,
  );

  // ── 2. Site multipliers (apply to labor) ─────────────────────────
  const terrainMult = TERRAIN_MULTIPLIER[input.terrain] ?? 1.0;
  const soilMult = SOIL_MULTIPLIER[input.soilType ?? "sand"];
  const accessMult = ACCESS_MULTIPLIER[input.access ?? "easy"];
  const difficultyMult = props.laborDifficultyMultiplier;
  const laborMultProduct = terrainMult * soilMult * accessMult * difficultyMult;

  // ── 3. Material cost ─────────────────────────────────────────────
  const tieredRate = pickTierRate(input.pricing?.tiers, input.linearFeet);
  const baseCpf =
    input.costPerFootCentsOverride ??
    tieredRate ??
    defaultMaterialCostPerFootCents(input.fenceType);
  const heightExtraFeet = Math.max(0, input.heightFeet - 4);
  const heightExtra =
    heightExtraFeet * HEIGHT_UPCHARGE_PER_FOOT_CENTS[input.fenceType];
  const cpf = baseCpf + heightExtra;
  const fenceRunCents = Math.round(cpf * input.linearFeet);

  // Posts — corner heavier than end heavier than line
  const linePostCents = POST_COST_CENTS[input.fenceType];
  const endPostCents = Math.round(linePostCents * 1.2);
  const cornerPostCents = Math.round(linePostCents * 1.4);
  const postsCents =
    cornerPostCount * cornerPostCents +
    endPostCount * endPostCents +
    linePostCount * linePostCents;

  // Material list informational counts
  const concreteCubicFeet =
    Math.round(totalPosts * props.concreteCuFtPerPost * 100) / 100;
  const concreteBags = Math.ceil(concreteCubicFeet / CONCRETE_CUFT_PER_BAG);
  const sections = Math.max(1, totalPosts - 1);
  const railsPerSection =
    input.heightFeet >= 6 ? Math.max(props.railsPerSection, 3) : props.railsPerSection;
  const railCount = sections * railsPerSection;
  const picketCount = Math.ceil(props.picketsPerFoot * input.linearFeet);

  // Waste adjustment — applies to fence-run material only
  const wasteFactor = input.wasteFactorOverride ?? props.wasteFactor;
  const wasteCents = Math.round(fenceRunCents * wasteFactor);

  const materialCents = fenceRunCents + postsCents + wasteCents;

  // ── 4. Labor cost ────────────────────────────────────────────────
  const labor = input.labor ?? defaultLaborConfig(input.fenceType);
  let laborQuantity = 0;
  let laborUnit: "lf" | "hr" = "lf";
  let laborRateCents = 0;
  if (labor.mode === "per_foot") {
    laborQuantity = input.linearFeet;
    laborRateCents = Math.round(labor.ratePerFootCents * laborMultProduct);
    laborUnit = "lf";
  } else {
    laborQuantity = labor.crewSize * labor.estimatedHours;
    laborRateCents = Math.round(labor.ratePerHourCents * laborMultProduct);
    laborUnit = "hr";
  }
  const laborCents = laborRateCents * laborQuantity;

  // ── 5. Gates + motors ────────────────────────────────────────────
  const gateStyle = input.gateStyle ?? "swing_walk";
  const styleMult = GATE_STYLE_MULTIPLIER[gateStyle] ?? 1.0;
  const totalGates = input.numGatesSingle + input.numGatesDouble;
  const gateMotor = input.gateMotor ?? "none";
  let gatesCents = 0;
  let singleGateUnitCents = 0;
  let doubleGateUnitCents = 0;
  if (input.numGatesSingle > 0) {
    singleGateUnitCents = Math.round(
      GATE_SINGLE_CENTS[input.fenceType] * styleMult,
    );
    gatesCents += input.numGatesSingle * singleGateUnitCents;
  }
  if (input.numGatesDouble > 0) {
    doubleGateUnitCents = Math.round(
      GATE_DOUBLE_CENTS[input.fenceType] * styleMult,
    );
    gatesCents += input.numGatesDouble * doubleGateUnitCents;
  }
  const motorUnitCents =
    gateMotor !== "none" && totalGates > 0
      ? GATE_MOTOR_PRICE_CENTS[gateMotor]
      : 0;
  const motorsCents = motorUnitCents * (motorUnitCents > 0 ? totalGates : 0);

  // ── 6. Removal & haul-away ───────────────────────────────────────
  const removalRate =
    input.removalRatePerFootCentsOverride ?? DEFAULT_REMOVAL_PER_LF_CENTS;
  const removalCents =
    input.removeExisting && input.removeLinearFeet > 0
      ? input.removeLinearFeet * removalRate
      : 0;

  // ── 7. Permits & engineering ─────────────────────────────────────
  const permitCents = input.permitRequired
    ? (input.permitCents ?? DEFAULT_PERMIT_CENTS)
    : 0;
  const engineeringCents = input.engineeringRequired
    ? (input.engineeringCents ?? DEFAULT_ENGINEERING_CENTS)
    : 0;

  // ── 8. Subtotal & margin ─────────────────────────────────────────
  const subtotalCostCents =
    materialCents +
    laborCents +
    gatesCents +
    motorsCents +
    removalCents +
    permitCents +
    engineeringCents;

  const margin = input.pricing?.margin ?? DEFAULT_MARGIN;
  let marginCents = 0;
  let finalCents = 0;
  switch (margin.mode) {
    case "percent":
      marginCents = Math.round(subtotalCostCents * margin.value);
      finalCents = subtotalCostCents + marginCents;
      break;
    case "fixed":
      marginCents = margin.cents;
      finalCents = subtotalCostCents + marginCents;
      break;
    case "minimum":
      finalCents = Math.max(subtotalCostCents, margin.floorCents);
      marginCents = finalCents - subtotalCostCents;
      break;
  }

  // ── 9. Emit lines (margin baked into per-line rates) ─────────────
  // Customer doc shouldn't show "+ margin" as its own line, so we apply the
  // markup factor proportionally to each line. Lines sum to finalCents.
  const markup =
    subtotalCostCents > 0 ? finalCents / subtotalCostCents : 1.0;
  const lines: FenceCalcLine[] = [];

  const styleLabelText = (() => {
    if (!input.style) return "";
    const opt = STYLE_OPTIONS_BY_TYPE[input.fenceType]?.find(
      (s) => s.value === input.style,
    );
    return opt ? `, ${opt.label.toLowerCase()}` : "";
  })();
  const colorLabelText = (() => {
    if (!input.color) return "";
    const opt = COLOR_OPTIONS_BY_TYPE[input.fenceType]?.find(
      (c) => c.value === input.color,
    );
    return opt ? `, ${opt.label.toLowerCase()}` : "";
  })();

  // Fence run material
  const fenceLineRate = Math.round(cpf * markup);
  // Finished-side suffix — only meaningful for wood and only when the user
  // explicitly chose. "both" is auto-applied to two-sided styles.
  const finishedSideText = (() => {
    if (!input.finishedSide) return "";
    if (!finishedSideApplies(input.fenceType, input.style)) {
      return ", finished both sides";
    }
    if (input.finishedSide === "in")
      return ", finished side faces customer";
    if (input.finishedSide === "out")
      return ", finished side faces neighbor";
    return ", finished both sides";
  })();

  lines.push({
    description: `${FENCE_TYPE_LABELS[input.fenceType]} — ${input.heightFeet}' tall${styleLabelText}${colorLabelText}${finishedSideText}`,
    quantity: input.linearFeet,
    unit: "lf",
    unitPriceCents: fenceLineRate,
    totalCents: fenceLineRate * input.linearFeet,
  });

  // Posts (combined, with corner/end/line breakdown in description)
  if (totalPosts > 0 && postsCents > 0) {
    const avgPostMarked = Math.round((postsCents / totalPosts) * markup);
    lines.push({
      description: `Posts set in concrete (corner ${cornerPostCount} · end ${endPostCount} · line ${linePostCount})`,
      quantity: totalPosts,
      unit: "ea",
      unitPriceCents: avgPostMarked,
      totalCents: avgPostMarked * totalPosts,
    });
  }

  // Waste
  if (wasteCents > 0) {
    const wasteMarked = Math.round(wasteCents * markup);
    lines.push({
      description: `Waste & cuts allowance (${Math.round(wasteFactor * 100)}%)`,
      quantity: 1,
      unit: "ea",
      unitPriceCents: wasteMarked,
      totalCents: wasteMarked,
    });
  }

  // Labor
  if (laborQuantity > 0 && laborRateCents > 0) {
    const laborRateMarked = Math.round(laborRateCents * markup);
    const multSuffix =
      laborMultProduct !== 1
        ? ` (×${laborMultProduct.toFixed(2)} site/difficulty)`
        : "";
    lines.push({
      description: `Install labor${labor.mode === "per_hour" ? " — crew-hours" : ""}${multSuffix}`,
      quantity: laborQuantity,
      unit: laborUnit,
      unitPriceCents: laborRateMarked,
      totalCents: laborRateMarked * laborQuantity,
    });
  }

  // Gates
  const isSwing = gateStyle === "swing_walk" || gateStyle === "swing_drive";
  const gateStyleLabelSuffix = isSwing
    ? ""
    : ` — ${GATE_STYLE_LABELS[gateStyle].toLowerCase()}`;
  if (input.numGatesSingle > 0) {
    const adj = Math.round(singleGateUnitCents * markup);
    lines.push({
      description: `Single walk gate (with hardware)${gateStyleLabelSuffix}`,
      quantity: input.numGatesSingle,
      unit: "ea",
      unitPriceCents: adj,
      totalCents: input.numGatesSingle * adj,
    });
  }
  if (input.numGatesDouble > 0) {
    const adj = Math.round(doubleGateUnitCents * markup);
    lines.push({
      description: `Double drive gate (with hardware)${gateStyleLabelSuffix}`,
      quantity: input.numGatesDouble,
      unit: "ea",
      unitPriceCents: adj,
      totalCents: input.numGatesDouble * adj,
    });
  }

  // Motors
  if (motorUnitCents > 0 && totalGates > 0) {
    const adj = Math.round(motorUnitCents * markup);
    lines.push({
      description: `${GATE_MOTOR_LABELS[gateMotor]} (with install & hardware)`,
      quantity: totalGates,
      unit: "ea",
      unitPriceCents: adj,
      totalCents: totalGates * adj,
    });
  }

  // Removal
  if (removalCents > 0) {
    const adj = Math.round(removalRate * markup);
    lines.push({
      description: `Tear-out${input.haulAway === false ? "" : " & haul-off"} of existing fence`,
      quantity: input.removeLinearFeet,
      unit: "lf",
      unitPriceCents: adj,
      totalCents: adj * input.removeLinearFeet,
    });
  }

  // Permits
  if (permitCents > 0) {
    const adj = Math.round(permitCents * markup);
    lines.push({
      description: "Building permit & filing",
      quantity: 1,
      unit: "ea",
      unitPriceCents: adj,
      totalCents: adj,
    });
  }

  // Engineering
  if (engineeringCents > 0) {
    const adj = Math.round(engineeringCents * markup);
    lines.push({
      description: "Engineering letter (sealed)",
      quantity: 1,
      unit: "ea",
      unitPriceCents: adj,
      totalCents: adj,
    });
  }

  // Total from emitted lines (handles any rounding drift)
  const totalCents = lines.reduce((s, l) => s + l.totalCents, 0);
  const costPerFootCents =
    input.linearFeet > 0 ? Math.round(totalCents / input.linearFeet) : 0;
  const computedMarginPct =
    subtotalCostCents > 0
      ? (totalCents - subtotalCostCents) / subtotalCostCents
      : 0;

  return {
    lines,
    totalCents,
    breakdown: {
      materialCents,
      laborCents,
      gatesCents,
      motorsCents,
      removalCents,
      permitCents,
      engineeringCents,
      subtotalCostCents,
      marginCents,
      finalCents: totalCents,
      costPerFootCents,
      appliedMultipliers: {
        terrain: terrainMult,
        soil: soilMult,
        access: accessMult,
        difficulty: difficultyMult,
      },
    },
    materialList: {
      totalPostCount: totalPosts,
      cornerPostCount,
      endPostCount,
      linePostCount,
      railCount,
      picketCount,
      concreteCubicFeet,
      concreteBags,
    },
    profit: {
      marginPercent: computedMarginPct,
      netProfitCents: totalCents - subtotalCostCents,
    },
  };
}
