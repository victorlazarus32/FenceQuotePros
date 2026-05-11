// Site-wide language selection. EN is the default; ES is the Caribbean
// (Cuban / Puerto Rican) Spanish variant for South Florida contractors
// who prefer Spanish.
//
// Sources of truth, in priority order:
//   1. ?lang= search param (lets users / shareable links override)
//   2. fqp-lang cookie (persisted toggle preference)
//   3. fallback "en"

import { cookies } from "next/headers";

export type Lang = "en" | "es";

export const LANG_COOKIE = "fqp-lang";

export function parseLang(
  value: string | string[] | undefined,
): Lang {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "es" ? "es" : "en";
}

/**
 * Server-side: read the persisted language preference from cookies.
 * Use in any server component / page that needs to render localized
 * copy. Pages that also accept ?lang= as a search param should call
 * parseLang(searchParams.lang) and prefer that over the cookie.
 */
export async function getLangFromCookies(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(LANG_COOKIE)?.value;
  return v === "es" ? "es" : "en";
}

/**
 * Resolve effective lang: search-param override takes priority, then
 * cookie. Both are optional so pages can call this with whatever they
 * have on hand.
 */
export async function resolveLang(
  searchParamLang?: string | string[] | undefined,
): Promise<Lang> {
  if (searchParamLang !== undefined) {
    const v = Array.isArray(searchParamLang) ? searchParamLang[0] : searchParamLang;
    if (v === "es" || v === "en") return v;
  }
  return getLangFromCookies();
}

export const OTHER_LANG: Record<Lang, Lang> = {
  en: "es",
  es: "en",
};

export const LANG_LABEL: Record<Lang, string> = {
  en: "EN",
  es: "ES",
};
