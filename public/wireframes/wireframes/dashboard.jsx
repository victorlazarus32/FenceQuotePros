// Dashboard — 4 directions. Desktop, ~960w.

const DashChrome = ({ children }) => (
  <div className="col" style={{ width: "100%", height: "100%", background: "var(--paper-2)" }}>
    <div className="row gap-3 p-3" style={{ background: "var(--paper)", borderBottom: "1.5px solid var(--ink)", alignItems: "center" }}>
      <img src="assets/logo.png" style={{ width: 28, height: 28, borderRadius: 6 }} />
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 18, letterSpacing: ".02em" }}>FENCEQUOTE<span className="accent">PROS</span></div>
      <div className="row gap-3" style={{ marginLeft: 24, fontSize: 14 }}>
        {["Dashboard","Estimates","Invoices","Clients"].map((t, i) => (
          <span key={t} className={i === 0 ? "bold" : "muted"}>{t}</span>
        ))}
      </div>
      <div className="grow" />
      <div className="pill text-xs">Allday Fence · Victor</div>
    </div>
    <div className="grow" style={{ overflow: "hidden", padding: 16 }}>{children}</div>
  </div>
);

const KPI = ({ label, value, delta, deltaUp = true }) => (
  <div className="box p-3 col gap-1" style={{ background: "var(--paper)", flex: 1 }}>
    <div className="text-xs upper muted bold">{label}</div>
    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 32, lineHeight: 1 }}>{value}</div>
    {delta && <div className="text-xs" style={{ color: deltaUp ? "var(--ok)" : "var(--danger)" }}>{deltaUp ? "▲" : "▼"} {delta}</div>}
  </div>
);

// A — KPI grid refined
const DashA = () => (
  <DashChrome>
    <div className="row between" style={{ alignItems: "center", marginBottom: 12 }}>
      <div className="display text-2xl">Tuesday morning, Victor</div>
      <div className="row gap-2">
        <div className="btn btn-sm">This week ▾</div>
        <div className="btn btn-sm btn-primary">＋ New estimate</div>
      </div>
    </div>
    <div className="row gap-3" style={{ marginBottom: 12 }}>
      <KPI label="Open estimates" value="14" delta="+3 vs last wk" />
      <KPI label="Win rate (30d)" value="62%" delta="+8 pts" />
      <KPI label="Outstanding $" value="$28.4k" delta="2 over 30 days" deltaUp={false} />
      <KPI label="Booked this wk" value="$12.1k" delta="3 jobs" />
    </div>
    <div className="row gap-3" style={{ height: 280 }}>
      <div className="box p-3 col gap-2 grow" style={{ background: "var(--paper)" }}>
        <div className="row between"><div className="upper text-xs bold">Recent estimates</div><div className="text-xs muted">view all →</div></div>
        {["EST-1014 · M. Hernandez · pool · $4.6k · sent",
          "EST-1013 · HOA Coral Ridge · $28.0k · draft",
          "EST-1012 · Garcia · privacy 80lf · $2.1k · accepted",
          "EST-1011 · Patel · ranch rail · $1.8k · expired"
        ].map((r, i) => (
          <div key={i} className="row between text-sm p-2" style={{ borderBottom: "1px dashed var(--line)" }}>
            <span>{r.split(" · ").slice(0,3).join(" · ")}</span>
            <span className="mono muted">{r.split(" · ")[3]}</span>
          </div>
        ))}
      </div>
      <div className="box p-3 col gap-2" style={{ background: "var(--paper)", width: 280 }}>
        <div className="upper text-xs bold">This week</div>
        <div className="placeholder" style={{ height: 90 }}>chart · estimates / wk · 8 wks</div>
        <div className="upper text-xs bold" style={{ marginTop: 6 }}>Needs follow-up</div>
        <div className="text-sm">↪ 2 estimates aged &gt; 14d</div>
        <div className="text-sm">↪ 1 invoice over 30d ($1,450)</div>
      </div>
    </div>
    <div className="note callout" style={{ top: 80, right: -10, width: 140 }}>
      Closest to today. Better hierarchy + first-name greeting.
    </div>
  </DashChrome>
);

// B — pipeline-first kanban
const DashB = () => {
  const cols = [
    ["Drafts", 6, ["EST-1013 · HOA $28k","EST-1015 · Lewis pool","EST-1018 · Vega 60lf"]],
    ["Sent", 5, ["EST-1014 · Hernandez $4.6k","EST-1010 · Suarez $7.1k","EST-1009 · Cruz priv."]],
    ["Accepted", 3, ["EST-1012 · Garcia $2.1k ✓","EST-1006 · Patel ✓","EST-1004 · Lopez ✓"]],
    ["Invoiced", 4, ["INV-2001 · Hernandez","INV-2003 · Garcia","INV-2004 · HOA dep."]],
    ["Paid", 8, ["INV-1999 · Cruz","INV-1998 · Lopez","INV-1997 · Diaz"]],
  ];
  return (
    <DashChrome>
      <div className="row between" style={{ alignItems: "center", marginBottom: 10 }}>
        <div className="display text-2xl">Pipeline</div>
        <div className="row gap-2">
          <div className="pill">$48.2k in flight</div>
          <div className="btn btn-sm btn-primary">＋ New estimate</div>
        </div>
      </div>
      <div className="row gap-2" style={{ height: 460 }}>
        {cols.map(([title, n, items]) => (
          <div key={title} className="col gap-2 grow" style={{ background: "var(--paper-2)", border: "1.5px dashed var(--line)", borderRadius: 6, padding: 8 }}>
            <div className="row between">
              <div className="bold text-sm">{title}</div>
              <div className="pill text-xs">{n}</div>
            </div>
            {items.map((it, i) => (
              <div key={i} className="box p-2 text-sm" style={{ background: "var(--paper)", boxShadow: "1px 1px 0 var(--ink)" }}>{it}</div>
            ))}
            <div className="text-xs muted center">+ {n - items.length} more</div>
          </div>
        ))}
      </div>
      <div className="note callout" style={{ top: 100, right: -10, width: 150 }}>
        Estimate is a deal, not a row. Drag to advance status.
      </div>
    </DashChrome>
  );
};

// C — Today feed + week chart
const DashC = () => (
  <DashChrome>
    <div className="row gap-4" style={{ height: "100%" }}>
      <div className="col gap-3 grow">
        <div className="display text-2xl">Today · Tue May 5</div>
        <div className="col gap-2">
          {[
            ["8:00", "Site visit · Lewis · pool barrier", "Coral Gables", "warn"],
            ["10:30","Crew install start · Garcia 80lf", "Kendall", "ok"],
            ["13:00","Call back · M. Hernandez (estimate sent 3d)", "—", "ink"],
            ["15:00","Pickup · permit office Miami-Dade", "—", "ink"],
          ].map(([t, what, where, kind], i) => (
            <div key={i} className="row gap-3 box p-3" style={{ background: "var(--paper)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 22, width: 60 }}>{t}</div>
              <div className="col grow">
                <div className="bold text-sm">{what}</div>
                <div className="text-xs muted">{where}</div>
              </div>
              <span className={"pill text-xs " + (kind === "warn" ? "pill-warn" : kind === "ok" ? "pill-accent" : "pill-fill")}>{kind === "warn" ? "follow-up" : kind === "ok" ? "go" : "todo"}</span>
            </div>
          ))}
        </div>
        <div className="upper text-xs bold muted" style={{ marginTop: 6 }}>Reminders</div>
        <div className="text-sm">↪ INV-2001 unpaid 32 days · text Maria</div>
        <div className="text-sm">↪ EST-1009 expires Friday</div>
      </div>
      <div className="col gap-3" style={{ width: 360 }}>
        <div className="box p-3 col gap-2" style={{ background: "var(--paper)" }}>
          <div className="upper text-xs bold">This week</div>
          <div className="row between"><span className="display text-2xl">$12.1k</span><span className="text-xs muted">booked</span></div>
          <div className="placeholder" style={{ height: 110 }}>bar chart · M T W T F · est sent vs accepted</div>
        </div>
        <div className="row gap-3">
          <KPI label="Open" value="14" />
          <KPI label="Win %" value="62" />
        </div>
        <div className="btn btn-primary center">＋ New estimate</div>
      </div>
    </div>
    <div className="note callout" style={{ top: 90, right: -10, width: 140 }}>
      Calendar-flavored. Where the day starts.
    </div>
  </DashChrome>
);

// D — Cash-flow hero
const DashD = () => (
  <DashChrome>
    <div className="row gap-4" style={{ height: "100%" }}>
      <div className="col gap-3 grow" style={{ background: "var(--ink)", color: "var(--paper)", padding: 20, borderRadius: 6, position: "relative" }}>
        <div className="upper text-xs" style={{ opacity: .7 }}>Cash position · May</div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 88, lineHeight: 1, color: "var(--accent)" }}>$28,460</div>
        <div className="text-sm" style={{ opacity: .8 }}>across 7 outstanding invoices · 2 over 30 days</div>
        <div className="placeholder" style={{ height: 130, background: "transparent", borderColor: "rgba(255,255,255,.3)", color: "rgba(255,255,255,.7)" }}>area chart · receivables · 60d</div>
        <div className="row gap-2" style={{ marginTop: "auto" }}>
          <div className="btn btn-sm" style={{ background: "var(--paper)", color: "var(--ink)" }}>Send reminder</div>
          <div className="btn btn-sm" style={{ background: "transparent", color: "var(--paper)", borderColor: "var(--paper)", boxShadow: "none" }}>Export A/R</div>
        </div>
      </div>
      <div className="col gap-3" style={{ width: 360 }}>
        <KPI label="Avg days to pay" value="18" delta="−4 vs last mo" />
        <KPI label="Win rate (30d)" value="62%" delta="+8 pts" />
        <KPI label="This week booked" value="$12.1k" delta="3 jobs" />
        <div className="box p-3" style={{ background: "var(--paper)" }}>
          <div className="upper text-xs bold">Top owed</div>
          <div className="text-sm">1. Coral Ridge HOA · $14,200 · 12d</div>
          <div className="text-sm">2. R. Suarez · $4,640 · 31d ⚠</div>
          <div className="text-sm">3. K. Patel · $1,820 · 33d ⚠</div>
        </div>
      </div>
    </div>
    <div className="note callout" style={{ top: 90, right: -10, width: 140 }}>
      Money front-and-center. For Marcelo at the desk.
    </div>
  </DashChrome>
);

Object.assign(window, { DashA, DashB, DashC, DashD });
