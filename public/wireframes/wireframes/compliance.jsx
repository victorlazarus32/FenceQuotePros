// Compliance warning treatments — 4 directions.
// Florida pool barrier + HVHZ. Authoritative without alarming.

const CompFrame = ({ title, children, note }) => (
  <div className="wf p-4 col gap-3" style={{ width: "100%", height: "100%", background: "var(--paper-2)" }}>
    <div className="upper text-xs bold muted">{title}</div>
    <div className="grow" style={{ background: "var(--paper)", border: "1.5px solid var(--ink)", borderRadius: 6, padding: 14 }}>{children}</div>
    {note && <div className="text-sm muted">{note}</div>}
  </div>
);

// A — inline pill on field
const CompA = () => (
  <CompFrame title="A · Inline pill on field"
    note="Subtlest. Sits next to the offending input. Quick to dismiss; no real-estate cost. Risk: easy to miss in glare.">
    <div className="col gap-3">
      <div className="text-xs upper muted bold">Fence height</div>
      <div className="row gap-2" style={{ alignItems: "center" }}>
        <div className="field" style={{ width: 90, fontSize: 22 }}>42"</div>
        <span className="pill pill-warn text-xs">⚠ Pool min 48" — FBC R4501</span>
      </div>
      <div className="text-xs muted">Pool-adjacent · Miami-Dade</div>
      <div className="hr-sketch" />
      <div className="text-xs upper muted bold">Latch</div>
      <div className="row gap-2" style={{ alignItems: "center" }}>
        <div className="field" style={{ flex: 1 }}>standard latch</div>
        <span className="pill pill-danger text-xs">✕ Self-closing required</span>
      </div>
    </div>
  </CompFrame>
);

// B — stacked banner card above field
const CompB = () => (
  <CompFrame title="B · Stacked banner card"
    note="One panel collects all flags. Best when there are 2+ issues. Could expand/collapse.">
    <div className="col gap-2">
      <div className="box p-3" style={{ borderColor: "var(--danger)", background: "#fff3ec", borderLeftWidth: 6 }}>
        <div className="row between">
          <div className="bold accent" style={{ color: "var(--danger)" }}>✕ 1 blocker</div>
          <span className="text-xs muted">Pool-adjacent · HVHZ</span>
        </div>
        <div className="text-sm" style={{ marginTop: 4 }}>Fence height 42" — FBC R4501.17.1.1 requires <span className="bold">48" min</span> on pool-barrier side.</div>
      </div>
      <div className="box p-3" style={{ borderColor: "#b27d00", background: "#fff8d8", borderLeftWidth: 6 }}>
        <div className="bold" style={{ color: "#7a5400" }}>⚠ 2 warnings</div>
        <div className="text-sm" style={{ marginTop: 4 }}>· Latch height &lt; 54" not specified · HVHZ wind load missing for 6'+ panels.</div>
      </div>
      <div className="row between text-xs muted">
        <span>1 blocker must be resolved before sending</span>
        <span className="pill text-xs">code reference ↗</span>
      </div>
    </div>
  </CompFrame>
);

// C — side rail w/ code reference
const CompC = () => (
  <CompFrame title="C · Side rail with code reference"
    note="Shows the actual statute. Maximum trust — Victor can show the homeowner why. Heavier visually.">
    <div className="row gap-3">
      <div className="col gap-2 grow">
        <div className="text-xs upper muted bold">Fence height</div>
        <div className="field" style={{ width: 100, fontSize: 22 }}>42"</div>
        <div className="text-xs upper muted bold" style={{ marginTop: 6 }}>Latch type</div>
        <div className="field">standard</div>
      </div>
      <div className="col gap-2" style={{ width: 220, background: "var(--ink)", color: "var(--paper)", padding: 12, borderRadius: 4 }}>
        <div className="row gap-2"><span className="pill pill-accent text-xs">CODE</span><span className="text-xs">FBC R4501</span></div>
        <div className="text-sm bold">Pool barrier — 48" min</div>
        <div className="text-xs" style={{ opacity: .8 }}>"The top of the barrier shall be at least 48 inches above grade…"</div>
        <div className="text-xs" style={{ opacity: .6 }}>§R4501.17.1.1 · Florida Building Code 2023</div>
        <div className="hr-sketch" style={{ borderColor: "rgba(255,255,255,.3)" }} />
        <div className="text-xs">Your spec: 42" · <span style={{ color: "var(--accent)" }}>−6"</span></div>
        <div className="btn btn-sm" style={{ background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }}>Bump to 48"</div>
      </div>
    </div>
  </CompFrame>
);

// D — blocking modal for hard violations
const CompD = () => (
  <CompFrame title="D · Hard-block modal"
    note="Reserved for truly illegal specs. Stops the send action. Not for soft warnings — friction is the point.">
    <div style={{ position: "relative", height: 280, background: "var(--paper-2)", border: "1.5px dashed var(--line)", borderRadius: 4 }}>
      {/* dimmed bg */}
      <div className="p-3" style={{ opacity: .35 }}>
        <div className="row between"><span className="text-sm">Fence calc</span><span className="btn btn-sm btn-primary">Send →</span></div>
        <div className="hr-sketch" />
        <div className="text-sm muted">5 line items · $4,635</div>
      </div>
      {/* modal */}
      <div className="box p-3 col gap-2" style={{ position: "absolute", top: 30, left: 30, right: 30, background: "var(--paper)", borderColor: "var(--danger)", borderWidth: 2.5, boxShadow: "4px 4px 0 var(--ink)" }}>
        <div className="row gap-2"><span className="pill pill-danger">CODE BLOCKER</span><span className="text-xs muted">FBC R4501.17</span></div>
        <div className="display text-xl">Hold up — pool fence is 42"</div>
        <div className="text-sm">Florida pool barriers must be 48" minimum. Sending this estimate could cost the customer permitting + you a callback.</div>
        <div className="row gap-2" style={{ marginTop: 4 }}>
          <div className="btn btn-sm grow center">Override (note required)</div>
          <div className="btn btn-sm btn-primary grow center">✓ Bump to 48" &amp; resend</div>
        </div>
      </div>
    </div>
  </CompFrame>
);

Object.assign(window, { CompA, CompB, CompC, CompD });
