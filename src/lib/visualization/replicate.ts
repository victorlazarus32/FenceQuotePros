// Replicate FLUX-Fill adapter. Sends a base64-encoded photo + mask to
// black-forest-labs/flux-fill-pro and returns the generated composite.
//
// FLUX-Fill is the current best-in-class inpainting model for natural-scene
// edits (placing an object into an existing photo). Costs ~$0.05 per image
// at the time of writing. Latency is typically 10–25s per call.

import Replicate from "replicate";
import type { InpaintInput, InpaintProvider, InpaintResult } from "./provider";

const MODEL = "black-forest-labs/flux-fill-pro";
const COST_CENTS_PER_IMAGE = 5;

function toDataUrl(buf: Buffer, mime: string): string {
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function fetchAsBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch model output: ${res.status}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

export const fluxFillReplicateProvider: InpaintProvider = {
  name: "replicate-flux-fill",

  async inpaint({ image, mask, prompt }: InpaintInput): Promise<InpaintResult> {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    const replicate = new Replicate({ auth: token });

    // Replicate accepts data URLs for image + mask inputs. Base64 keeps us
    // off the public internet (no need to host files yet) at the cost of
    // some bandwidth — fine for typical phone-camera shots.
    const output = await replicate.run(MODEL, {
      input: {
        image: toDataUrl(image, "image/jpeg"),
        mask: toDataUrl(mask, "image/png"),
        prompt,
        // Conservative defaults for photorealistic fence-in-yard composites.
        // FLUX-Fill defaults to 28 steps; bumping a bit for fidelity at the
        // cost of ~5s extra latency.
        num_inference_steps: 35,
        guidance: 30,
        output_format: "png",
        safety_tolerance: 5,
      },
    });

    // Replicate returns a string URL or array of URLs depending on the model.
    // FLUX-Fill returns a single URL string.
    const url = Array.isArray(output) ? String(output[0]) : String(output);
    if (!url || !url.startsWith("http")) {
      throw new Error(
        `Unexpected Replicate output: ${JSON.stringify(output).slice(0, 200)}`,
      );
    }

    const result = await fetchAsBuffer(url);

    return {
      result,
      costCents: COST_CENTS_PER_IMAGE,
      providerKey: MODEL,
    };
  },
};
