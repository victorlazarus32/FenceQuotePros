// Status watermark for customer-facing documents (estimate + invoice).
// Direction D from the design package — gives instant skim-recognition of
// where a doc stands without reading the status pill. Survives print.

const STYLES: Record<string, { text: string; color: string }> = {
  draft: { text: "DRAFT", color: "#94a3b8" },
  sent: { text: "SENT", color: "#1a1a1a" },
  accepted: { text: "ACCEPTED", color: "#ff6b1a" },
  declined: { text: "DECLINED", color: "#dc2626" },
  expired: { text: "EXPIRED", color: "#dc2626" },
  paid: { text: "PAID", color: "#16a34a" },
  partial: { text: "PARTIAL", color: "#ca8a04" },
  overdue: { text: "OVERDUE", color: "#dc2626" },
  void: { text: "VOID", color: "#1a1a1a" },
};

const ES_OVERRIDES: Record<string, string> = {
  draft: "BORRADOR",
  sent: "ENVIADO",
  accepted: "ACEPTADO",
  declined: "RECHAZADO",
  expired: "VENCIDO",
  paid: "PAGADO",
  partial: "PARCIAL",
  overdue: "ATRASADO",
};

export function DocWatermark({
  status,
  lang = "en",
}: {
  status: string;
  lang?: "en" | "es";
}) {
  const def = STYLES[status];
  if (!def) return null;
  const text = lang === "es" ? (ES_OVERRIDES[status] ?? def.text) : def.text;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <span
        className="select-none whitespace-nowrap"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          textTransform: "uppercase",
          fontSize: "clamp(120px, 22vw, 220px)",
          color: def.color,
          opacity: 0.08,
          letterSpacing: "0.04em",
          transform: "rotate(-22deg)",
        }}
      >
        {text}
      </span>
    </div>
  );
}
