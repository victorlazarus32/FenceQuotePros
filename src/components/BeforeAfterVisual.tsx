"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/landing/lang";

type Style = "aluminum" | "wood" | "pvc";

const LABELS: Record<Lang, {
  header: string;
  before: string;
  beforeFoot: string;
  after: string;
  afterFoot: string;
  fenceStyleLabel: string;
  comingSoon: string;
}> = {
  en: {
    header: "Visualizer · EST-1042",
    before: "Before",
    beforeFoot: "Site photo · raw",
    after: "After",
    afterFoot: "6′ · 24 posts · 1 gate",
    fenceStyleLabel: "Fence style",
    comingSoon: "render coming soon",
  },
  es: {
    header: "Visualizador · EST-1042",
    before: "Antes",
    beforeFoot: "Foto del sitio · sin editar",
    after: "Después",
    afterFoot: "6′ · 24 postes · 1 portón",
    fenceStyleLabel: "Estilo de cerca",
    comingSoon: "render próximamente",
  },
};

const styles: { id: Style; label: string; src: string }[] = [
  { id: "aluminum", label: "Aluminum", src: "/landing-preview/after-aluminum.png" },
  { id: "pvc", label: "PVC", src: "/landing-preview/after-pvc.png" },
  { id: "wood", label: "Wood", src: "/landing-preview/after-wood.png" },
];

const CYCLE_MS = 2000;
const FADE_MS = 700;

export default function BeforeAfterVisual({
  lang = "en",
}: { lang?: Lang } = {}) {
  const [active, setActive] = useState<Style>("aluminum");
  const intervalRef = useRef<number | null>(null);
  const current = styles.find((s) => s.id === active)!;
  const t = LABELS[lang];

  const advance = useCallback(() => {
    setActive((cur) => {
      const i = styles.findIndex((s) => s.id === cur);
      return styles[(i + 1) % styles.length].id;
    });
  }, []);

  const startCycle = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(advance, CYCLE_MS);
  }, [advance]);

  // Auto-cycle through fence styles every 2s on mount. Honors
  // prefers-reduced-motion: reduce — no cycle, sticks on aluminum.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    startCycle();
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [startCycle]);

  // Click resets the timer so the user gets a fresh 2s on their pick
  // before the cycle advances again.
  const handlePick = useCallback(
    (id: Style) => {
      setActive(id);
      startCycle();
    },
    [startCycle],
  );

  return (
    <div className="bg-white border border-ink/15">
      {/* Header strip — feels like a job-site doc, not a SaaS card */}
      <div className="px-4 py-2.5 bg-ink text-paper border-b border-ink/15 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/70">
          <span className="w-1.5 h-1.5 bg-brand" />
          {t.header}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
          64 LF · 6′
        </div>
      </div>

      {/* BEFORE / AFTER pair with dimension annotations on the AFTER */}
      <div className="grid grid-cols-1">
        <div className="relative aspect-[16/10] bg-slate-800 overflow-hidden">
          <Image
            src="/landing-preview/before.jpg"
            alt="Property before fence install"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-ink/85 text-paper text-[10px] uppercase tracking-[0.22em] font-bold backdrop-blur">
            {t.before}
          </span>
          <span className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/70">
            {t.beforeFoot}
          </span>
        </div>

        <div className="h-px bg-brand" />

        <div className="relative aspect-[16/10] bg-ink overflow-hidden">
          {/* All three after-renders are layered; opacity drives which one
              is visible. Cross-fades smoothly on every cycle tick instead
              of flashing through a remount. */}
          {styles.map((s) => (
            <Image
              key={s.id}
              src={s.src}
              alt={`Property after fence install — ${s.label.toLowerCase()}`}
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
              style={{
                opacity: s.id === active ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
              }}
            />
          ))}

          {/* Architectural dimension overlay — top edge: linear feet bracket */}
          <DimensionBracket />

          <span
            key={`label-${current.id}`}
            className="fqp-cell-in absolute top-3 left-3 px-2.5 py-1 bg-brand text-ink text-[10px] uppercase tracking-[0.22em] font-bold"
          >
            {t.after} · {current.label}
          </span>
          <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/85">
            {t.afterFoot}
          </span>
        </div>
      </div>

      {/* Style selector — flat tabs that double as a live indicator of
          which fence the auto-cycle is currently showing. Click jumps
          to that style and resets the 2s timer. */}
      <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between border-t border-paper/10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
          {t.fenceStyleLabel}
        </div>
        <div className="flex">
          {styles.map((s) => {
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handlePick(s.id)}
                aria-pressed={isActive}
                className={
                  isActive
                    ? "px-3 py-1.5 bg-brand text-ink text-[10px] uppercase tracking-[0.22em] font-bold border border-brand"
                    : "px-3 py-1.5 bg-transparent text-paper/70 text-[10px] uppercase tracking-[0.22em] font-bold border border-paper/20 hover:border-paper/40 hover:text-paper transition-colors"
                }
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Top-edge dimension bracket — fence-industry / blueprint convention.
// Subtle: brand-colored thin line with end ticks + a centered measurement label.
function DimensionBracket() {
  return (
    <div className="absolute top-0 left-0 right-0 px-12 pt-6 pointer-events-none">
      <div className="relative">
        <div className="h-px bg-brand/70" />
        <span className="absolute left-0 top-0 -translate-y-1/2 w-px h-3 bg-brand/70" />
        <span className="absolute right-0 top-0 -translate-y-1/2 w-px h-3 bg-brand/70" />
        <span
          className="absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full px-1.5 bg-ink text-brand font-mono text-[9px] uppercase tracking-[0.22em]"
        >
          64 LF
        </span>
      </div>
    </div>
  );
}
