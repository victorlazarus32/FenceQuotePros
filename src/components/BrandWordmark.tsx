// Branded wordmark: FENCE / QUOTE / PROS rendered with the QUOTE word in
// brand orange to mirror the logo lockup. Outer color is inherited from
// the parent (currentColor) so the same component drops in cleanly on
// dark or light backgrounds — only the orange segment is forced.
//
// Use this anywhere the brand appears as visible content. Keep plain
// text "Fence Quote Pros" for page titles, alt text, aria labels, and
// fallback strings (places where the styled wordmark would be wrong or
// invisible).

type Props = {
  /** Append a ™ superscript. Use on first prominent appearance per page. */
  tm?: boolean;
  /** Optional className passthrough for sizing/weight overrides. */
  className?: string;
};

export default function BrandWordmark({ tm = false, className = "" }: Props) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.005em",
        whiteSpace: "nowrap",
      }}
    >
      FENCE<span className="text-brand">QUOTE</span>PROS
      {tm ? (
        <sup
          aria-hidden="true"
          style={{
            fontSize: "0.5em",
            fontWeight: 700,
            marginLeft: "0.1em",
            verticalAlign: "super",
            lineHeight: 0,
          }}
        >
          ™
        </sup>
      ) : null}
    </span>
  );
}
