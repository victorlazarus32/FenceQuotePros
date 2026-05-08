"use client";

// Reusable signature canvas. Stateless: emits a base64 PNG dataURL via
// onChange whenever the strokes change, plus a hasInk boolean so callers
// can disable submit until the user has actually drawn something. Used by:
//   - SignatureBlock (estimate signing)
//   - PermitDocSignatureForm (per-doc customer signing)
//   - ContractorSignatureProfileForm (saved contractor sig)

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Eraser } from "lucide-react";

export interface SignaturePadHandle {
  /** Returns a PNG dataURL or null if the canvas is empty. */
  toDataUrl(): string | null;
  clear(): void;
}

interface Props {
  ariaLabel?: string;
  placeholder?: string;
  onChange?: (hasInk: boolean) => void;
  className?: string;
}

export const SignaturePad = forwardRef<SignaturePadHandle, Props>(
  function SignaturePad(
    { ariaLabel = "Signature pad", placeholder = "Sign here", onChange, className = "" },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [hasInk, setHasInk] = useState(false);
    const drawing = useRef(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

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
      const ctx = canvas.getContext("2d");
      if (ctx && lastPoint.current) {
        ctx.beginPath();
        ctx.arc(lastPoint.current.x, lastPoint.current.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "#0f172a";
        ctx.fill();
      }
      if (!hasInk) {
        setHasInk(true);
        onChange?.(true);
      }
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

    useImperativeHandle(ref, () => ({
      toDataUrl: () => {
        if (!hasInk) return null;
        return canvasRef.current?.toDataURL("image/png") ?? null;
      },
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasInk(false);
        onChange?.(false);
      },
    }));

    function clearLocal() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasInk(false);
      onChange?.(false);
    }

    return (
      <div className={`space-y-1 ${className}`}>
        <div
          className="rounded-md border-2 border-ink bg-white relative overflow-hidden"
          style={{ aspectRatio: "3 / 1", touchAction: "none" }}
        >
          <canvas
            ref={canvasRef}
            aria-label={ariaLabel}
            className="absolute inset-0 w-full h-full cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
          {!hasInk && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-slate-400 text-sm italic">
              {placeholder}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={clearLocal}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-ink"
          >
            <Eraser className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>
    );
  },
);
