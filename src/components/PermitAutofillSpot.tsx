"use client";

import { Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/landing/lang";

const T: Record<Lang, {
  title: string;
  duration: string;
  click: string;
  replay: string;
  playLabel: string;
  replayLabel: string;
}> = {
  en: {
    title: "Permit Autofill",
    duration: "36 s",
    click: "Click to play",
    replay: "Replay",
    playLabel: "Play Permit Autofill demo",
    replayLabel: "Replay Permit Autofill demo",
  },
  es: {
    title: "Auto-relleno de permisos",
    duration: "36 s",
    click: "Haz clic para reproducir",
    replay: "Repetir",
    playLabel: "Reproducir demo de auto-relleno",
    replayLabel: "Repetir demo de auto-relleno",
  },
};

// Animated permit-autofill explainer (~36s). Click-to-play: the iframe
// is not loaded until the user clicks the sonar-pulse Play button, so
// the 4.6MB explainer never downloads on visitors who scroll past
// without engaging.
//
// First-time view shows a centered Play button with three sonar rings
// pulsing outward (defined in globals.css) — a soft hail asking for
// attention without auto-playing.
//
// After the spot finishes (~36s after click), a Replay button surfaces
// bottom-right. Replay is unbounded; the sonar overlay does not return
// because the user has already engaged.

const SPOT_PATH = "/spots/permit-autofill.html";
const SPOT_DURATION_MS = 36_000;

export default function PermitAutofillSpot({
  lang = "en",
}: { lang?: Lang } = {}) {
  const [src, setSrc] = useState<string | null>(null);
  const [showReplay, setShowReplay] = useState(false);
  const finishTimerRef = useRef<number | null>(null);
  const t = T[lang];

  const armFinishTimer = useCallback(() => {
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
    }
    finishTimerRef.current = window.setTimeout(() => {
      setShowReplay(true);
      finishTimerRef.current = null;
    }, SPOT_DURATION_MS);
  }, []);

  const handlePlay = useCallback(() => {
    setSrc(`${SPOT_PATH}?t=${Date.now()}`);
    setShowReplay(false);
    armFinishTimer();
  }, [armFinishTimer]);

  // Cleanup pending timer on unmount.
  useEffect(() => {
    return () => {
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full aspect-video bg-ink"
      style={{
        border: "2px solid #ff5a0f",
        boxShadow:
          "0 18px 48px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,90,15,0.15)",
      }}
    >
      {src ? (
        <iframe
          key={src}
          src={src}
          title="Permit Autofill"
          loading="lazy"
          className="absolute inset-0 w-full h-full block"
        />
      ) : (
        <PosterOverlay onPlay={handlePlay} t={t} />
      )}

      {showReplay ? (
        <button
          type="button"
          onClick={handlePlay}
          className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3.5 py-2 bg-brand text-ink hover:bg-paper transition-colors shadow-[0_6px_16px_-4px_rgba(0,0,0,0.55)]"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}
          aria-label={t.replayLabel}
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          {t.replay}
        </button>
      ) : null}
    </div>
  );
}

function PosterOverlay({
  onPlay,
  t,
}: {
  onPlay: () => void;
  t: (typeof T)[Lang];
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink">
      <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/60">
        {t.title} · {t.duration}
      </span>
      <span className="absolute top-3 right-3 font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
        {t.click}
      </span>

      <div className="relative">
        {/* Sonar rings — radiate outward continuously to call attention. */}
        <span className="fqp-sonar-ring" aria-hidden="true" />
        <span
          className="fqp-sonar-ring fqp-sonar-ring-2"
          aria-hidden="true"
        />
        <span
          className="fqp-sonar-ring fqp-sonar-ring-3"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={onPlay}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand text-ink flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          style={{
            boxShadow: "0 0 0 6px rgba(255,90,15,0.25)",
          }}
          aria-label={t.playLabel}
        >
          <Play className="w-9 h-9 sm:w-11 sm:h-11 fill-current ml-1" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
