"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Animated permit-autofill explainer (~36s). Starts on first scroll
// into view, then offers a Replay button when the animation finishes.
// Single auto-trigger per page load — the IntersectionObserver
// disconnects after firing once. Replay re-runs as many times as the
// user wants.
//
// The "force restart" semantics: setting src with a fresh cache-bust
// query param causes React to re-render the iframe with a new src,
// which the browser reloads from scratch — this guarantees the
// animation runs from frame 0 each time, not from wherever it had
// gotten to during the lazy-load.

const SPOT_PATH = "/spots/permit-autofill.html";
const SPOT_DURATION_MS = 36_000;
const VIEWPORT_TRIGGER_THRESHOLD = 0.35;

export default function PermitAutofillSpot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const finishTimerRef = useRef<number | null>(null);
  const [src, setSrc] = useState<string>(SPOT_PATH);
  const [showReplay, setShowReplay] = useState(false);

  const armFinishTimer = useCallback(() => {
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
    }
    finishTimerRef.current = window.setTimeout(() => {
      setShowReplay(true);
      finishTimerRef.current = null;
    }, SPOT_DURATION_MS);
  }, []);

  // First-view trigger — observer disconnects after the first hit so
  // the animation never auto-restarts from scrolling back up.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSrc(`${SPOT_PATH}?t=${Date.now()}`);
            setShowReplay(false);
            armFinishTimer();
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: VIEWPORT_TRIGGER_THRESHOLD },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [armFinishTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
      }
    };
  }, []);

  const handleReplay = useCallback(() => {
    setSrc(`${SPOT_PATH}?t=${Date.now()}`);
    setShowReplay(false);
    armFinishTimer();
  }, [armFinishTimer]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-ink"
      style={{
        border: "2px solid #ff5a0f",
        boxShadow:
          "0 18px 48px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,90,15,0.15)",
      }}
    >
      <iframe
        key={src}
        src={src}
        title="Permit Autofill"
        loading="lazy"
        className="absolute inset-0 w-full h-full block"
      />

      {showReplay ? (
        <button
          type="button"
          onClick={handleReplay}
          className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3.5 py-2 bg-brand text-ink hover:bg-paper transition-colors shadow-[0_6px_16px_-4px_rgba(0,0,0,0.55)]"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}
          aria-label="Replay Permit Autofill demo"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Replay
        </button>
      ) : null}
    </div>
  );
}
