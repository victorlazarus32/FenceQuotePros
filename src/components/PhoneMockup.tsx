// Phone mockup for the landing hero. Renders a stylized version of the
// /estimates/new wizard step 2 — the moment a contractor builds a quote.

export function PhoneMockup() {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: 290,
        height: 590,
        transform: "rotate(-2deg)",
      }}
    >
      {/* Phone shadow / depth */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[42px]"
        style={{
          background: "var(--ink-deep)",
          transform: "translate(8px, 10px)",
        }}
      />

      {/* Phone body */}
      <div
        className="relative w-full h-full rounded-[42px] overflow-hidden"
        style={{
          background: "#0a0a0a",
          padding: 8,
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.08), 0 30px 60px -20px rgba(15, 78, 74, 0.45)",
        }}
      >
        {/* Side buttons (decorative) */}
        <div
          aria-hidden
          className="absolute top-28 left-0 w-1 h-12 rounded-r-md"
          style={{ background: "#1f1f1f" }}
        />
        <div
          aria-hidden
          className="absolute top-44 left-0 w-1 h-8 rounded-r-md"
          style={{ background: "#1f1f1f" }}
        />
        <div
          aria-hidden
          className="absolute top-32 right-0 w-1 h-16 rounded-l-md"
          style={{ background: "#1f1f1f" }}
        />

        {/* Screen */}
        <div
          className="relative w-full h-full rounded-[34px] overflow-hidden bg-paper"
          style={{ color: "var(--text-strong)" }}
        >
          {/* Dynamic island / notch */}
          <div
            aria-hidden
            className="absolute top-2 left-1/2 -translate-x-1/2 z-30 rounded-full"
            style={{
              width: 90,
              height: 24,
              background: "#0a0a0a",
            }}
          />

          {/* Status bar */}
          <div className="relative z-20 flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-semibold text-ink">
            <span className="font-mono">9:41</span>
            <div className="flex items-center gap-1">
              <span>●●●</span>
              <span>•</span>
              <span>📶</span>
              <span>100%</span>
            </div>
          </div>

          {/* App nav */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 border-b"
            style={{ borderColor: "var(--line)" }}
          >
            <span className="text-base text-ink">←</span>
            <div
              className="grow"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: 13,
                letterSpacing: "0.03em",
                color: "var(--ink)",
              }}
            >
              New estimate
            </div>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{
                background: "var(--brand-soft)",
                color: "var(--brand)",
              }}
            >
              2 / 4
            </span>
          </div>

          {/* Step bar */}
          <div className="flex gap-1 px-3 py-2.5 bg-white border-b border-line">
            {["Client", "Fence", "Lines", "Send"].map((s, i) => {
              const reached = i <= 1;
              return (
                <div key={s} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="h-1 w-full rounded-full"
                    style={{
                      background: reached ? "var(--brand)" : "var(--line)",
                    }}
                  />
                  <span
                    className="text-[8px] font-bold uppercase tracking-wider"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: reached
                        ? "var(--text-strong)"
                        : "#94a3b8",
                    }}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="px-3 py-3 space-y-3">
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                textTransform: "uppercase",
                fontSize: 18,
                letterSpacing: "0.005em",
                color: "var(--ink)",
                lineHeight: 1,
              }}
            >
              What kind of fence?
            </div>

            {/* Fence type dropdown */}
            <div>
              <div
                className="text-[8px] uppercase tracking-wider font-bold mb-1"
                style={{ color: "#64748b" }}
              >
                Fence type
              </div>
              <div
                className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs bg-white border-2"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="font-medium">Aluminum</span>
                <span className="text-slate-400">▾</span>
              </div>
            </div>

            {/* Height dropdown */}
            <div>
              <div
                className="text-[8px] uppercase tracking-wider font-bold mb-1"
                style={{ color: "#64748b" }}
              >
                Height
              </div>
              <div
                className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs bg-white border-2"
                style={{ borderColor: "var(--brand)" }}
              >
                <span className="font-medium">5 ft</span>
                <span className="text-slate-400">▾</span>
              </div>
            </div>

            {/* Linear feet + post spacing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div
                  className="text-[8px] uppercase tracking-wider font-bold mb-1"
                  style={{ color: "#64748b" }}
                >
                  Linear ft
                </div>
                <div
                  className="px-2.5 py-2 rounded-md text-xs bg-white border-2 font-mono tabular-nums"
                  style={{ borderColor: "var(--line)" }}
                >
                  140
                </div>
              </div>
              <div>
                <div
                  className="text-[8px] uppercase tracking-wider font-bold mb-1"
                  style={{ color: "#64748b" }}
                >
                  Post space
                </div>
                <div
                  className="px-2.5 py-2 rounded-md text-xs bg-white border-2 font-mono tabular-nums"
                  style={{ borderColor: "var(--line)" }}
                >
                  6 ft
                </div>
              </div>
            </div>

            {/* Pool checkbox + warning */}
            <div className="flex items-center gap-2 text-[11px]">
              <div
                className="w-3 h-3 rounded border-2 flex items-center justify-center"
                style={{
                  borderColor: "var(--brand)",
                  background: "var(--brand)",
                }}
              >
                <span className="text-white text-[8px] leading-none">✓</span>
              </div>
              <span style={{ color: "var(--text-strong)" }}>
                Pool barrier (Miami-Dade)
              </span>
            </div>

            {/* Compliance note */}
            <div
              className="rounded-md px-2.5 py-1.5 text-[10px] border-l-2"
              style={{
                background: "#fff8d8",
                borderLeftColor: "#b27d00",
                color: "#4a3a00",
              }}
            >
              <strong>Heads up:</strong> Latch height ≥ 54" required (FBC R4501)
            </div>

            {/* Calculated lines */}
            <div
              className="rounded-md p-2.5 border"
              style={{ background: "white", borderColor: "var(--line)" }}
            >
              <div
                className="text-[8px] uppercase tracking-wider font-bold mb-1.5"
                style={{ color: "#64748b" }}
              >
                Calculated
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-strong)" }}>
                    Aluminum 5' × 140
                  </span>
                  <span className="font-mono tabular-nums">$7,280</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-strong)" }}>
                    Posts (25)
                  </span>
                  <span className="font-mono tabular-nums">$1,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-strong)" }}>Walk gate</span>
                  <span className="font-mono tabular-nums">$140</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky bottom — running total */}
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-3 border-t-2 z-10"
            style={{
              borderColor: "var(--ink)",
              background: "var(--paper)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="text-[8px] uppercase tracking-wider font-bold"
                  style={{ color: "#64748b" }}
                >
                  Running total
                </div>
                <div
                  className="tabular-nums"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 22,
                    lineHeight: 1,
                    color: "var(--ink)",
                  }}
                >
                  $9,009.40
                </div>
              </div>
              <div
                className="px-3 py-2 rounded-md text-white text-[11px] font-bold uppercase tracking-wider"
                style={{
                  background: "var(--brand)",
                  fontFamily: "var(--font-display)",
                  boxShadow: "2px 2px 0 var(--ink)",
                }}
              >
                Next →
              </div>
            </div>
            {/* Home indicator */}
            <div
              aria-hidden
              className="mx-auto mt-2 rounded-full"
              style={{
                width: 90,
                height: 4,
                background: "var(--ink)",
                opacity: 0.4,
              }}
            />
          </div>
        </div>
      </div>

      {/* Floating orange dot accent */}
      <div
        aria-hidden
        className="absolute -top-4 -right-4 w-12 h-12 rounded-full"
        style={{
          background: "var(--brand)",
          opacity: 0.15,
        }}
      />
      {/* Bottom accent dot */}
      <div
        aria-hidden
        className="absolute -bottom-2 -left-6 w-8 h-8 rounded-full"
        style={{
          background: "var(--brand)",
          opacity: 0.2,
        }}
      />
    </div>
  );
}
