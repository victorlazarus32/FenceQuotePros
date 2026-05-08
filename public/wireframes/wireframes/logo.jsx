// Logo / wordmark directions. Existing mark is option A — anchor.
// Companions explore different visual languages so user can decide
// whether to keep mark, evolve it, or mix-and-match wordmark.

const LogoCard = ({ children, label, note }) => (
  <div className="wf p-4 col gap-3" style={{ width: "100%", height: "100%" }}>
    <div className="upper text-xs bold muted">{label}</div>
    <div className="grow center" style={{ background: "var(--paper-2)", border: "1.5px dashed var(--line)", borderRadius: 4, padding: 16 }}>
      {children}
    </div>
    <div className="text-sm muted">{note}</div>
  </div>
);

// A — the existing mark
const LogoA = () => (
  <LogoCard
    label="A · Existing mark"
    note="Anchor. Use as-is in app chrome, document headers, and favicon. Pickets-as-bar-chart reads as 'fence' AND 'business growth' — strong dual meaning."
  >
    <div className="col gap-3 center">
      <img src="assets/logo.png" style={{ width: 180, height: 180, borderRadius: 30 }} alt="" />
      <div className="row gap-3" style={{ alignItems: "center" }}>
        <img src="assets/logo.png" style={{ width: 36, height: 36, borderRadius: 8 }} alt="" />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 26, letterSpacing: ".02em" }}>
          FENCE<span style={{ color: "var(--accent)" }}>QUOTE</span>PROS
        </div>
      </div>
      <div className="mono muted text-xs">app nav · email signature · invoice header</div>
    </div>
  </LogoCard>
);

// B — picket-letter monogram (pure typographic mark)
const LogoB = () => (
  <LogoCard
    label="B · Picket-letter monogram"
    note="Compact mark for square spaces. F + Q stacked as fence pickets. Strips imagery; relies on type. Cheaper to print mono."
  >
    <div className="col gap-3 center">
      <div style={{
        width: 160, height: 160, borderRadius: 24,
        background: "var(--ink)", color: "var(--accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 110, letterSpacing: "-.04em",
        position: "relative", border: "2px solid var(--ink)"
      }}>
        <span>FQ</span>
        <span style={{ position: "absolute", bottom: 14, fontSize: 20, color: "#fff", letterSpacing: ".15em" }}>—PROS—</span>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 26 }}>
        FENCE QUOTE <span style={{ color: "var(--accent)" }}>PROS</span>
      </div>
    </div>
  </LogoCard>
);

// C — stencil / work-truck wordmark
const LogoC = () => (
  <LogoCard
    label="C · Stencil wordmark"
    note="No icon. Just a confident, slab-stencil wordmark — reads as crew shirt / truck door. Pairs well with mark A as secondary lockup."
  >
    <div className="col gap-3 center">
      <div className="box" style={{ background: "var(--paper)", padding: "28px 32px", border: "3px solid var(--ink)" }}>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase",
          fontSize: 64, lineHeight: .9, letterSpacing: ".01em"
        }}>
          FENCE QUOTE<br />
          <span style={{ color: "var(--accent)" }}>PROS<sup style={{ fontSize: 22 }}>®</sup></span>
        </div>
      </div>
      <div className="text-xs mono muted">est. 2026 · Miami, FL</div>
    </div>
  </LogoCard>
);

// D — stamp / seal "PROS" badge
const LogoD = () => (
  <LogoCard
    label="D · Stamp / seal"
    note="A circular 'PROS' stamp — credentials/trust angle. Works as document watermark, sticker, business-card flip. Could replace 'ACCEPTED' watermark."
  >
    <div className="col gap-3 center">
      <div style={{
        width: 170, height: 170, borderRadius: "50%",
        background: "var(--accent)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", border: "4px double #fff",
        boxShadow: "0 0 0 4px var(--accent)"
      }}>
        <div className="col center">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 44, lineHeight: 1 }}>FQ</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 18, letterSpacing: ".25em", marginTop: 4 }}>PROS</div>
          <div style={{ fontSize: 9, marginTop: 6, fontFamily: "monospace", letterSpacing: ".1em" }}>★ EST · 2026 ★</div>
        </div>
      </div>
      <div className="text-sm muted">+ uses: invoice "PAID" stamp · welcome email · lawn sign</div>
    </div>
  </LogoCard>
);

Object.assign(window, { LogoA, LogoB, LogoC, LogoD });
