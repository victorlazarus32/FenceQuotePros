"use client";

import { useEffect, useRef, useState } from "react";

// Animated fence mark: cycles through the four fence types Fence Quote
// Pros estimates — aluminum picket, wood privacy, chain-link, PVC
// privacy. Same 240x56 viewBox as the static PostSpacingMark so the
// layout doesn't shift between variants.
//
// Variants cross-fade. `prefers-reduced-motion: reduce` pauses the
// cycle on the first variant so accessibility users don't get a
// blinking element. Stroke/fill use currentColor so callers can recolor
// with text-brand, text-brand/60, etc.

const VARIANTS = ["aluminum", "wood", "chain", "pvc"] as const;
type Variant = (typeof VARIANTS)[number];

const LABELS: Record<Variant, string> = {
  aluminum: "Aluminum",
  wood: "Wood",
  chain: "Chain-link",
  pvc: "PVC",
};

const CYCLE_MS = 2400;
const FADE_MS = 600;

type Props = {
  className?: string;
  showLabel?: boolean;
};

export default function AnimatedFenceMark({
  className = "",
  showLabel = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    intervalRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % VARIANTS.length);
    }, CYCLE_MS);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const active = VARIANTS[index];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="relative shrink-0"
        style={{ aspectRatio: "240 / 96", width: "100%", maxWidth: "100%" }}
      >
        {VARIANTS.map((variant) => (
          <div
            key={variant}
            aria-hidden={variant !== active}
            className="absolute inset-0"
            style={{
              opacity: variant === active ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
          >
            <FenceVariant kind={variant} />
          </div>
        ))}
      </div>
      {showLabel ? (
        <div
          className="font-mono text-[9px] uppercase tracking-[0.22em] opacity-70 shrink-0"
          aria-live="polite"
        >
          {LABELS[active]}
        </div>
      ) : null}
    </div>
  );
}

function FenceVariant({ kind }: { kind: Variant }) {
  switch (kind) {
    case "aluminum":
      return <AluminumPicket />;
    case "wood":
      return <WoodPrivacy />;
    case "chain":
      return <ChainLink />;
    case "pvc":
      return <PvcPrivacy />;
  }
}

// All variants share viewBox 240x96. Fence body sits y=14..88 (74 units
// tall) so the fence reads as ~6 ft tall against ~32 ft of width
// instead of looking squished into a horizontal strip.

// 3 posts, top rail, thin pickets between — ornamental fence look.
function AluminumPicket() {
  const bay1Pickets = [24, 36, 48, 60, 72, 84, 96, 108];
  const bay2Pickets = [135, 147, 159, 171, 183, 195, 207, 219];
  return (
    <svg
      viewBox="0 0 240 96"
      className="w-full h-full"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
    >
      <line x1="0" y1="88" x2="240" y2="88" strokeWidth="1" opacity="0.4" />
      <rect x="6" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      <rect x="117" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      <rect x="228" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      <line x1="6" y1="20" x2="234" y2="20" strokeWidth="1.5" />
      {[...bay1Pickets, ...bay2Pickets].map((x) => (
        <line key={x} x1={x} y1="20" x2={x} y2="88" strokeWidth="0.9" opacity="0.6" />
      ))}
    </svg>
  );
}

// Solid vertical boards filling each bay — privacy wood fence.
function WoodPrivacy() {
  // 12px-wide boards with 0.5px implied gap. Bay 1: 14..117 -> ~8 boards.
  // Bay 2: 125..228 -> ~8 boards. Top cap rail thicker.
  const bay1 = Array.from({ length: 8 }, (_, i) => 14 + i * 12.6);
  const bay2 = Array.from({ length: 8 }, (_, i) => 125 + i * 12.6);
  return (
    <svg
      viewBox="0 0 240 96"
      className="w-full h-full"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
    >
      <line x1="0" y1="88" x2="240" y2="88" strokeWidth="1" opacity="0.4" />
      {/* boards */}
      {[...bay1, ...bay2].map((x) => (
        <rect
          key={x}
          x={x}
          y="22"
          width="11.5"
          height="66"
          fill="currentColor"
          opacity="0.78"
          stroke="none"
        />
      ))}
      {/* posts (drawn over the boards so they read as posts) */}
      <rect x="6" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      <rect x="117" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      <rect x="228" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      {/* top cap rail */}
      <line x1="6" y1="18" x2="234" y2="18" strokeWidth="2.5" />
    </svg>
  );
}

// Top + bottom rails with diagonal mesh fill — chain-link.
function ChainLink() {
  return (
    <svg
      viewBox="0 0 240 96"
      className="w-full h-full"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
    >
      <defs>
        <pattern
          id="cl-mesh"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
        >
          <line x1="0" y1="0" x2="6" y2="6" stroke="currentColor" strokeWidth="0.6" opacity="0.65" />
          <line x1="6" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="0.6" opacity="0.65" />
        </pattern>
      </defs>
      <line x1="0" y1="88" x2="240" y2="88" strokeWidth="1" opacity="0.4" />
      {/* mesh in each bay (between the post inner edges) */}
      <rect x="13" y="22" width="103" height="64" fill="url(#cl-mesh)" stroke="none" />
      <rect x="124" y="22" width="103" height="64" fill="url(#cl-mesh)" stroke="none" />
      {/* posts */}
      <rect x="6" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      <rect x="117" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      <rect x="228" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      {/* top + bottom rails */}
      <line x1="6" y1="22" x2="234" y2="22" strokeWidth="1.25" />
      <line x1="13" y1="86" x2="227" y2="86" strokeWidth="0.9" opacity="0.75" />
    </svg>
  );
}

// Wider vertical boards + decorative top cap lip — PVC privacy.
function PvcPrivacy() {
  // 5 wider boards per bay with a top cap lip.
  const bay1 = [16, 36, 56, 76, 96];
  const bay2 = [127, 147, 167, 187, 207];
  return (
    <svg
      viewBox="0 0 240 96"
      className="w-full h-full"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
    >
      <line x1="0" y1="88" x2="240" y2="88" strokeWidth="1" opacity="0.4" />
      {/* boards */}
      {[...bay1, ...bay2].map((x) => (
        <rect
          key={x}
          x={x}
          y="24"
          width="17"
          height="64"
          fill="currentColor"
          opacity="0.72"
          stroke="none"
        />
      ))}
      {/* posts */}
      <rect x="6" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      <rect x="117" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      <rect x="228" y="14" width="6" height="74" fill="currentColor" stroke="none" />
      {/* PVC cap lip (wider top stripe) */}
      <rect x="12" y="16" width="105" height="6" fill="currentColor" opacity="0.95" stroke="none" />
      <rect x="123" y="16" width="105" height="6" fill="currentColor" opacity="0.95" stroke="none" />
      {/* finial line on each post top */}
      <rect x="3" y="10" width="12" height="4" fill="currentColor" stroke="none" />
      <rect x="114" y="10" width="12" height="4" fill="currentColor" stroke="none" />
      <rect x="225" y="10" width="12" height="4" fill="currentColor" stroke="none" />
    </svg>
  );
}
