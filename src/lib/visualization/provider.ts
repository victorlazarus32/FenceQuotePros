// Inpainting provider abstraction. The visualization pipeline takes a property
// photo + a mask (white = generate fence here, black = preserve) + a text
// prompt describing the fence, and returns a composite PNG.
//
// Two providers are anticipated:
//   - replicate-flux-fill (default): black-forest-labs/flux-fill-pro
//   - openai-gpt-image-1 (fallback): images.edit endpoint
// Only the Replicate adapter is wired up today.

export interface InpaintInput {
  image: Buffer;
  mask: Buffer;
  prompt: string;
}

export interface InpaintResult {
  result: Buffer;
  costCents: number;
  providerKey: string; // identifier for billing/audit
}

export interface InpaintProvider {
  name: string;
  inpaint(input: InpaintInput): Promise<InpaintResult>;
}

let cached: InpaintProvider | null = null;

export async function getInpaintProvider(): Promise<InpaintProvider> {
  if (cached) return cached;
  const which =
    process.env.VISUALIZATION_PROVIDER ?? "replicate-flux-fill";
  if (which === "replicate-flux-fill") {
    const { fluxFillReplicateProvider } = await import("./replicate");
    cached = fluxFillReplicateProvider;
    return cached;
  }
  throw new Error(
    `VISUALIZATION_PROVIDER="${which}" not implemented. Use "replicate-flux-fill".`,
  );
}
