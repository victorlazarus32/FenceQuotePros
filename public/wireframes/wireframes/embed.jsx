// Embed lead-intake widget — 3 directions.

const EmbedFrame = ({ children, title, note, wide }) => (
  <div className="wf p-4 col gap-2" style={{ width: "100%", height: "100%", background: "var(--paper-2)" }}>
    <div className="upper text-xs bold muted">{title}</div>
    <div className="grow center" style={{ overflow: "hidden" }}>
      <div style={{ background: "#fff", border: "1.5px solid var(--ink)", borderRadius: 8, boxShadow: "3px 3px 0 var(--ink)", width: wide ? 540 : 340 }}>
        {children}
      </div>
    </div>
    <div className="text-sm muted">{note}</div>
  </div>
);

// A — compact single card
const EmbedA = () => (
  <EmbedFrame title="A · Compact card"
    note="Drops in any sidebar. One column, low decoration. Fastest path to lead capture.">
    <div className="col gap-3 p-4">
      <div className="row gap-2" style={{ alignItems: "center" }}>
        <img src="assets/logo.png" style={{ width: 36, height: 36, borderRadius: 8 }} />
        <div>
          <div className="bold">Free fence quote</div>
          <div className="text-xs muted">Allday Fence · Miami-Dade</div>
        </div>
      </div>
      <div className="hr-sketch" />
      <div className="col gap-2">
        <div className="field">Name</div>
        <div className="field">Phone or email</div>
        <div className="field">Property zip</div>
        <div className="field" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Fence type</span><span className="muted">▾</span>
        </div>
      </div>
      <div className="btn btn-primary center">Get my free quote →</div>
      <div className="text-xs muted center-text">No spam. Reply within 1 business day.</div>
    </div>
  </EmbedFrame>
);

// B — 3-step progressive
const EmbedB = () => (
  <EmbedFrame title="B · 3-step progressive"
    note="Lower bounce — first ask is just the fence. Email comes after they've invested.">
    <div className="col gap-3 p-4">
      <div className="row gap-1">
        {[1,2,3].map(n => (
          <div key={n} className="col gap-1 grow center">
            <div className="box" style={{ height: 6, width: "100%", background: n === 1 ? "var(--accent)" : "var(--paper-2)", borderColor: n === 1 ? "var(--accent)" : "var(--ink)" }} />
            <div className="text-xs muted">Step {n}</div>
          </div>
        ))}
      </div>
      <div className="display text-xl">What kind of fence?</div>
      <div className="col gap-2">
        {[["Wood privacy", "most popular"], ["Aluminum", "—"], ["Chain link", "—"], ["Vinyl / PVC", "—"], ["Not sure yet", "we'll help"]].map(([t, sub], i) => (
          <div key={t} className={"box p-3 row between" + (i === 0 ? " box-accent" : "")}>
            <div className="col"><div className="bold">{t}</div><div className="text-xs muted">{sub}</div></div>
            <div>{i === 0 ? "●" : "○"}</div>
          </div>
        ))}
      </div>
      <div className="row between">
        <span className="text-xs muted">step 1 of 3</span>
        <div className="btn btn-primary">Next →</div>
      </div>
    </div>
  </EmbedFrame>
);

// C — hero + form (full-bleed)
const EmbedC = () => (
  <EmbedFrame wide title="C · Hero + form"
    note="When the contractor wants the embed to BE the marketing-site hero. Strong first impression, more vertical space.">
    <div className="row" style={{ alignItems: "stretch" }}>
      <div className="col gap-3" style={{ flex: 1.1, padding: 20, background: "var(--ink)", color: "var(--paper)", borderRadius: "8px 0 0 8px" }}>
        <img src="assets/logo.png" style={{ width: 40, height: 40, borderRadius: 8 }} />
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 38, lineHeight: 1 }}>
          NEW FENCE,<br/>
          <span style={{ color: "var(--accent)" }}>QUOTED IN 24H.</span>
        </div>
        <div className="text-sm" style={{ opacity: .85 }}>Licensed Miami-Dade contractor · 11 yrs · over 1,400 fences installed.</div>
        <div className="col gap-1" style={{ marginTop: "auto" }}>
          <div className="text-xs upper" style={{ opacity: .7 }}>Trust</div>
          <div className="text-sm">★★★★★ 4.9 · 312 Google reviews</div>
          <div className="text-sm">Lic #CGC1521088 · insured</div>
        </div>
      </div>
      <div className="col gap-2" style={{ flex: 1, padding: 20 }}>
        <div className="bold">Get a free quote</div>
        <div className="field">Name</div>
        <div className="row gap-2"><div className="field grow">Phone</div><div className="field grow">Zip</div></div>
        <div className="field">Email</div>
        <div className="field" style={{ display: "flex", justifyContent: "space-between" }}><span>Fence type ▾</span></div>
        <div className="field" style={{ display: "flex", justifyContent: "space-between" }}><span>Approx linear feet ▾</span></div>
        <div className="btn btn-primary center" style={{ marginTop: 4 }}>Get my free quote →</div>
        <div className="text-xs muted center-text">No spam · We reply within 1 business day</div>
      </div>
    </div>
  </EmbedFrame>
);

Object.assign(window, { EmbedA, EmbedB, EmbedC });
