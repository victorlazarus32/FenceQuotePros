"use client";

// Client-side visualization workflow:
//   1. Upload property photo(s) via drag-drop or file picker
//   2. Paint a mask on the photo (white = generate fence here, black = preserve)
//   3. Click Generate -> POST /api/visualize -> show result
//
// The mask canvas is a single overlay on top of the displayed photo. Brush
// strokes paint white into a hidden canvas at the photo's natural resolution,
// then we export to PNG and send as base64. Eraser uses 'destination-out'
// composite mode so the user can correct over-painted areas.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import {
  FENCE_TYPE_LABELS,
  STYLE_OPTIONS_BY_TYPE,
  COLOR_OPTIONS_BY_TYPE,
  type FenceType,
} from "@/lib/fence";

type Photo = {
  id: string;
  publicUrl: string;
  width: number;
  height: number;
  angleLabel: string | null;
  visualizations: {
    id: string;
    status: string;
    publicUrl: string | null;
    createdAt: string;
  }[];
};

type FenceJobInput = {
  fenceType: string;
  heightFeet: number;
  style: string | null;
  color: string | null;
  hasGate: boolean;
};

type Props = {
  estimateId: string;
  fenceJob: FenceJobInput;
  existingPhotos: Photo[];
};

export function Visualizer({ estimateId, fenceJob, existingPhotos }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(existingPhotos);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(
    existingPhotos[0]?.id ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const activePhoto = photos.find((p) => p.id === activePhotoId) ?? null;

  async function handleFile(file: File, angleLabel?: string) {
    setUploading(true);
    setUploadError(null);
    try {
      // Compress / re-encode before sending. Phone photos are routinely
      // 6-12 MB; Vercel's Hobby plan caps request bodies at 4.5 MB.
      const prepared = await compressForUpload(file);
      const dims = await loadImageDimensions(prepared);
      const fd = new FormData();
      fd.append("photo", prepared);
      fd.append("estimateId", estimateId);
      fd.append("width", String(dims.width));
      fd.append("height", String(dims.height));
      if (angleLabel) fd.append("angleLabel", angleLabel);

      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail = body.detail ? ` — ${body.detail}` : "";
        throw new Error(
          (body.message ?? body.error ?? `upload_failed_${res.status}`) +
            detail,
        );
      }
      const data = (await res.json()) as {
        id: string;
        publicUrl: string;
        width: number;
        height: number;
        angleLabel: string | null;
      };
      const newPhoto: Photo = { ...data, visualizations: [] };
      setPhotos((prev) => [...prev, newPhoto]);
      setActivePhotoId(newPhoto.id);
    } catch (err) {
      setUploadError(String(err));
    } finally {
      setUploading(false);
    }
  }

  function handleVisualizationCreated(photoId: string, viz: Photo["visualizations"][number]) {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId
          ? { ...p, visualizations: [viz, ...p.visualizations] }
          : p,
      ),
    );
  }

  async function handleRemovePhoto(photoId: string) {
    if (!confirm("Remove this photo and any generated previews from it?")) return;
    const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    if (!res.ok) {
      setUploadError(`Failed to remove photo (${res.status})`);
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setActivePhotoId((prev) => (prev === photoId ? null : prev));
  }

  return (
    <div className="space-y-6">
      <ConfigPanel fenceJob={fenceJob} estimateId={estimateId} />
      <UploadBox onFile={handleFile} uploading={uploading} />
      {uploadError && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded p-3">
          {uploadError}
        </div>
      )}

      {photos.length > 0 && (
        <PhotoTabs
          photos={photos}
          activeId={activePhotoId}
          onSelect={setActivePhotoId}
        />
      )}

      {activePhoto && (
        <MaskAndGenerate
          photo={activePhoto}
          fenceJob={fenceJob}
          onResult={(viz) => handleVisualizationCreated(activePhoto.id, viz)}
          onRemovePhoto={() => handleRemovePhoto(activePhoto.id)}
        />
      )}

      {activePhoto && activePhoto.visualizations.length > 0 && (
        <VisualizationGallery photo={activePhoto} />
      )}
    </div>
  );
}

function ConfigPanel({
  fenceJob,
  estimateId,
}: {
  fenceJob: FenceJobInput;
  estimateId: string;
}) {
  const ft = fenceJob.fenceType as FenceType;
  const typeLabel = FENCE_TYPE_LABELS[ft] ?? fenceJob.fenceType;
  const styleLabel =
    STYLE_OPTIONS_BY_TYPE[ft]?.find((o) => o.value === fenceJob.style)?.label ??
    null;
  const colorOpt = COLOR_OPTIONS_BY_TYPE[ft]?.find(
    (o) => o.value === fenceJob.color,
  );

  return (
    <div className="rounded border border-slate-300 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
        Generating this fence (from estimate)
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {colorOpt?.swatch && (
          <div
            className="w-8 h-8 rounded-full border border-slate-300 shrink-0"
            style={{ background: colorOpt.swatch }}
            title={colorOpt.label}
          />
        )}
        <div className="font-medium text-slate-900">
          {fenceJob.heightFeet}-ft {typeLabel}
        </div>
        {styleLabel && (
          <div className="text-sm text-slate-600">· {styleLabel}</div>
        )}
        {colorOpt && (
          <div className="text-sm text-slate-600">· {colorOpt.label}</div>
        )}
        {fenceJob.hasGate && (
          <div className="text-sm text-slate-600">· with gate</div>
        )}
        <a
          href={`/estimates/${estimateId}`}
          className="ml-auto text-xs text-slate-500 underline hover:text-ink"
        >
          Change on estimate →
        </a>
      </div>
    </div>
  );
}

function UploadBox({
  onFile,
  uploading,
}: {
  onFile: (file: File, angleLabel?: string) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [angleLabel, setAngleLabel] = useState("");

  return (
    <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-6">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file, angleLabel || undefined);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add photo"}
        </Button>
        <input
          type="text"
          placeholder="Angle label (e.g. front, back, side)"
          value={angleLabel}
          onChange={(e) => setAngleLabel(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm flex-1 min-w-48"
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Take or upload a photo from the angle the customer wants to see. JPEG
        or PNG, up to 12 MB.
      </p>
    </div>
  );
}

function PhotoTabs({
  photos,
  activeId,
  onSelect,
}: {
  photos: Photo[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {photos.map((p, i) => {
        const label = p.angleLabel ?? `Angle ${i + 1}`;
        const isActive = p.id === activeId;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`rounded border px-3 py-1.5 text-sm ${
              isActive
                ? "border-ink bg-ink text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function MaskAndGenerate({
  photo,
  fenceJob,
  onResult,
  onRemovePhoto,
}: {
  photo: Photo;
  fenceJob: FenceJobInput;
  onResult: (viz: Photo["visualizations"][number]) => void;
  onRemovePhoto: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(80);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = photo.width;
    canvas.height = photo.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [photo.id, photo.width, photo.height]);

  function paint(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation =
      tool === "brush" ? "source-over" : "destination-out";
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, (brushSize * scaleX) / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function clearMask() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  async function generate() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setGenerating(true);
    setError(null);
    try {
      const maskBase64 = canvas.toDataURL("image/png");
      const res = await fetch("/api/visualize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          photoId: photo.id,
          maskBase64,
          fenceType: fenceJob.fenceType,
          heightFeet: fenceJob.heightFeet,
          style: fenceJob.style,
          color: fenceJob.color,
          hasGate: fenceJob.hasGate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const code = data.error ?? `generation_failed_${res.status}`;
        const detail = data.detail ? ` — ${data.detail}` : "";
        throw new Error(`${code}${detail}`);
      }
      onResult({
        id: data.id,
        status: data.status,
        publicUrl: data.publicUrl,
        createdAt: new Date().toISOString(),
      });
      clearMask();
      // Scroll the new preview into view — easy to miss otherwise.
      setTimeout(() => {
        document
          .getElementById("viz-gallery")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex rounded border border-slate-300 overflow-hidden">
          <button
            type="button"
            onClick={() => setTool("brush")}
            className={`px-3 py-1.5 text-sm ${
              tool === "brush" ? "bg-ink text-white" : "bg-white text-slate-700"
            }`}
          >
            Brush
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`px-3 py-1.5 text-sm border-l border-slate-300 ${
              tool === "eraser"
                ? "bg-ink text-white"
                : "bg-white text-slate-700"
            }`}
          >
            Eraser
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          Size
          <input
            type="range"
            min={10}
            max={120}
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
          />
          <span className="w-8 text-right">{brushSize}</span>
        </label>
        <button
          type="button"
          onClick={clearMask}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400"
        >
          Clear mask
        </button>
        <button
          type="button"
          onClick={onRemovePhoto}
          className="rounded border border-rose-300 bg-white px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
        >
          Remove photo
        </button>
        <Button
          type="button"
          onClick={generate}
          disabled={generating}
          className="ml-auto"
        >
          {generating ? "Generating (~20s)..." : "Generate fence"}
        </Button>
      </div>

      <div className="rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 space-y-1">
        <div className="font-semibold">How to mask a fence:</div>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>
            Paint a <strong>wide horizontal strip</strong> across the entire
            length where the fence should go — left edge to right edge of the
            yard, not just one spot.
          </li>
          <li>
            Make the strip <strong>tall enough</strong> for the fence height
            (~10–20% of the photo height). Too thin = no fence appears.
          </li>
          <li>
            Cover the area cleanly — bump up brush size (try 80–120) for fast
            wide strokes.
          </li>
        </ul>
        <div className="pt-1">
          The generated preview appears in the{" "}
          <strong>gallery below the photo</strong> after ~20 seconds.
        </div>
      </div>

      <div className="relative inline-block max-w-full select-none">
        <Image
          src={photo.publicUrl}
          alt={photo.angleLabel ?? "Property photo"}
          width={photo.width}
          height={photo.height}
          className="block max-w-full h-auto rounded border border-slate-300"
          unoptimized
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-50 cursor-crosshair touch-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            paint(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) paint(e.clientX, e.clientY);
          }}
        />
      </div>

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded p-3">
          {error}
        </div>
      )}
    </div>
  );
}

function VisualizationGallery({ photo }: { photo: Photo }) {
  const ready = photo.visualizations.filter((v) => v.status === "ready");
  if (ready.length === 0) return null;
  return (
    <div id="viz-gallery" className="space-y-2 scroll-mt-4">
      <h3 className="text-sm font-semibold text-slate-700">
        Generated previews
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ready.map((v) =>
          v.publicUrl ? (
            <a
              key={v.id}
              href={v.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded border border-slate-300 overflow-hidden hover:border-slate-400"
            >
              <img
                src={v.publicUrl}
                alt="Generated fence preview"
                className="block w-full h-auto"
              />
            </a>
          ) : null,
        )}
      </div>
    </div>
  );
}

async function loadImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

// Client-side image compression. Phone cameras routinely produce
// 6–12 MB photos; Vercel's request-body cap on the Hobby plan is
// 4.5 MB, so we have to shrink before uploading. We also re-encode
// to JPEG which strips EXIF and HEIC quirks that can trip up the
// server-side image pipeline.
//
// Algorithm: load the file via createObjectURL, paint into a
// canvas at max(MAX_DIMENSION) on the longer edge (preserving
// aspect), and export as JPEG at QUALITY. If the original is
// already small enough and is a JPEG/PNG, we pass it through
// untouched.
const MAX_UPLOAD_BYTES = 4_000_000; // ~4 MB — under Vercel's 4.5 MB cap
const MAX_DIMENSION = 2400; // plenty of pixels for fence rendering
const QUALITY = 0.85;

async function compressForUpload(file: File): Promise<File> {
  const isJpegOrPng =
    file.type === "image/jpeg" || file.type === "image/png";
  if (isJpegOrPng && file.size <= MAX_UPLOAD_BYTES) {
    return file;
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new window.Image();
      i.onload = () => resolve(i);
      i.onerror = (e) => reject(e);
      i.src = url;
    });

    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;
    const targetW = Math.round(img.naturalWidth * scale);
    const targetH = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_2d_unavailable");
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", QUALITY),
    );
    if (!blob) throw new Error("compress_failed");

    // If somehow the compressed result is still over the cap (very
    // tall panoramas at 2400px wide can be), drop quality and retry.
    if (blob.size > MAX_UPLOAD_BYTES) {
      const fallback: Blob | null = await new Promise((res) =>
        canvas.toBlob((b) => res(b), "image/jpeg", 0.7),
      );
      if (fallback && fallback.size <= MAX_UPLOAD_BYTES) {
        return new File([fallback], renameToJpg(file.name), {
          type: "image/jpeg",
        });
      }
    }

    return new File([blob], renameToJpg(file.name), { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function renameToJpg(name: string): string {
  return name.replace(/\.(heic|heif|png|webp|tiff?|bmp)$/iu, ".jpg");
}
