// Architectural site-plan visual for the Smart Estimating section.
// Top-down lot view with property line, house footprint, fence runs in
// brand orange, post marks, a gate with swing arc, dimension callouts,
// a material takeoff stamp, a north arrow, and a scale bar — i.e. the
// document a contractor would hand a permit office.
//
// Pure SVG, no client state. currentColor inherits from the parent so
// the section background controls neutral lines; the brand orange is
// hardcoded so it pops on dark.

const BRAND = "#ff6b1a";

export default function FenceBlueprintPlan() {
  return (
    <div className="relative">
      <CornerTicks />
      <div className="bg-ink/50 border border-paper/15 p-4 sm:p-5">
        {/* Sheet header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
            <span className="w-1.5 h-1.5 bg-brand" />
            Site plan · EST-1042
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
            Sanchez residence
          </span>
        </div>

        <svg
          viewBox="0 0 480 340"
          className="w-full h-auto block"
          aria-hidden="true"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Property line — dashed lot boundary */}
          <rect
            x="20"
            y="20"
            width="440"
            height="300"
            stroke="#ffffff"
            strokeOpacity="0.18"
            strokeWidth="0.5"
            strokeDasharray="3 4"
          />

          {/* House footprint */}
          <rect
            x="160"
            y="120"
            width="160"
            height="120"
            stroke="#ffffff"
            strokeOpacity="0.3"
            strokeWidth="0.6"
            fill="#ffffff"
            fillOpacity="0.05"
          />
          <text
            x="240"
            y="184"
            textAnchor="middle"
            fill="#ffffff"
            fillOpacity="0.55"
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            letterSpacing="2"
          >
            HOUSE
          </text>
          <text
            x="240"
            y="200"
            textAnchor="middle"
            fill="#ffffff"
            fillOpacity="0.3"
            fontFamily="ui-monospace, monospace"
            fontSize="7"
            letterSpacing="2"
          >
            4502 SW 92ND AVE
          </text>

          {/* Driveway — paved area between house and right property line */}
          <rect
            x="320"
            y="160"
            width="140"
            height="60"
            stroke="#ffffff"
            strokeOpacity="0.18"
            strokeWidth="0.4"
            strokeDasharray="2 3"
          />
          <text
            x="390"
            y="194"
            textAnchor="middle"
            fill="#ffffff"
            fillOpacity="0.3"
            fontFamily="ui-monospace, monospace"
            fontSize="7"
            letterSpacing="2"
          >
            DRIVE
          </text>

          {/* ── TOP FENCE RUN — 80 LF ───────────────── */}
          <line x1="20" y1="20" x2="460" y2="20" stroke={BRAND} strokeWidth="2" />
          {/* Posts along top run (every 40 units = ~7 ft scale) */}
          {[60, 100, 140, 180, 220, 260, 300, 340, 380, 420].map((x) => (
            <rect
              key={`tp${x}`}
              x={x - 1.5}
              y="17"
              width="3"
              height="6"
              fill={BRAND}
            />
          ))}
          {/* Dimension callout above top run */}
          <line x1="60" y1="46" x2="420" y2="46" stroke={BRAND} strokeOpacity="0.7" strokeWidth="0.5" />
          <line x1="60" y1="42" x2="60" y2="50" stroke={BRAND} strokeOpacity="0.7" strokeWidth="0.6" />
          <line x1="420" y1="42" x2="420" y2="50" stroke={BRAND} strokeOpacity="0.7" strokeWidth="0.6" />
          <rect x="222" y="38" width="36" height="12" fill="#1f2937" stroke="none" />
          <text
            x="240"
            y="47"
            textAnchor="middle"
            fill={BRAND}
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            letterSpacing="1.5"
          >
            80 LF
          </text>

          {/* ── LEFT FENCE RUN — 50 LF ────────────── */}
          <line x1="20" y1="20" x2="20" y2="320" stroke={BRAND} strokeWidth="2" />
          {[60, 100, 140, 180, 220, 260, 300].map((y) => (
            <rect
              key={`lp${y}`}
              x="17"
              y={y - 1.5}
              width="6"
              height="3"
              fill={BRAND}
            />
          ))}
          {/* Dimension callout left of run */}
          <line x1="46" y1="60" x2="46" y2="280" stroke={BRAND} strokeOpacity="0.7" strokeWidth="0.5" />
          <line x1="42" y1="60" x2="50" y2="60" stroke={BRAND} strokeOpacity="0.7" strokeWidth="0.6" />
          <line x1="42" y1="280" x2="50" y2="280" stroke={BRAND} strokeOpacity="0.7" strokeWidth="0.6" />
          <rect x="36" y="164" width="20" height="12" fill="#1f2937" stroke="none" />
          <text
            x="46"
            y="173"
            textAnchor="middle"
            fill={BRAND}
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            letterSpacing="1.5"
            transform="rotate(-90 46 170)"
          >
            50 LF
          </text>

          {/* ── BOTTOM-LEFT FENCE RUN ──────────────── */}
          <line x1="20" y1="320" x2="200" y2="320" stroke={BRAND} strokeWidth="2" />
          {[60, 100, 140, 180].map((x) => (
            <rect
              key={`blp${x}`}
              x={x - 1.5}
              y="317"
              width="3"
              height="6"
              fill={BRAND}
            />
          ))}

          {/* GATE break + swing arc */}
          <line
            x1="200"
            y1="320"
            x2="260"
            y2="320"
            stroke={BRAND}
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <path
            d="M 200 320 A 60 60 0 0 1 260 320"
            stroke={BRAND}
            strokeOpacity="0.6"
            strokeWidth="0.7"
            strokeDasharray="2 2"
          />
          {/* Hinge dot */}
          <circle cx="200" cy="320" r="2.5" fill={BRAND} />
          {/* Open-gate position (perpendicular to run) */}
          <line x1="200" y1="320" x2="200" y2="260" stroke={BRAND} strokeOpacity="0.5" strokeWidth="1.2" />
          <text
            x="230"
            y="338"
            textAnchor="middle"
            fill={BRAND}
            fillOpacity="0.85"
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            letterSpacing="2"
          >
            GATE · 5′
          </text>

          {/* ── BOTTOM-RIGHT FENCE RUN ──────────────── */}
          <line x1="260" y1="320" x2="460" y2="320" stroke={BRAND} strokeWidth="2" />
          {[300, 340, 380, 420].map((x) => (
            <rect
              key={`brp${x}`}
              x={x - 1.5}
              y="317"
              width="3"
              height="6"
              fill={BRAND}
            />
          ))}

          {/* Corner-post emphasis (NW, NE, SW, SE-of-fence corners) */}
          {[
            [20, 20],
            [460, 20],
            [20, 320],
            [460, 320],
          ].map(([cx, cy]) => (
            <rect
              key={`c${cx}-${cy}`}
              x={cx - 3}
              y={cy - 3}
              width="6"
              height="6"
              fill={BRAND}
            />
          ))}

          {/* ── MATERIAL TAKEOFF STAMP (upper-right interior, no-fence side) */}
          <g transform="translate(346, 56)">
            <rect
              x="0"
              y="0"
              width="100"
              height="56"
              fill="#0f172a"
              fillOpacity="0.85"
              stroke={BRAND}
              strokeWidth="0.7"
            />
            <text
              x="6"
              y="11"
              fill={BRAND}
              fontFamily="ui-monospace, monospace"
              fontSize="7"
              letterSpacing="1.8"
            >
              MATERIAL TAKEOFF
            </text>
            <line x1="0" y1="16" x2="100" y2="16" stroke={BRAND} strokeOpacity="0.4" strokeWidth="0.4" />
            <text x="6" y="27" fill="#ffffff" fillOpacity="0.85" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="1.2">
              164 LF
            </text>
            <text x="6" y="38" fill="#ffffff" fillOpacity="0.85" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="1.2">
              22 POSTS
            </text>
            <text x="6" y="49" fill="#ffffff" fillOpacity="0.85" fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="1.2">
              48 BAGS
            </text>
          </g>

          {/* North arrow (lower-left interior) */}
          <g transform="translate(48, 296)">
            <circle cx="0" cy="0" r="11" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.5" />
            <path d="M 0 -8 L -3 1 L 0 -2 L 3 1 Z" fill={BRAND} />
            <text
              x="0"
              y="9"
              textAnchor="middle"
              fill="#ffffff"
              fillOpacity="0.7"
              fontFamily="ui-monospace, monospace"
              fontSize="7"
            >
              N
            </text>
          </g>

          {/* Scale bar (bottom-center exterior) */}
          <g transform="translate(170, 304)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="0.6" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="0.6" />
            <line x1="20" y1="-2" x2="20" y2="2" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="0.5" />
            <line x1="40" y1="-2" x2="40" y2="2" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="0.5" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="0.6" />
            <text x="0" y="-6" fill="#ffffff" fillOpacity="0.55" fontFamily="ui-monospace, monospace" fontSize="6">0</text>
            <text x="60" y="-6" textAnchor="end" fill="#ffffff" fillOpacity="0.55" fontFamily="ui-monospace, monospace" fontSize="6">20 FT</text>
          </g>

          {/* Sheet info stamp (lower-right exterior) */}
          <g transform="translate(370, 296)">
            <rect x="0" y="-9" width="78" height="14" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.4" />
            <text x="4" y="0" fill="#ffffff" fillOpacity="0.55" fontFamily="ui-monospace, monospace" fontSize="6" letterSpacing="1.2">
              SHEET 1 / 1
            </text>
            <line x1="40" y1="-9" x2="40" y2="5" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="0.4" />
            <text x="44" y="0" fill={BRAND} fontFamily="ui-monospace, monospace" fontSize="6" letterSpacing="1.2">
              REV · 01
            </text>
          </g>
        </svg>

        {/* Footer strip with the same job number / address treatment used
            on the visualizer card so the two visuals feel like documents
            from the same project file. */}
        <div className="mt-3 grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/55">
          <div>
            <div className="text-paper/40">Folio</div>
            <div className="text-paper mt-0.5">30-4029-001</div>
          </div>
          <div>
            <div className="text-paper/40">Style</div>
            <div className="text-paper mt-0.5">6′ Aluminum</div>
          </div>
          <div>
            <div className="text-paper/40">Status</div>
            <div className="text-brand mt-0.5">Estimated</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerTicks() {
  return (
    <>
      <span className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-brand pointer-events-none" />
      <span className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-brand pointer-events-none" />
      <span className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-brand pointer-events-none" />
      <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-brand pointer-events-none" />
    </>
  );
}
