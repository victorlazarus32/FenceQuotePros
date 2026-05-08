// Lightweight i18n for customer-facing estimate/invoice rendering.
// Designed for Miami's bilingual market — most line items quote in EN by
// default, but a contractor can flip ?lang=es to hand a Spanish version
// to a client without a separate document.

export type Lang = "en" | "es";

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "es";
}

export function pickLang(v: unknown): Lang {
  return isLang(v) ? v : "en";
}

const DICT = {
  en: {
    estimate: "Estimate",
    invoice: "Invoice",
    bill_to: "Bill to",
    issued: "Issued",
    expires: "Expires",
    due: "Due",
    description: "Description",
    qty: "Qty",
    unit_price: "Unit price",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    notes: "Notes",
    terms: "Terms",
    all_estimates: "← All estimates",
    all_invoices: "← All invoices",
    mark_sent: "Mark as sent",
    mark_accepted: "Mark accepted",
    mark_declined: "Mark declined",
    convert_to_invoice: "Convert to invoice →",
    view_invoice: "View invoice",
    "delete": "Delete",
    confirm_delete_estimate: "Delete this estimate?",
    print: "Print / PDF",
    lang_toggle_es: "Español",
    lang_toggle_en: "English",
  },
  es: {
    estimate: "Presupuesto",
    invoice: "Factura",
    bill_to: "Facturar a",
    issued: "Emitido",
    expires: "Vence",
    due: "Vencimiento",
    description: "Descripción",
    qty: "Cant.",
    unit_price: "Precio unitario",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuesto",
    notes: "Notas",
    terms: "Términos",
    all_estimates: "← Todos los presupuestos",
    all_invoices: "← Todas las facturas",
    mark_sent: "Marcar como enviado",
    mark_accepted: "Marcar aceptado",
    mark_declined: "Marcar rechazado",
    convert_to_invoice: "Convertir a factura →",
    view_invoice: "Ver factura",
    "delete": "Eliminar",
    confirm_delete_estimate: "¿Eliminar este presupuesto?",
    print: "Imprimir / PDF",
    lang_toggle_es: "Español",
    lang_toggle_en: "English",
  },
} as const;

type DictKey = keyof typeof DICT["en"];

export function t(lang: Lang, key: DictKey): string {
  return DICT[lang][key];
}

// Fence-line descriptions are generated in lib/fence.ts in English and
// persisted that way. Translate at render-time for the customer-facing view.
// Patterns are tight enough to avoid collateral damage on custom line items.
const ES_FENCE_TYPE_LABELS: Record<string, string> = {
  "Chain link": "Malla ciclónica",
  "Wood privacy": "Privacidad de madera",
  "Wood picket": "Estacas de madera",
  Vinyl: "Vinilo",
  Aluminum: "Aluminio",
  "Wrought iron": "Hierro forjado",
  Composite: "Compuesto",
};

export function translateLineDescription(desc: string, lang: Lang): string {
  if (lang === "en") return desc;
  let out = desc;

  // "X fence — N' tall[, terrain]" → "Cerca de X — N' de altura[, terreno ...]"
  out = out.replace(
    /^(.+?) fence — (\d+(?:\.\d+)?)' tall(, (flat|sloped|rocky) terrain)?$/,
    (_m, type, h, _t, terrain) => {
      const typeEs = ES_FENCE_TYPE_LABELS[type] ?? type;
      const terrainEs =
        terrain === "sloped"
          ? ", terreno inclinado"
          : terrain === "rocky"
            ? ", terreno rocoso"
            : terrain === "flat"
              ? ", terreno plano"
              : "";
      return `Cerca de ${typeEs.toLowerCase()} — ${h}' de altura${terrainEs}`;
    },
  );

  out = out.replace(
    /^Posts \((\d+(?:\.\d+)?)' spacing, set in concrete\)$/,
    (_m, s) => `Postes (espaciado de ${s}', colocados en concreto)`,
  );

  out = out.replace(
    /^Single walk gate \(with hardware\)$/,
    "Puerta peatonal sencilla (con herrajes)",
  );
  out = out.replace(
    /^Double drive gate \(with hardware\)$/,
    "Puerta doble vehicular (con herrajes)",
  );
  out = out.replace(
    /^Tear-out and haul-off of existing fence$/,
    "Demolición y retiro de cerca existente",
  );

  return out;
}

const UNIT_ES: Record<string, string> = {
  lf: "ml", // metro lineal — but we keep imperial; "pl" = pies lineales
  ea: "u", // unidad
  hr: "h",
  bag: "saco",
};

export function translateUnit(unit: string, lang: Lang): string {
  if (lang === "en") return unit;
  // Prefer "pl" (pies lineales) over "ml" since the app is imperial.
  if (unit === "lf") return "pl";
  return UNIT_ES[unit] ?? unit;
}
