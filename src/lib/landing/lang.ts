// Landing-page language selection. EN is the default; ES is the
// Caribbean (Cuban / Puerto Rican) Spanish variant for South Florida
// contractors who prefer Spanish.
//
// The lang is read from the ?lang= search param. We treat anything
// other than "es" as English so bad params don't crash the page.

export type Lang = "en" | "es";

export function parseLang(
  value: string | string[] | undefined,
): Lang {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "es" ? "es" : "en";
}

export const OTHER_LANG: Record<Lang, Lang> = {
  en: "es",
  es: "en",
};

export const LANG_LABEL: Record<Lang, string> = {
  en: "EN",
  es: "ES",
};
