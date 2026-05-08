// /estimates/new — mobile fence calculator. 4 flow models.
// Phone shell shared across all four.

const PhoneNav = ({ title }) => (
  <div className="row p-3 gap-2" style={{ alignItems: "center", borderBottom: "1.5px solid var(--ink)", background: "var(--paper)" }}>
    <div className="text-lg">←</div>
    <div className="grow text-md bold">{title}</div>
    <div className="pickets"><i/><i/><i/><i/><i/></div>
  </div>
);

const FieldRow = ({ label, value, hint }) => (
  <div className="col gap-1">
    <div className="text-xs muted upper bold">{label}</div>
    <div className="field" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span>{value}</span>
      {hint && <span className="text-xs muted">{hint}</span>}
    </div>
  </div>
);

// A — single scrolling page (today's pattern, refined)
const NewEstA = () => (
  <div className="phone">
    <div className="phone-notch" />
    <div className="phone-screen col" style={{ height: "100%" }}>
      <PhoneNav title="New estimate" />
      <div className="col gap-3 p-3" style={{ overflow: "hidden", flex: 1 }}>
        <div className="col gap-1">
          <div className="text-xs muted upper bold">Client</div>
          <div className="field" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Maria Hernandez</span><span className="muted">▾</span>
          </div>
        </div>
        <div className="box p-3 col gap-2" style={{ background: "var(--paper-2)" }}>
          <div className="upper text-xs bold">⛓ Fence calculator</div>
          <div className="row gap-2">
            <div className="grow"><FieldRow label="Type" value="Aluminum" /></div>
            <div style={{ width: 90 }}><FieldRow label="Height" value='5"' /></div>
          </div>
          <div className="row gap-2">
            <div className="grow"><FieldRow label="Linear ft" value="180" /></div>
            <div style={{ width: 90 }}><FieldRow label="Posts" value="8' OC" /></div>
          </div>
          <div className="row gap-2">
            <span className="pill" style={{ fontSize: 11 }}>☐ Tear-out</span>
            <span className="pill pill-warn" style={{ fontSize: 11 }}>☑ Pool-adj.</span>
            <span className="pill" style={{ fontSize: 11 }}>☐ HVHZ</span>
          </div>
          <div className="box-accent box p-2 text-sm">
            ⚠ Pool barrier — height min <span className="bold">48"</span> per FBC R4501
          </div>
        </div>

        <div className="col gap-1">
          <div className="text-xs muted upper bold">Calculated lines (preview)</div>
          <div className="box p-2 text-sm col gap-1">
            <div className="row between"><span>Aluminum 5' × 180lf</span><span className="mono">$3,240.00</span></div>
            <div className="row between"><span>Posts (24)</span><span className="mono">$ 480.00</span></div>
            <div className="row between"><span>Gate, single 4'</span><span className="mono">$ 350.00</span></div>
          </div>
        </div>

        <div className="col gap-1">
          <div className="text-xs muted upper bold">Add line item</div>
          <div className="row gap-2">
            <div className="field grow">+ Permit fee</div>
            <div className="btn btn-sm">＋</div>
          </div>
        </div>

        <div className="box p-3 col gap-1" style={{ marginTop: "auto" }}>
          <div className="row between text-sm"><span>Subtotal</span><span className="mono">$4,070.00</span></div>
          <div className="row between text-sm"><span>Tax (7%)</span><span className="mono">$  284.90</span></div>
          <div className="row between text-lg bold"><span>Total</span><span className="mono">$4,354.90</span></div>
        </div>
      </div>
      <div className="row gap-2 p-3" style={{ borderTop: "1.5px solid var(--ink)" }}>
        <div className="btn grow">Save draft</div>
        <div className="btn btn-primary grow">Send →</div>
      </div>
    </div>
    <div className="note callout" style={{ top: 60, right: -110, width: 140 }}>
      Refines today's flow.<br/>Same shape, tighter.
    </div>
  </div>
);

// B — step wizard with sticky total
const NewEstB = () => (
  <div className="phone">
    <div className="phone-notch" />
    <div className="phone-screen col" style={{ height: "100%" }}>
      <PhoneNav title="New estimate · 2/4" />
      <div className="row gap-1 px-3 py-2" style={{ borderBottom: "1.5px solid var(--ink)" }}>
        {["Client", "Fence", "Lines", "Send"].map((s, i) => (
          <div key={s} className="col gap-1 grow center" style={{ opacity: i === 1 ? 1 : .55 }}>
            <div className="box" style={{ height: 6, width: "100%", background: i <= 1 ? "var(--accent)" : "var(--paper-2)", borderColor: i <= 1 ? "var(--accent)" : "var(--ink)" }} />
            <div className="text-xs">{s}</div>
          </div>
        ))}
      </div>
      <div className="col gap-3 p-3" style={{ flex: 1, overflow: "hidden" }}>
        <div className="display text-xl">What kind of fence?</div>
        <div className="col gap-2">
          {[["⛓ Chain link","$9–$18 / lf"], ["▮ Wood privacy","$22–$36"], ["▤ Aluminum","$32–$54"], ["▥ Vinyl","$28–$45"]].map(([t, p], i) => (
            <div key={t} className={"box p-3 row between" + (i === 2 ? " box-accent" : "")} style={{ alignItems: "center" }}>
              <div className="col"><div className="bold text-md">{t}</div><div className="text-xs muted">{p}</div></div>
              <div className="text-lg">{i === 2 ? "●" : "○"}</div>
            </div>
          ))}
        </div>
        <div className="col gap-1" style={{ marginTop: "auto" }}>
          <div className="text-xs muted upper bold">Height</div>
          <div className="row gap-2">
            {["3'","4'","5'","6'","8'"].map((h, i) => (
              <div key={h} className={"box grow center" + (i === 2 ? " box-accent" : "")} style={{ height: 56, fontSize: 22 }}>{h}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="col gap-1 p-3" style={{ borderTop: "2px solid var(--ink)", background: "var(--paper-2)" }}>
        <div className="row between text-xs"><span className="muted upper bold">Running total</span><span className="muted">~estimate</span></div>
        <div className="row between"><span className="display text-2xl">$4,354</span>
          <div className="row gap-2"><div className="btn btn-sm">←</div><div className="btn btn-sm btn-primary">Next →</div></div>
        </div>
      </div>
    </div>
    <div className="note callout right" style={{ top: 80, right: -100, width: 130 }}>
      One decision per screen. Big tap targets.
    </div>
  </div>
);

// C — calculator-first, line items second
const NewEstC = () => (
  <div className="phone">
    <div className="phone-notch" />
    <div className="phone-screen col" style={{ height: "100%" }}>
      <PhoneNav title="Calc → est." />
      <div className="col gap-2 p-3" style={{ flex: 1, overflow: "hidden" }}>
        <div className="display text-xl">Linear feet</div>
        <div className="field field-xl center-text" style={{ fontSize: 56, fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase" }}>180</div>
        <div className="row gap-2">
          {[10,25,50,"−1","+1","100"].map((n, i) => (
            <div key={i} className={"box grow center" + (typeof n === "string" ? " box-accent" : "")} style={{ height: 44 }}>{typeof n === "number" ? "+" + n : n}</div>
          ))}
        </div>
        <div className="row gap-2">
          <div className="col gap-1 grow"><div className="text-xs muted upper bold">Type</div><div className="field">Aluminum 5'</div></div>
          <div className="col gap-1 grow"><div className="text-xs muted upper bold">Posts</div><div className="field">8' OC</div></div>
        </div>
        <div className="box p-2" style={{ background: "var(--paper-2)" }}>
          <div className="text-xs muted upper bold">→ generates</div>
          <div className="text-sm">3 line items · $4,070 + tax</div>
          <div className="row gap-1" style={{ marginTop: 4 }}>
            <span className="pill" style={{ fontSize: 11 }}>edit lines</span>
            <span className="pill" style={{ fontSize: 11 }}>+ adder</span>
          </div>
        </div>

        <div className="display text-md" style={{ marginTop: 6 }}>Then add:</div>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          {["Permit","Demo","Travel","Stain","Concrete","Custom…"].map((c) => (
            <span key={c} className="pill">＋ {c}</span>
          ))}
        </div>
      </div>
      <div className="col p-3 row between" style={{ borderTop: "2px solid var(--ink)", background: "var(--ink)", color: "var(--paper)" }}>
        <div className="col"><div className="text-xs muted">Total</div><div className="display text-2xl" style={{ color: "var(--paper)" }}>$4,354.90</div></div>
        <div className="btn btn-primary">Continue →</div>
      </div>
    </div>
    <div className="note callout" style={{ top: 60, right: -110, width: 140 }}>
      The number IS the UI. Calc on top, lines fall out below.
    </div>
  </div>
);

// D — conversational / chip-driven
const NewEstD = () => (
  <div className="phone">
    <div className="phone-notch" />
    <div className="phone-screen col" style={{ height: "100%" }}>
      <PhoneNav title="Quick quote" />
      <div className="col gap-3 p-3" style={{ flex: 1, overflow: "hidden" }}>
        <div className="row gap-2"><div className="pickets" style={{ height: 22 }}><i/><i/><i/><i/><i/></div><div className="display text-md">Hey Victor — let's build it.</div></div>

        <div className="box p-2 text-sm">For who?</div>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <div className="box-accent box p-2 text-sm" style={{ borderRadius: "12px 12px 4px 12px" }}>Maria Hernandez ✓</div>
        </div>

        <div className="box p-2 text-sm">Pick a fence:</div>
        <div className="row gap-1" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
          {["Chain link","Wood","Aluminum 5'","Vinyl","Custom"].map((c, i) => (
            <span key={c} className={"pill" + (i === 2 ? " pill-accent" : "")} style={{ fontSize: 12 }}>{c}</span>
          ))}
        </div>

        <div className="box p-2 text-sm">How much fence? (linear ft)</div>
        <div className="row gap-1" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
          {["50","100","150","180","200+"].map((n, i) => (
            <span key={n} className={"pill" + (i === 3 ? " pill-accent" : "")} style={{ fontSize: 12 }}>{n}</span>
          ))}
        </div>

        <div className="box p-2 text-sm">Anything special?</div>
        <div className="row gap-1" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
          {["Pool ✓","HVHZ","Tear-out","Permit","Stain","No"].map((n, i) => (
            <span key={n} className={"pill" + (i === 0 ? " pill-warn" : "")} style={{ fontSize: 12 }}>{n}</span>
          ))}
        </div>

        <div className="box-accent box p-3" style={{ marginTop: "auto" }}>
          <div className="text-xs muted upper bold">Estimate ready</div>
          <div className="display text-xl">$4,354.90 · 5 lines</div>
          <div className="row gap-2" style={{ marginTop: 6 }}>
            <div className="btn btn-sm">Edit</div>
            <div className="btn btn-sm btn-primary grow center">Send to Maria →</div>
          </div>
        </div>
      </div>
    </div>
    <div className="note callout" style={{ top: 60, right: -120, width: 150 }}>
      Riskier — but feels new. Works one-handed.
    </div>
  </div>
);

Object.assign(window, { NewEstA, NewEstB, NewEstC, NewEstD });
