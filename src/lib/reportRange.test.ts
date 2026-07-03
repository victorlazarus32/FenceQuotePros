import { describe, expect, it } from "vitest";
import { pickRange, rangeStart } from "./reportRange";

const NOW = new Date(2026, 6, 2, 14, 30, 0);

describe("pickRange", () => {
  it("accepts known presets", () => {
    expect(pickRange("today")).toBe("today");
    expect(pickRange("90")).toBe("90");
    expect(pickRange("all")).toBe("all");
  });
  it("defaults to 30 for junk", () => {
    expect(pickRange("14")).toBe("30");
    expect(pickRange(undefined)).toBe("30");
    expect(pickRange("")).toBe("30");
  });
});

describe("rangeStart", () => {
  it("today = local midnight", () => {
    expect(rangeStart("today", NOW)).toEqual(new Date(2026, 6, 2, 0, 0, 0));
  });
  it("7 = exactly 7*24h back", () => {
    expect(rangeStart("7", NOW)).toEqual(
      new Date(NOW.getTime() - 7 * 86_400_000),
    );
  });
  it("all = null (unbounded)", () => {
    expect(rangeStart("all", NOW)).toBeNull();
  });
});
