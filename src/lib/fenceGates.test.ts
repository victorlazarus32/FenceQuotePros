import { describe, expect, it } from "vitest";
import {
  GATE_STANDARD_WIDTH_FEET,
  calculateFenceJob,
  defaultGateSpec,
  gateCountSummary,
  parseGateSpecs,
  totalGateCount,
  type FenceCalcInput,
  type GateSpec,
} from "./fence";

// Minimal chain-link job — zero labor rate and zero margin so gate math
// is easy to isolate in the breakdown.
function baseInput(overrides: Partial<FenceCalcInput> = {}): FenceCalcInput {
  return {
    fenceType: "chain_link",
    heightFeet: 4,
    linearFeet: 100,
    postSpacingFeet: 8,
    numGatesSingle: 0,
    numGatesDouble: 0,
    terrain: "flat",
    removeExisting: false,
    removeLinearFeet: 0,
    labor: { mode: "per_foot", ratePerFootCents: 0 },
    pricing: { margin: { mode: "percent", value: 0 } },
    ...overrides,
  };
}

describe("per-gate specs pricing", () => {
  it("matches legacy pricing for the equivalent gates array", () => {
    const legacy = calculateFenceJob(
      baseInput({
        numGatesSingle: 2,
        numGatesDouble: 1,
        gateStyle: "swing_walk",
        gateMotor: "slide",
      }),
    );
    const gates: GateSpec[] = [
      { style: "swing_walk", widthFeet: 4, motor: "slide", qty: 2 },
      { style: "swing_drive", widthFeet: 10, motor: "slide", qty: 1 },
    ];
    const perGate = calculateFenceJob(baseInput({ gates }));
    // swing_drive carries the same 1.0 multiplier as swing_walk, and both
    // widths sit at their standards — totals must match the legacy fields.
    expect(perGate.breakdown.gatesCents).toBe(legacy.breakdown.gatesCents);
    expect(perGate.breakdown.motorsCents).toBe(legacy.breakdown.motorsCents);
  });

  it("prices each gate from its own style and width", () => {
    // chain_link: single base 18000, double base 32000; sliding ×1.4;
    // 12' is sliding standard width, 15' is 1.25× wider.
    const r = calculateFenceJob(
      baseInput({
        gates: [
          { style: "swing_walk", widthFeet: 4, motor: "none", qty: 1 },
          { style: "sliding", widthFeet: 15, motor: "none", qty: 1 },
        ],
      }),
    );
    const expectedSliding = Math.round(32000 * 1.4 * (15 / 12));
    expect(r.breakdown.gatesCents).toBe(18000 + expectedSliding);
  });

  it("does not discount below-standard widths", () => {
    const std = calculateFenceJob(
      baseInput({
        gates: [{ style: "swing_drive", widthFeet: 10, motor: "none", qty: 1 }],
      }),
    );
    const narrow = calculateFenceJob(
      baseInput({
        gates: [{ style: "swing_drive", widthFeet: 8, motor: "none", qty: 1 }],
      }),
    );
    expect(narrow.breakdown.gatesCents).toBe(std.breakdown.gatesCents);
  });

  it("merges identical motors into one line and prices per gate", () => {
    const r = calculateFenceJob(
      baseInput({
        gates: [
          { style: "swing_walk", widthFeet: 4, motor: "swing_single", qty: 2 },
          { style: "swing_drive", widthFeet: 10, motor: "swing_single", qty: 1 },
          { style: "sliding", widthFeet: 12, motor: "slide", qty: 1 },
        ],
      }),
    );
    expect(r.breakdown.motorsCents).toBe(3 * 89000 + 175000);
    const motorLines = r.lines.filter((l) =>
      l.description.includes("operator"),
    );
    expect(motorLines).toHaveLength(2);
    expect(motorLines[0].quantity).toBe(3);
  });

  it("emits one line per gate group with width in the description", () => {
    const r = calculateFenceJob(
      baseInput({
        gates: [
          { style: "swing_walk", widthFeet: 4, motor: "none", qty: 1 },
          { style: "sliding", widthFeet: 12, motor: "none", qty: 1 },
        ],
      }),
    );
    const gateLines = r.lines.filter((l) => l.description.includes("gate"));
    expect(gateLines).toHaveLength(2);
    expect(gateLines[0].description).toContain("4 ft wide");
    expect(gateLines[1].description).toContain("Roll gate");
    expect(gateLines[1].description).toContain("12 ft wide");
  });

  it("an empty gates array means no gates even if legacy counts are set", () => {
    const r = calculateFenceJob(
      baseInput({ gates: [], numGatesSingle: 3, numGatesDouble: 2 }),
    );
    expect(r.breakdown.gatesCents).toBe(0);
    expect(r.breakdown.motorsCents).toBe(0);
  });
});

describe("gateCountSummary", () => {
  it("buckets walk gates as single and everything else as double", () => {
    const s = gateCountSummary([
      { style: "swing_walk", widthFeet: 4, motor: "none", qty: 2 },
      { style: "sliding", widthFeet: 12, motor: "slide", qty: 1 },
      { style: "bi_parting", widthFeet: 14, motor: "none", qty: 1 },
    ]);
    expect(s.numGatesSingle).toBe(2);
    expect(s.numGatesDouble).toBe(2);
    expect(s.gateStyle).toBe("swing_walk");
    expect(s.gateMotor).toBe("slide");
  });

  it("returns none/zero for an empty list", () => {
    const s = gateCountSummary([]);
    expect(s.numGatesSingle).toBe(0);
    expect(s.numGatesDouble).toBe(0);
    expect(s.gateStyle).toBe("none");
    expect(s.gateMotor).toBe("none");
  });
});

describe("parseGateSpecs", () => {
  it("round-trips a valid array", () => {
    const gates = [defaultGateSpec("sliding"), defaultGateSpec()];
    expect(parseGateSpecs(JSON.parse(JSON.stringify(gates)))).toEqual(gates);
  });

  it("returns undefined for non-arrays and empty arrays", () => {
    expect(parseGateSpecs(null)).toBeUndefined();
    expect(parseGateSpecs("nope")).toBeUndefined();
    expect(parseGateSpecs({})).toBeUndefined();
    expect(parseGateSpecs([])).toBeUndefined();
  });

  it("drops entries with unknown styles and repairs bad numbers", () => {
    const parsed = parseGateSpecs([
      { style: "portcullis", widthFeet: 10, motor: "none", qty: 1 },
      { style: "sliding", widthFeet: -3, motor: "warp_drive", qty: 0.4 },
    ]);
    expect(parsed).toEqual([
      {
        style: "sliding",
        widthFeet: GATE_STANDARD_WIDTH_FEET.sliding,
        motor: "none",
        qty: 1,
      },
    ]);
  });
});

describe("totalGateCount", () => {
  it("prefers the gates array over legacy counts", () => {
    expect(
      totalGateCount({
        gates: [{ style: "swing_walk", widthFeet: 4, motor: "none", qty: 3 }],
        numGatesSingle: 9,
        numGatesDouble: 9,
      }),
    ).toBe(3);
    expect(
      totalGateCount({ numGatesSingle: 1, numGatesDouble: 2 }),
    ).toBe(3);
  });
});
