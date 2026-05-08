"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Eraser, PenLine } from "lucide-react";
import { Button } from "@/components/Button";
import { signEstimate, type SignEstimateState } from "@/app/estimates/actions";

type Lang = "en" | "es";

const COPY = {
  en: {
    title: "Sign and accept",
    sub: "Use your mouse or finger to sign below. By signing, you accept this estimate as written.",
    signature_label: "Your signature",
    name_label: "Print full name",
    name_placeholder: "Jane Doe",
    clear: "Clear",
    submit: "Sign and accept",
    submitting: "Signing…",
    signed_title: "Signed and accepted",
    signed_meta: (name: string, when: string) =>
      `Signed by ${name} on ${when}.`,
    error_empty: "Please draw your signature in the box above.",
    success: "Thanks — your signed copy is below.",
  },
  es: {
    title: "Firmar y aceptar",
    sub: "Use el ratón o el dedo para firmar abajo. Al firmar, acepta este presupuesto tal como está escrito.",
    signature_label: "Su firma",
    name_label: "Nombre completo en letra de molde",
    name_placeholder: "Juana Pérez",
    clear: "Borrar",
    submit: "Firmar y aceptar",
    submitting: "Firmando…",
    signed_title: "Firmado y aceptado",
    signed_meta: (name: string, when: string) =>
      `Firmado por ${name} el ${when}.`,
    error_empty: "Por favor dibuje su firma en el cuadro de arriba.",
    success: "Gracias — su copia firmada aparece abajo.",
  },
} as const;

export function SignatureBlock({
  token,
  lang = "en",
  alreadySigned,
  signedByName,
  signedAt,
  signatureDataUrl,
}: {
  token: string;
  lang?: Lang;
  alreadySigned?: boolean;
  signedByName?: string | null;
  signedAt?: Date | string | null;
  signatureDataUrl?: string | null;
}) {
  const t = COPY[lang];
  const [state, formAction, pending] = useActionState<
    SignEstimateState,
    FormData
  >(signEstimate, {});

  if (alreadySigned && signatureDataUrl) {
    const when = signedAt
      ? new Date(signedAt).toLocaleString(lang === "es" ? "es-US" : "en-US", {
          dateStyle: "long",
          timeStyle: "short",
        })
      : "";
    return (
      <SignedReceipt
        title={t.signed_title}
        meta={t.signed_meta(signedByName ?? "—", when)}
        signatureDataUrl={signatureDataUrl}
      />
    );
  }

  return (
    <SignaturePadInner
      token={token}
      lang={lang}
      formAction={formAction}
      pending={pending}
      state={state}
    />
  );
}

function SignedReceipt({
  title,
  meta,
  signatureDataUrl,
}: {
  title: string;
  meta: string;
  signatureDataUrl: string;
}) {
  return (
    <div
      className="mt-8 rounded-md border-2 border-ink p-5"
      style={{ background: "var(--brand-soft)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <PenLine className="w-5 h-5 text-brand" />
        <div className="h-card text-ink">{title}</div>
      </div>
      <div className="bg-white rounded border border-line p-3 inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={signatureDataUrl}
          alt="Signature"
          className="max-h-32 block"
        />
      </div>
      <div className="text-xs text-slate-600 mt-3">{meta}</div>
    </div>
  );
}

function SignaturePadInner({
  token,
  lang,
  formAction,
  pending,
  state,
}: {
  token: string;
  lang: Lang;
  formAction: (formData: FormData) => void;
  pending: boolean;
  state: SignEstimateState;
}) {
  const t = COPY[lang];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync canvas backing-store size to its CSS size with DPR scaling, so the
  // drawing stays crisp on retina displays without distorting coordinates.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  function pointFromEvent(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPoint.current = pointFromEvent(e);
    // Tap = single dot
    const ctx = canvas.getContext("2d");
    if (ctx && lastPoint.current) {
      ctx.beginPath();
      ctx.arc(lastPoint.current.x, lastPoint.current.y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
    }
    setHasInk(true);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pt = pointFromEvent(e);
    if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    lastPoint.current = pt;
  }

  function handlePointerUp() {
    drawing.current = false;
    lastPoint.current = null;
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    setLocalError(null);
  }

  function handleSubmit(formData: FormData) {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) {
      setLocalError(t.error_empty);
      return;
    }
    const dataUrl = canvas.toDataURL("image/png");
    formData.set("token", token);
    formData.set("signatureDataUrl", dataUrl);
    formData.set("signedByName", name);
    setLocalError(null);
    formAction(formData);
  }

  const errorMessage = localError ?? state.message ?? null;

  return (
    <div
      className="mt-8 rounded-md border-2 border-ink p-5 no-print"
      style={{ background: "var(--brand-soft)" }}
    >
      <div className="flex items-center gap-2">
        <PenLine className="w-5 h-5 text-brand" />
        <div className="h-card text-ink">{t.title}</div>
      </div>
      <div className="text-sm text-slate-600 mt-1">{t.sub}</div>

      <form action={handleSubmit} className="mt-4">
        <div className="space-y-1">
          <div
            className="rounded-md border-2 border-ink bg-white relative overflow-hidden"
            style={{ aspectRatio: "3 / 1", touchAction: "none" }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />
            {!hasInk && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-400 text-sm italic">
                {lang === "es" ? "Firme aquí" : "Sign here"}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">{t.signature_label}</span>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-ink"
            >
              <Eraser className="w-3.5 h-3.5" />
              {t.clear}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="signedByName"
            className="text-xs text-slate-600 block mb-1"
          >
            {t.name_label}
          </label>
          <input
            id="signedByName"
            name="signedByName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.name_placeholder}
            required
            minLength={2}
            className="w-full"
          />
        </div>

        {errorMessage && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {errorMessage}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            type="submit"
            disabled={pending}
            className="grow sm:grow-0 sm:min-w-[200px]"
          >
            {pending ? t.submitting : t.submit}
          </Button>
        </div>

        <div className="text-[11px] text-slate-500 mt-3 leading-relaxed">
          {lang === "es"
            ? "Su firma electrónica tiene el mismo valor legal que una firma manuscrita. Se registra la fecha, la hora y la dirección IP."
            : "Your electronic signature has the same legal weight as a wet-ink signature. Date, time, and IP address are recorded."}
        </div>
      </form>
    </div>
  );
}
