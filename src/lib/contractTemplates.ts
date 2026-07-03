// Contract/terms template rendering — pure functions (PS scope-module
// pattern). Bodies contain {{variables}}; rendering substitutes known
// values and LEAVES UNKNOWN VARIABLES VISIBLE (e.g. "{{hoa_name}}") so a
// missing value is obvious on the document instead of silently blank.

export type TemplateVars = Record<string, string | number | null | undefined>;

const VAR_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function renderTemplate(body: string, vars: TemplateVars): string {
  return body.replace(VAR_PATTERN, (whole, name: string) => {
    const v = vars[name];
    if (v === null || v === undefined) return whole; // leave visible
    return String(v);
  });
}

// Every distinct {{variable}} present in a body — powers the editor's
// variable hint list.
export function listVariables(body: string): string[] {
  const found = new Set<string>();
  for (const m of body.matchAll(VAR_PATTERN)) found.add(m[1]);
  return [...found];
}

// Standard variables every apply-site provides. Keep this list in sync
// with buildTemplateVars() callers — it's what the editor advertises.
export const STANDARD_VARIABLES = [
  "client_name",
  "company",
  "number",
  "total",
  "deposit",
  "date",
] as const;

export function assembleBodies(bodies: readonly string[]): string {
  return bodies
    .map((b) => b.trim())
    .filter(Boolean)
    .join("\n\n");
}
