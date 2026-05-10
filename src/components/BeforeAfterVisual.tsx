"use client";

import Image from "next/image";
import { useState } from "react";

type Style = "aluminum" | "wood" | "pvc";

const styles: { id: Style; label: string; src: string | null }[] = [
  { id: "aluminum", label: "Aluminum", src: "/landing-preview/after-aluminum.png" },
  { id: "pvc", label: "PVC", src: "/landing-preview/after-pvc.png" },
  { id: "wood", label: "Wood", src: "/landing-preview/after-wood.png" },
];

export default function BeforeAfterVisual() {
  const [active, setActive] = useState<Style>("aluminum");
  const current = styles.find((s) => s.id === active)!;

  return (
    <div className="bg-white border border-ink/15">
      {/* Header strip — feels like a job-site doc, not a SaaS card */}
      <div className="px-4 py-2.5 bg-ink text-paper border-b border-ink/15 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/70">
          <span className="w-1.5 h-1.5 bg-brand" />
          Visualizer · EST-1042
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
          64 LF · 6′0″
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
            Before
          </span>
          <span className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/70">
            Site photo · raw
          </span>
        </div>

        <div className="h-px bg-brand" />

        <div className="relative aspect-[16/10] bg-ink overflow-hidden">
          {current.src ? (
            <Image
              key={current.id}
              src={current.src}
              alt={`Property after fence install — ${current.label.toLowerCase()}`}
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-ink flex items-center justify-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
                {current.label} render coming soon
              </span>
            </div>
          )}

          {/* Architectural dimension overlay — top edge: linear feet bracket */}
          <DimensionBracket />

          <span className="absolute top-3 left-3 px-2.5 py-1 bg-brand text-ink text-[10px] uppercase tracking-[0.22em] font-bold">
            After · {current.label}
          </span>
          <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/85">
            6′0″ · 24 posts · 1 gate
          </span>
        </div>
      </div>

      {/* Style selector — flat tabs, no rounded pills */}
      <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between border-t border-paper/10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
          Fence style
        </div>
        <div className="flex">
          {styles.map((s) => {
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
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
