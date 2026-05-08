// Intro section: cover card, visual system snapshot, screens map.

const IntroCover = () => (
  <div className="wf p-6" style={{ width: "100%", height: "100%", background: "var(--paper)" }}>
    <div className="row gap-4" style={{ alignItems: "flex-start", height: "100%" }}>
      <div className="col gap-3" style={{ flex: 1 }}>
        <div className="row gap-3" style={{ alignItems: "center" }}>
          <img src="assets/logo.png" alt="" style={{ width: 86, height: 86, borderRadius: 16, border: "1.5px solid var(--ink)" }} />
          <div className="col gap-1">
            <div className="display text-2xl">FenceQuotePros</div>
            <div className="text-md muted">Wireframe exploration · v1 · May 2026</div>
          </div>
        </div>
        <hr className="hr-sketch" />
        <div className="text-md" style={{ lineHeight: 1.4 }}>
          Low-fi wireframes across the 6 priority surfaces from <span className="bold">DESIGN_HANDOFF.md</span>.
          Each surface gets 3–4 directions. Goal: pick a direction per surface before committing to hi-fi.
        </div>
        <div className="col gap-2 p-3 box" style={{ background: "var(--paper-2)" }}>
          <div className="upper text-xs bold">What changed since the handoff doc</div>
          <ul className="text-sm" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
            <li>Logo exists now → <span className="bold">black + orange + white</span> brand, not teal.</li>
            <li>Wordmark is <span className="bold">FenceQuotePros</span> (plural Pros).</li>
            <li>Open question "color direction" → answered: orange / work-truck energy.</li>
          </ul>
        </div>
        <div className="col gap-2 p-3 box-accent box">
          <div className="upper text-xs bold accent">How to use this canvas</div>
          <div className="text-sm">
            Pan with drag, zoom with scroll. Click any artboard's <span className="mono">⤢</span> to focus.
            Drag the grip on a label to reorder. <span className="italic">Vote with comments — pick a letter per section.</span>
          </div>
        </div>
      </div>

      <div className="col gap-2" style={{ width: 280 }}>
        <div className="upper text-xs bold muted">Sections</div>
        {[
          ["01", "Logo & wordmark"],
          ["02", "/estimates/new (mobile)"],
          ["03", "Customer-facing estimate"],
          ["04", "Dashboard"],
          ["05", "Compliance warnings"],
          ["06", "Embed lead widget"],
        ].map(([n, t]) => (
          <div key={n} className="row gap-2 p-2 box" style={{ alignItems: "center" }}>
            <div className="display accent text-lg" style={{ width: 28 }}>{n}</div>
            <div className="text-md">{t}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Swatch = ({ name, hex, dark }) => (
  <div className="col gap-1" style={{ width: 88 }}>
    <div className="box" style={{ height: 56, background: hex, color: dark ? "#fff" : "var(--ink)" }} />
    <div className="text-sm bold">{name}</div>
    <div className="mono muted">{hex}</div>
  </div>
);

const IntroSystem = () => (
  <div className="wf p-6" style={{ width: "100%", height: "100%" }}>
    <div className="display text-2xl">Visual system — wireframe baseline</div>
    <div className="text-sm muted" style={{ marginBottom: 12 }}>
      Sketches use handwritten type + restraint. Hi-fi will replace these with the real palette below.
    </div>

    <div className="row gap-6" style={{ alignItems: "flex-start" }}>
      <div className="col gap-3" style={{ flex: 1 }}>
        <div className="upper text-xs bold muted">Brand palette (hi-fi target)</div>
        <div className="row gap-3" style={{ flexWrap: "wrap" }}>
          <Swatch name="Ink" hex="#1a1a1a" dark />
          <Swatch name="Paper" hex="#fbfaf6" />
          <Swatch name="Orange" hex="#ff6b1a" dark />
          <Swatch name="Soft orange" hex="#fff1e7" />
          <Swatch name="Danger" hex="#d83a00" dark />
          <Swatch name="Warn" hex="#f0b400" />
        </div>

        <div className="upper text-xs bold muted" style={{ marginTop: 10 }}>Type — wireframe vs hi-fi</div>
        <div className="row gap-4">
          <div className="col gap-1 box p-3" style={{ flex: 1 }}>
            <div className="text-xs muted">Wireframe (this canvas)</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 28, letterSpacing: ".005em" }}>Saira Condensed 800</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13 }}>Inter for body — same as hi-fi.</div>
          </div>
          <div className="col gap-1 box p-3" style={{ flex: 1 }}>
            <div className="text-xs muted">Hi-fi target — pairing matches the logo</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 28 }}>FENCE QUOTE PROS</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13 }}>Inter · 14px UI · tabular-nums for $</div>
          </div>
        </div>
      </div>

      <div className="col gap-2" style={{ width: 280 }}>
        <div className="upper text-xs bold muted">Wireframe primitives</div>
        <div className="row gap-2"><div className="btn">Secondary</div><div className="btn btn-primary">Primary</div></div>
        <div className="row gap-2">
          <span className="pill">Draft</span>
          <span className="pill pill-fill">Sent</span>
          <span className="pill pill-accent">Accepted</span>
          <span className="pill pill-warn">Pending</span>
        </div>
        <div className="field">Input field</div>
        <div className="field field-lg">Big numeric · 24"</div>
        <div className="placeholder" style={{ height: 60 }}>logo · 480 × 120</div>
        <div className="note">sticky note for annotations</div>
      </div>
    </div>
  </div>
);

const IntroMap = () => {
  const screens = [
    { route: "/", priority: "med", flow: "contractor" },
    { route: "/estimates", priority: "low", flow: "contractor" },
    { route: "/estimates/new", priority: "HIGH", flow: "contractor (mobile!)" },
    { route: "/estimates/[id]", priority: "HIGH", flow: "customer + print" },
    { route: "/estimates/[id]?lang=es", priority: "HIGH", flow: "customer ES" },
    { route: "/invoices", priority: "low", flow: "contractor" },
    { route: "/invoices/[id]", priority: "HIGH", flow: "customer + print" },
    { route: "/clients", priority: "low", flow: "contractor" },
    { route: "/clients/new · /[id] · /edit", priority: "low", flow: "contractor" },
    { route: "/embed/alldayfence-quote.html", priority: "med", flow: "homeowner" },
  ];
  return (
    <div className="wf p-6" style={{ width: "100%", height: "100%" }}>
      <div className="display text-2xl">Screens — priority map</div>
      <div className="text-sm muted" style={{ marginBottom: 12 }}>
        From the handoff doc. <span className="accent bold">Orange = high priority</span> — drives this exploration.
      </div>
      <div className="col gap-1">
        <div className="row gap-3 px-3 py-2 upper text-xs bold muted" style={{ borderBottom: "1.5px solid var(--ink)" }}>
          <div style={{ flex: 2 }}>Route</div>
          <div style={{ flex: 1 }}>Audience</div>
          <div style={{ width: 90 }}>Priority</div>
          <div style={{ width: 130 }}>In this exploration</div>
        </div>
        {screens.map((s) => (
          <div key={s.route} className="row gap-3 px-3 py-2 text-sm" style={{ borderBottom: "1px dashed var(--line)" }}>
            <div className="mono" style={{ flex: 2 }}>{s.route}</div>
            <div style={{ flex: 1 }}>{s.flow}</div>
            <div style={{ width: 90 }}>
              {s.priority === "HIGH"
                ? <span className="pill pill-accent" style={{ fontSize: 11 }}>HIGH</span>
                : s.priority === "med"
                ? <span className="pill" style={{ fontSize: 11 }}>med</span>
                : <span className="pill" style={{ fontSize: 11, opacity: .55 }}>low</span>}
            </div>
            <div className="text-xs muted" style={{ width: 130 }}>
              {s.priority === "HIGH" ? "✓ wireframed" : s.priority === "med" ? "✓ wireframed" : "deferred — current works"}
            </div>
          </div>
        ))}
      </div>
      <div className="note" style={{ marginTop: 16, display: "inline-block" }}>
        Lists & client CRUD deferred — current versions are functional. Reach back if you want them sketched.
      </div>
    </div>
  );
};

Object.assign(window, { IntroCover, IntroSystem, IntroMap });
