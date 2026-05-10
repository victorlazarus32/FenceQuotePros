// Subtle fence-industry SVG marks. Used on the landing page to ground
// the visual language in the trade — post spacing, gate swing arc,
// site-plan linework. Intentionally low-key; not a logo or icon system.
//
// Each mark is monochromatic (currentColor) so callers can recolor with
// `text-brand`, `text-paper/40`, etc. Marks are decorative — pass an
// aria-hidden wrapper or rely on the default `aria-hidden="true"`.

type MarkProps = {
  className?: string;
};

// 8' on-center post spacing — three posts, two spans, dimension labels.
// Reads as "this software knows fence math."
export function PostSpacingMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 240 56"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
    >
      {/* Ground line */}
      <line x1="0" y1="48" x2="240" y2="48" strokeWidth="1" opacity="0.4" />
      {/* Three posts */}
      <rect x="6" y="14" width="6" height="34" fill="currentColor" stroke="none" />
      <rect x="117" y="14" width="6" height="34" fill="currentColor" stroke="none" />
      <rect x="228" y="14" width="6" height="34" fill="currentColor" stroke="none" />
      {/* Top rail */}
      <line x1="6" y1="18" x2="234" y2="18" strokeWidth="1.5" />
      {/* Pickets — thin verticals between posts */}
      {[24, 36, 48, 60, 72, 84, 96, 108].map((x) => (
        <line key={`a${x}`} x1={x} y1="18" x2={x} y2="48" strokeWidth="0.75" opacity="0.55" />
      ))}
      {[135, 147, 159, 171, 183, 195, 207, 219].map((x) => (
        <line key={`b${x}`} x1={x} y1="18" x2={x} y2="48" strokeWidth="0.75" opacity="0.55" />
      ))}
      {/* Dimension brackets above */}
      <line x1="9" y1="6" x2="120" y2="6" strokeWidth="0.75" />
      <line x1="9" y1="3" x2="9" y2="9" strokeWidth="0.75" />
      <line x1="120" y1="3" x2="120" y2="9" strokeWidth="0.75" />
      <line x1="120" y1="6" x2="231" y2="6" strokeWidth="0.75" />
      <line x1="231" y1="3" x2="231" y2="9" strokeWidth="0.75" />
    </svg>
  );
}

// Gate swing arc — a hinge dot and the dashed quarter-arc the gate sweeps.
export function GateSwingMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
    >
      {/* Hinge post */}
      <circle cx="14" cy="66" r="3" fill="currentColor" stroke="none" />
      {/* Closed gate */}
      <line x1="14" y1="66" x2="68" y2="66" strokeWidth="1.5" />
      {/* Open gate position */}
      <line x1="14" y1="66" x2="14" y2="12" strokeWidth="1.5" opacity="0.45" />
      {/* Swing arc */}
      <path d="M 68 66 A 54 54 0 0 0 14 12" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
    </svg>
  );
}

// Site-plan corner — L-bracket with grid ticks. Use as a section anchor.
export function SitePlanCorner({ className }: MarkProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
    >
      <line x1="0" y1="6" x2="40" y2="6" strokeWidth="1" />
      <line x1="6" y1="0" x2="6" y2="40" strokeWidth="1" />
      {[14, 22, 30].map((t) => (
        <line key={`h${t}`} x1={t} y1="3" x2={t} y2="9" strokeWidth="0.75" opacity="0.5" />
      ))}
      {[14, 22, 30].map((t) => (
        <line key={`v${t}`} x1="3" y1={t} x2="9" y2={t} strokeWidth="0.75" opacity="0.5" />
      ))}
    </svg>
  );
}
