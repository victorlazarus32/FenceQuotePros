// Translates a FenceJob row into a natural-language prompt for the inpainting
// model. Deterministic for a given input — same job config always produces the
// same prompt, which lets us cache visualizations by (photoId, maskHash, prompt).

import {
  FENCE_TYPE_LABELS,
  STYLE_OPTIONS_BY_TYPE,
  COLOR_OPTIONS_BY_TYPE,
  type FenceType,
} from "@/lib/fence";

export interface PromptInput {
  fenceType: FenceType;
  heightFeet: number;
  style?: string | null;
  color?: string | null;
  hasGate?: boolean;
}

function styleLabel(t: FenceType, value?: string | null): string | null {
  if (!value) return null;
  const opt = STYLE_OPTIONS_BY_TYPE[t]?.find((o) => o.value === value);
  return opt?.label.toLowerCase() ?? null;
}

function colorLabel(t: FenceType, value?: string | null): string | null {
  if (!value) return null;
  const opt = COLOR_OPTIONS_BY_TYPE[t]?.find((o) => o.value === value);
  // Trim out parenthetical hints like "Black stain" — keep the descriptor only.
  return opt?.label.toLowerCase().replace(/\s*\(.*?\)\s*/g, "").trim() ?? null;
}

export function buildFencePrompt(input: PromptInput): string {
  const typeLabel = FENCE_TYPE_LABELS[input.fenceType].toLowerCase();
  const style = styleLabel(input.fenceType, input.style);
  const color = colorLabel(input.fenceType, input.color);
  const height = Number.isFinite(input.heightFeet)
    ? `${input.heightFeet}-foot tall `
    : "";

  const colorPhrase = color ? `${color} ` : "";
  const stylePhrase = style ? ` with ${style} style` : "";
  const gatePhrase = input.hasGate ? " including a matching gate" : "";

  // The trailing instructional clause is what keeps the model honest about
  // perspective, lighting, and integration with the rest of the photo —
  // FLUX-Fill responds well to explicit "match" cues.
  return (
    `A ${height}${colorPhrase}${typeLabel}${stylePhrase}${gatePhrase}, ` +
    `installed along the property boundary line in a residential yard. ` +
    `Photorealistic, matching the lighting, perspective, ground level, and ` +
    `shadow direction of the original photograph. Seamless integration with ` +
    `the surrounding landscape.`
  );
}
