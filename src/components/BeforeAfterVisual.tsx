"use client";

import Image from "next/image";
import { useState } from "react";

type Style = "aluminum" | "wood" | "pvc";

const styles: { id: Style; label: string; src: string | null }[] = [
  { id: "aluminum", label: "Aluminum", src: "/landing-preview/after-aluminum.png" },
  { id: "wood", label: "Wood", src: null },
  { id: "pvc", label: "PVC", src: "/landing-preview/after-pvc.png" },
];

export default function BeforeAfterVisual() {
  const [active, setActive] = useState<Style>("aluminum");
  const current = styles.find((s) => s.id === active)!;

  return (
    <div className="rounded-xl border-2 border-ink shadow-[8px_8px_0_var(--brand)] overflow-hidden bg-ink">
      <div className="grid grid-cols-1">
        <div className="relative aspect-[16/10] bg-slate-800 overflow-hidden">
          <Image
            src="/landing-preview/before.jpg"
            alt="Property before fence install"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-ink/80 text-paper text-xs uppercase tracking-wider font-bold backdrop-blur">
            Before
          </div>
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
            <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-deep to-brand-dark flex items-center justify-center text-paper/50 text-xs uppercase tracking-wider">
              {current.label} render coming soon
            </div>
          )}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand text-ink text-xs uppercase tracking-wider font-bold">
            After
          </div>
        </div>
      </div>
      <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider opacity-60">Style</div>
        <div className="flex gap-1.5">
          {styles.map((s) => {
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={
                  isActive
                    ? "px-2 py-0.5 rounded-full bg-brand text-ink text-[10px] uppercase tracking-wider font-bold"
                    : "px-2 py-0.5 rounded-full bg-paper/10 border border-paper/20 text-[10px] uppercase tracking-wider hover:bg-paper/15 transition"
                }
              >
                {s.label}
                {isActive ? " ✓" : ""}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
