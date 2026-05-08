// /estimates/[id] — customer-facing estimate document. 4 directions.

const DocChrome = ({ children, status, watermark }) => (
  <div className="col gap-2" style={{ width: "100%", height: "100%" }}>
    {/* toolbar — no-print in real app */}
    <div className="row gap-2 between p-2" style={{ borderBottom: "1.5px dashed var(--line)" }}>
      <div className="text-sm muted">← All estimates</div>
      <div className="row gap-1">
        <span className="pill text-xs">EN / ES</span>
        <span className="pill text-xs">Send</span>
        <span className="pill text-xs">Convert →</span>
        <span className="pill pill-fill text-xs">⎙ Print</span>
      </div>
    </div>
    <div className="grow center" style={{ overflow: "hidden", padding: 8 }}>
      <div className="paper-doc" style={{ position: "relative", transform: "scale(.85)", transformOrigin: "top center" }}>
        {watermark && (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            transform: "rotate(-22deg)", fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase",
            fontSize: 200, color: watermark.color, opacity: .12,
            letterSpacing: ".04em", pointerEvents: "none", zIndex: 1
          }}>
            {watermark.text}
          </div>
        )}
        {status && (
          <div className="pill pill-accent" style={{ position: "absolute", top: 16, right: 16, zIndex: 3 }}>{status}</div>
        )}
        <div style={{ position: "relative", zIndex: 2, padding: 36 }}>{children}</div>
      </div>
    </div>
  </div>
);

const LineItems = () => (
  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-ui)", fontSize: 13 }}>
    <thead>
      <tr style={{ borderBottom: "1.5px solid var(--ink)" }}>
        <th style={{ textAlign: "left",  padding: "6px 4px" }}>Description</th>
        <th style={{ textAlign: "right", padding: "6px 4px", width: 50 }}>Qty</th>
        <th style={{ textAlign: "right", padding: "6px 4px", width: 80 }}>Unit</th>
        <th style={{ textAlign: "right", padding: "6px 4px", width: 90 }}>Total</th>
      </tr>
    </thead>
    <tbody>
      {[
        ["Aluminum fence, 5' tall — black", 180, "lf", "18.00", "3,240.00"],
        ["Posts, set in concrete", 24, "ea", "20.00", "480.00"],
        ["Gate, single 4' walk", 1, "ea", "350.00", "350.00"],
        ["Pool-barrier latch (FBC compliant)", 1, "ea", "85.00", "85.00"],
        ["Permit & inspection (Miami-Dade)", 1, "—", "180.00", "180.00"],
      ].map((r, i) => (
        <tr key={i} style={{ borderBottom: "1px dashed var(--line)" }}>
          <td style={{ padding: "5px 4px" }}>{r[0]}</td>
          <td style={{ padding: "5px 4px", textAlign: "right", fontFamily: "JetBrains Mono, monospace" }}>{r[1]}{" "}{r[2] !== "—" ? r[2] : ""}</td>
          <td style={{ padding: "5px 4px", textAlign: "right", fontFamily: "JetBrains Mono, monospace" }}>${r[3]}</td>
          <td style={{ padding: "5px 4px", textAlign: "right", fontFamily: "JetBrains Mono, monospace" }}>${r[4]}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Totals = () => (
  <div className="col" style={{ width: 260, marginLeft: "auto", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
    <div className="row between"><span style={{ fontFamily: "var(--font-ui)" }}>Subtotal</span><span>$4,335.00</span></div>
    <div className="row between"><span style={{ fontFamily: "var(--font-ui)" }}>Tax 7%</span><span>$  303.45</span></div>
    <div className="hr-sketch" style={{ margin: "6px 0" }} />
    <div className="row between" style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 22 }}>
      <span>TOTAL</span><span>$4,638.45</span>
    </div>
  </div>
);

// A — classic invoice, refined (close to current)
const DocA = () => (
  <DocChrome>
    <div className="row between" style={{ alignItems: "flex-start" }}>
      <div className="row gap-3" style={{ alignItems: "center" }}>
        <img src="assets/logo.png" alt="" style={{ width: 56, height: 56, borderRadius: 10 }} />
        <div className="col">
          <div className="display text-xl">Allday Fence Co.</div>
          <div className="text-sm muted">8420 NW 27th Ave · Miami, FL 33147</div>
          <div className="text-sm muted">(305) 555-0140 · hello@alldayfence.com · Lic #CGC1521088</div>
        </div>
      </div>
      <div className="col right">
        <div className="display text-2xl">ESTIMATE</div>
        <div className="mono text-sm">EST-1001</div>
        <div className="pill pill-accent text-xs" style={{ alignSelf: "flex-end", marginTop: 4 }}>SENT</div>
      </div>
    </div>
    <div className="hr-sketch" />
    <div className="row gap-6">
      <div className="col grow"><div className="text-xs upper muted bold">Bill to</div>
        <div>Maria Hernandez</div><div className="text-sm muted">2210 SW 19th St · Miami, FL 33145</div></div>
      <div className="col"><div className="text-xs upper muted bold">Issued</div><div className="mono">May 3, 2026</div></div>
      <div className="col"><div className="text-xs upper muted bold">Expires</div><div className="mono">Jun 2, 2026</div></div>
    </div>
    <div className="hr-sketch" />
    <LineItems />
    <div style={{ marginTop: 16 }}><Totals /></div>
    <div className="hr-sketch" />
    <div className="row gap-4">
      <div className="col grow"><div className="text-xs upper muted bold">Notes</div>
        <div className="text-sm">Pool-barrier compliant per FBC R4501. Removal of existing chain link included.</div></div>
      <div className="col grow"><div className="text-xs upper muted bold">Terms</div>
        <div className="text-sm">50% deposit. Balance on completion. Valid 30 days.</div></div>
    </div>
  </DocChrome>
);

// B — banded header + signature block
const DocB = () => (
  <DocChrome>
    <div className="row gap-3" style={{ alignItems: "center", background: "var(--ink)", color: "var(--paper)", padding: 18, margin: -36, marginBottom: 18 }}>
      <img src="assets/logo.png" alt="" style={{ width: 56, height: 56, borderRadius: 10, background: "#fff" }} />
      <div className="col grow">
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 24 }}>ALLDAY FENCE CO.</div>
        <div className="text-xs" style={{ opacity: .7 }}>Miami-Dade · Lic #CGC1521088 · alldayfence.com</div>
      </div>
      <div className="col right">
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 28, color: "var(--accent)" }}>ESTIMATE</div>
        <div className="mono text-sm">EST-1001 · 05/03/26</div>
      </div>
    </div>
    <div className="row gap-6">
      <div className="col grow"><div className="text-xs upper muted bold">For</div>
        <div className="bold">Maria Hernandez</div><div className="text-sm muted">2210 SW 19th St · Miami</div></div>
      <div className="col"><div className="text-xs upper muted bold">Job</div><div>Pool barrier · 180 lf</div></div>
      <div className="col"><div className="text-xs upper muted bold">Valid until</div><div className="mono">Jun 2 '26</div></div>
    </div>
    <div className="hr-sketch" />
    <LineItems />
    <div style={{ marginTop: 16 }}><Totals /></div>
    <div style={{ marginTop: 24, padding: 14, border: "1.5px solid var(--ink)", background: "var(--paper-2)" }}>
      <div className="text-xs upper bold">Approve this estimate</div>
      <div className="text-sm muted">Sign below or click Accept to start scheduling.</div>
      <div className="row gap-3" style={{ marginTop: 12 }}>
        <div className="col grow">
          <div style={{ height: 44, borderBottom: "1.5px solid var(--ink)", fontFamily: "Caveat", fontSize: 24, color: "var(--ink-2)", paddingLeft: 4 }}>x</div>
          <div className="text-xs muted">Signature</div>
        </div>
        <div className="col" style={{ width: 140 }}>
          <div style={{ height: 44, borderBottom: "1.5px solid var(--ink)" }} />
          <div className="text-xs muted">Date</div>
        </div>
      </div>
      <div className="row gap-2" style={{ marginTop: 12 }}>
        <div className="btn btn-sm grow center">Decline</div>
        <div className="btn btn-sm btn-primary grow center">✓ Accept &amp; schedule</div>
      </div>
    </div>
  </DocChrome>
);

// C — modern split — sidebar totals
const DocC = () => (
  <DocChrome>
    <div className="row gap-4" style={{ alignItems: "stretch" }}>
      <div className="col grow gap-3">
        <div className="row gap-2" style={{ alignItems: "center" }}>
          <img src="assets/logo.png" alt="" style={{ width: 44, height: 44, borderRadius: 8 }} />
          <div className="col">
            <div className="bold">Allday Fence Co.</div>
            <div className="text-xs muted">Lic #CGC1521088 · Miami-Dade</div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 36, lineHeight: 1 }}>
          ESTIMATE FOR<br/>
          <span style={{ color: "var(--accent)" }}>MARIA HERNANDEZ</span>
        </div>
        <div className="text-sm muted">2210 SW 19th St, Miami · pool-barrier replacement, 180 lf aluminum</div>
        <div className="hr-sketch" />
        <LineItems />
        <div style={{ marginTop: 12 }} className="col gap-1">
          <div className="text-xs upper muted bold">Notes</div>
          <div className="text-sm">Removal of existing chain-link included. Pool latch height meets FBC R4501.17.1.4.</div>
          <div className="text-xs upper muted bold" style={{ marginTop: 8 }}>Terms</div>
          <div className="text-sm">50% deposit on accept · Balance on completion · 30-day validity</div>
        </div>
      </div>
      <div className="col gap-3" style={{ width: 220, padding: 16, background: "var(--ink)", color: "var(--paper)", marginTop: -36, marginRight: -36, marginBottom: -36 }}>
        <div className="col">
          <div className="text-xs upper" style={{ opacity: .7 }}>Estimate</div>
          <div className="mono">EST-1001</div>
        </div>
        <div className="col">
          <div className="text-xs upper" style={{ opacity: .7 }}>Issued</div>
          <div className="mono text-sm">May 3, 2026</div>
        </div>
        <div className="col">
          <div className="text-xs upper" style={{ opacity: .7 }}>Expires</div>
          <div className="mono text-sm">Jun 2, 2026</div>
        </div>
        <div style={{ borderTop: "1px dashed var(--paper)", paddingTop: 10 }}>
          <div className="text-xs upper" style={{ opacity: .7 }}>Subtotal</div>
          <div className="mono text-sm">$4,335.00</div>
          <div className="text-xs upper" style={{ opacity: .7, marginTop: 4 }}>Tax</div>
          <div className="mono text-sm">$303.45</div>
        </div>
        <div>
          <div className="text-xs upper" style={{ opacity: .7 }}>Total</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 32, color: "var(--accent)" }}>$4,638.45</div>
        </div>
        <div style={{ marginTop: "auto" }} className="col gap-2">
          <div className="btn btn-sm" style={{ background: "var(--paper)" }}>Decline</div>
          <div className="btn btn-sm btn-primary" style={{ background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }}>✓ Accept</div>
        </div>
      </div>
    </div>
  </DocChrome>
);

// D — watermarked status (DRAFT / ACCEPTED)
const DocD = () => (
  <DocChrome watermark={{ text: "ACCEPTED", color: "var(--accent)" }}>
    <div className="row between" style={{ alignItems: "flex-start" }}>
      <div className="row gap-3" style={{ alignItems: "center" }}>
        <img src="assets/logo.png" alt="" style={{ width: 56, height: 56, borderRadius: 10 }} />
        <div className="col">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 22 }}>ALLDAY FENCE CO.</div>
          <div className="text-sm muted">Miami-Dade · Lic #CGC1521088</div>
        </div>
      </div>
      <div className="col right">
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 28 }}>ESTIMATE</div>
        <div className="mono text-sm">EST-1001 · accepted 05/04/26</div>
      </div>
    </div>
    <div className="hr-sketch" />
    <div className="row gap-6">
      <div className="col grow"><div className="text-xs upper muted bold">Bill to</div><div>Maria Hernandez · 2210 SW 19th St</div></div>
      <div className="col"><div className="text-xs upper muted bold">Issued</div><div className="mono">May 3, 2026</div></div>
      <div className="col"><div className="text-xs upper muted bold">Accepted</div><div className="mono">May 4, 2026</div></div>
    </div>
    <div className="hr-sketch" />
    <LineItems />
    <div style={{ marginTop: 16 }}><Totals /></div>
    <div className="hr-sketch" />
    <div className="row gap-4">
      <div className="col grow"><div className="text-xs upper muted bold">Notes</div>
        <div className="text-sm">Accepted by M. Hernandez via email confirmation.</div></div>
      <div className="col grow"><div className="text-xs upper muted bold">Next</div>
        <div className="text-sm">→ Convert to invoice · Schedule install Wk of May 12</div></div>
    </div>
    <div className="note callout" style={{ top: 30, right: -110, width: 140 }}>
      Status as ghost watermark — instant skim. Toggle: DRAFT · SENT · ACCEPTED · DECLINED · EXPIRED · VOID
    </div>
  </DocChrome>
);

Object.assign(window, { DocA, DocB, DocC, DocD });
