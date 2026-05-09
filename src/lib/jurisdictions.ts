// Address → jurisdiction lookup for the new-estimate Property
// Intelligence panel. We don't need full geocoding for the contractors'
// current footprint — every client they touch is in Miami-Dade County,
// and the only granularity that matters is "which incorporated city
// (if any) does the address fall in?" since each one has different
// fence rules. So we do a city-name match against memory's fence
// ordinance set, plus a zip-code overlay for the unincorporated cases.
//
// Coverage today (2026-05-09):
//   - Miami-Dade Unincorporated  (default fallback)
//   - Hialeah                    (Sec. 98-2116–2123 ordinance)
//   - Coral Gables               (Article 5 §5-401–404)
//   - Miami Beach                (Chapter 7 Article V §7.5.3)
//   - Doral                      (Ch. 74 Art. V §74-214–229)
//   - City of Miami              (Code Sec. 33-11 by reference)
//
// When we expand outside MDC, this file is the lookup edge — add the
// new municipality + its rules below, then PropertyIntelligence picks
// it up automatically.

export type JurisdictionId =
  | "mdc_unincorporated"
  | "miami"
  | "hialeah"
  | "coral_gables"
  | "miami_beach"
  | "doral"
  | "unknown";

export interface JurisdictionRules {
  id: JurisdictionId;
  /** Human-readable jurisdiction name. */
  name: string;
  /** Permit category number on the MDC building permit application. */
  buildingCategory: string;
  /** Default max heights from the ordinance. Front yard / rear+side. */
  maxHeightFrontFt: number;
  maxHeightRearFt: number;
  /** Whether this jurisdiction enforces HVHZ wind-load (everywhere in MDC). */
  hvhz: boolean;
  /** Common HOA likelihood for this jurisdiction (rough heuristic). */
  hoaLikelihood: "low" | "medium" | "high";
  /** Whether this jurisdiction has a more restrictive ordinance than MDC. */
  stricterThanMdc: boolean;
  /** One-line note for the panel (e.g., "Coral Gables requires Board of Architects review"). */
  note?: string;
}

const RULES: Record<JurisdictionId, JurisdictionRules> = {
  mdc_unincorporated: {
    id: "mdc_unincorporated",
    name: "Unincorporated Miami-Dade",
    buildingCategory: "18",
    maxHeightFrontFt: 4,
    maxHeightRearFt: 6,
    hvhz: true,
    hoaLikelihood: "low",
    stricterThanMdc: false,
  },
  miami: {
    id: "miami",
    name: "City of Miami",
    buildingCategory: "18",
    maxHeightFrontFt: 4,
    maxHeightRearFt: 6,
    hvhz: true,
    hoaLikelihood: "medium",
    stricterThanMdc: false,
  },
  hialeah: {
    id: "hialeah",
    name: "City of Hialeah",
    buildingCategory: "18",
    // Hialeah enforces a stricter 4 ft front yard max (vs. MDC's same)
    // and a total residential ban on barbed wire — flag in note.
    maxHeightFrontFt: 4,
    maxHeightRearFt: 6,
    hvhz: true,
    hoaLikelihood: "low",
    stricterThanMdc: true,
    note: "Stricter front-yard rules; residential barbed-wire is banned.",
  },
  coral_gables: {
    id: "coral_gables",
    name: "City of Coral Gables",
    buildingCategory: "18",
    // Coral Gables defaults 4 ft EVERYWHERE plus Board of Architects
    // review for non-conforming proposals.
    maxHeightFrontFt: 4,
    maxHeightRearFt: 4,
    hvhz: true,
    hoaLikelihood: "high",
    stricterThanMdc: true,
    note: "Board of Architects review. Restricted materials. Wood picket only in 4 historic neighborhoods.",
  },
  miami_beach: {
    id: "miami_beach",
    name: "City of Miami Beach",
    buildingCategory: "18",
    // Miami Beach is most context-dependent — 5 ft front + setback bonus,
    // 7 ft rear, oceanfront beach-walk reference, COA in historic districts.
    maxHeightFrontFt: 5,
    maxHeightRearFt: 7,
    hvhz: true,
    hoaLikelihood: "medium",
    stricterThanMdc: true,
    note: "Historic district COA may apply. Oceanfront beach-walk rules near WD-2.",
  },
  doral: {
    id: "doral",
    name: "City of Doral",
    buildingCategory: "18",
    maxHeightFrontFt: 4,
    maxHeightRearFt: 6,
    hvhz: true,
    hoaLikelihood: "high",
    stricterThanMdc: false,
    note: "Mirrors MDC framework. Special exception required for electric fences.",
  },
  unknown: {
    id: "unknown",
    name: "Unknown jurisdiction",
    buildingCategory: "—",
    maxHeightFrontFt: 4,
    maxHeightRearFt: 6,
    hvhz: false,
    hoaLikelihood: "medium",
    stricterThanMdc: false,
    note: "Address not recognized. Default Miami-Dade rules shown — verify locally.",
  },
};

/**
 * Best-effort jurisdiction detection from the client's city + zip.
 * Returns the rules block plus a confidence flag the UI uses to mark
 * the result as "detected" vs. "assumed."
 */
export function detectJurisdiction(input: {
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}): { rules: JurisdictionRules; confidence: "high" | "medium" | "low" } {
  const city = (input.city ?? "").trim().toLowerCase();
  const state = (input.state ?? "").trim().toUpperCase();
  const zip = (input.zip ?? "").trim();

  // If we have neither city nor zip, give up.
  if (!city && !zip) {
    return { rules: RULES.unknown, confidence: "low" };
  }

  // Outside FL → unknown; we only carry rules for FL right now.
  if (state && state !== "FL" && state !== "FLORIDA") {
    return { rules: RULES.unknown, confidence: "low" };
  }

  // City-name match is the strongest signal. Normalize whitespace.
  const norm = city.replace(/\s+/g, " ");
  if (norm === "hialeah") {
    return { rules: RULES.hialeah, confidence: "high" };
  }
  if (norm === "coral gables") {
    return { rules: RULES.coral_gables, confidence: "high" };
  }
  if (norm === "miami beach") {
    return { rules: RULES.miami_beach, confidence: "high" };
  }
  if (norm === "doral") {
    return { rules: RULES.doral, confidence: "high" };
  }
  if (norm === "miami") {
    // "Miami" is ambiguous — could be City of Miami proper, or any
    // unincorporated address that uses Miami as the postal city.
    // Without parcel data we assume city-of-Miami when the user typed
    // it, but mark as medium confidence so the UI can hint.
    return { rules: RULES.miami, confidence: "medium" };
  }

  // Zip-code overlay for ambiguous cases. Most MDC zips overlap multiple
  // jurisdictions, but a few are reliably unincorporated.
  // (Keeping this list small + accurate; expand as needed.)
  const unincorporatedZips = new Set([
    "33165",
    "33175",
    "33176",
    "33186",
    "33177",
    "33196",
  ]);
  if (zip && unincorporatedZips.has(zip.slice(0, 5))) {
    return { rules: RULES.mdc_unincorporated, confidence: "high" };
  }

  // Default: assume unincorporated MDC with low confidence so the UI
  // shows it as "assumed."
  return { rules: RULES.mdc_unincorporated, confidence: "low" };
}
