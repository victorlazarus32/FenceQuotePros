import { describe, expect, it } from "vitest";
import {
  assembleBodies,
  listVariables,
  renderTemplate,
} from "./contractTemplates";

describe("renderTemplate", () => {
  it("substitutes known variables", () => {
    expect(
      renderTemplate("Hi {{client_name}}, total {{total}}.", {
        client_name: "Maria",
        total: "$9,009.40",
      }),
    ).toBe("Hi Maria, total $9,009.40.");
  });
  it("leaves UNKNOWN variables visible (never silently blank)", () => {
    expect(
      renderTemplate("HOA: {{hoa_name}} — {{client_name}}", {
        client_name: "Maria",
      }),
    ).toBe("HOA: {{hoa_name}} — Maria");
  });
  it("null/undefined values stay visible too", () => {
    expect(renderTemplate("{{a}} {{b}}", { a: null, b: undefined })).toBe(
      "{{a}} {{b}}",
    );
  });
  it("tolerates whitespace inside braces and repeats", () => {
    expect(
      renderTemplate("{{ company }} / {{company}}", { company: "Acme" }),
    ).toBe("Acme / Acme");
  });
  it("numbers render as strings", () => {
    expect(renderTemplate("{{n}} days", { n: 30 })).toBe("30 days");
  });
});

describe("listVariables", () => {
  it("finds each distinct variable once", () => {
    expect(
      listVariables("{{a}} {{b}} {{ a }} plain {{c_1}}"),
    ).toEqual(["a", "b", "c_1"]);
  });
  it("empty body → empty list", () => {
    expect(listVariables("no vars here")).toEqual([]);
  });
});

describe("assembleBodies", () => {
  it("joins non-empty blocks with a blank line", () => {
    expect(assembleBodies(["A", "  ", "B\n", ""])).toBe("A\n\nB");
  });
  it("all-empty input → empty string", () => {
    expect(assembleBodies(["", "  "])).toBe("");
  });
});
