// Storage abstraction for property photos, masks, generated visualizations,
// and executed permit-doc PDFs.
//
// Two drivers, picked by STORAGE_DRIVER env:
//   - "local"     (dev default): writes to public/uploads/<key>;
//                                served by Next as /uploads/<key>
//   - "supabase"  (production):  uploads to a Supabase Storage bucket;
//                                served via signed URLs
//
// Keys are slash-delimited paths like "estimates/<id>/photos/<photoId>.jpg".
// On Supabase the bucket is determined by SUPABASE_STORAGE_BUCKET; on local
// they all share public/uploads/.

import "server-only";
import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type StorageDriver = "local" | "supabase";

export interface StoragePutOptions {
  contentType?: string;
}

export interface Storage {
  driver: StorageDriver;
  put(key: string, body: Buffer, opts?: StoragePutOptions): Promise<void>;
  /** Returns a URL the browser can fetch for this asset. */
  publicUrl(key: string): Promise<string> | string;
  /** Read raw bytes back (e.g. for streaming through an auth-gated route). */
  read(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}

const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const localDriver: Storage = {
  driver: "local",

  async put(key, body) {
    const full = path.join(PUBLIC_UPLOAD_DIR, key);
    const dir = path.dirname(full);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(full, body);
  },

  publicUrl(key) {
    const safe = key.split(path.sep).join("/");
    return `/uploads/${safe}`;
  },

  async read(key) {
    const full = path.join(PUBLIC_UPLOAD_DIR, key);
    return await readFile(full);
  },

  async remove(key) {
    const full = path.join(PUBLIC_UPLOAD_DIR, key);
    if (existsSync(full)) await unlink(full);
  },
};

let supabase: SupabaseClient | null = null;

function getSupabase(): { client: SupabaseClient; bucket: string } {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";
  if (!url || !serviceKey) {
    throw new Error(
      "STORAGE_DRIVER=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.",
    );
  }
  if (!supabase) {
    // Service-role key bypasses RLS, which is what we want for server-side
    // upload/read of permit packets and visualizations. Never ship this key
    // to the browser.
    supabase = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return { client: supabase, bucket };
}

const supabaseDriver: Storage = {
  driver: "supabase",

  async put(key, body, opts) {
    const { client, bucket } = getSupabase();
    const { error } = await client.storage.from(bucket).upload(key, body, {
      contentType: opts?.contentType,
      upsert: true,
    });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  },

  async publicUrl(key) {
    const { client, bucket } = getSupabase();
    // Signed URLs let the bucket stay private; 7-day expiry is plenty for
    // links the contractor or customer might bookmark in a session.
    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(key, 60 * 60 * 24 * 7);
    if (error || !data) {
      throw new Error(
        `Supabase signed URL failed: ${error?.message ?? "no data"}`,
      );
    }
    return data.signedUrl;
  },

  async read(key) {
    const { client, bucket } = getSupabase();
    const { data, error } = await client.storage.from(bucket).download(key);
    if (error || !data) {
      throw new Error(
        `Supabase download failed: ${error?.message ?? "no data"}`,
      );
    }
    const arrayBuf = await data.arrayBuffer();
    return Buffer.from(arrayBuf);
  },

  async remove(key) {
    const { client, bucket } = getSupabase();
    const { error } = await client.storage.from(bucket).remove([key]);
    if (error) throw new Error(`Supabase remove failed: ${error.message}`);
  },
};

let cached: Storage | null = null;

export function getStorage(): Storage {
  if (cached) return cached;
  const driver = (process.env.STORAGE_DRIVER ?? "local") as StorageDriver;
  if (driver === "supabase") {
    cached = supabaseDriver;
  } else {
    cached = localDriver;
  }
  return cached;
}

// Build a deterministic storage key for a given asset type. Keeping these in
// one place so the path layout doesn't drift across modules.
export const keys = {
  photo(estimateId: string, photoId: string, ext: string) {
    return `estimates/${estimateId}/photos/${photoId}.${ext}`;
  },
  mask(estimateId: string, photoId: string, visualizationId: string) {
    return `estimates/${estimateId}/masks/${photoId}-${visualizationId}.png`;
  },
  result(estimateId: string, visualizationId: string) {
    return `estimates/${estimateId}/results/${visualizationId}.png`;
  },
  permitDoc(estimateId: string, documentId: string, slug: string) {
    return `docs/${estimateId}/${documentId}-${slug}.pdf`;
  },
};
