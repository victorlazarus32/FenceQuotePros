"use client";

import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/landing/lang";

const T: Record<Lang, {
  header: string;
  crewsSuffix: string;
  jobsLabel: string;
  crewCol: string;
  days: string[];
  scheduled: string;
  inProgress: string;
  unscheduled: string;
  awaitingSuffix: string;
}> = {
  en: {
    header: "Production board",
    crewsSuffix: "crews",
    jobsLabel: "jobs",
    crewCol: "Crew",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    scheduled: "Scheduled",
    inProgress: "In progress",
    unscheduled: "Unscheduled",
    awaitingSuffix: "awaiting",
  },
  es: {
    header: "Tablero de producción",
    crewsSuffix: "cuadrillas",
    jobsLabel: "trabajos",
    crewCol: "Cuadrilla",
    days: ["Lun", "Mar", "Mié", "Jue", "Vie"],
    scheduled: "Programado",
    inProgress: "En proceso",
    unscheduled: "No programado",
    awaitingSuffix: "esperando",
  },
};

// Animated production-board mockup for /landing. Cycles three scenes
// to show the contractor-experience of running the board: a baseline
// week, mid-week reassignments inside the same week, then a flip to
// next week. Each scene change cross-fades every cell with a small
// stagger so the board reads as actively updating.
//
// prefers-reduced-motion: reduce: cycle is paused on the first scene
// and the per-cell keyframe collapses to a no-op (handled in
// globals.css).

type Cell =
  | { kind: "job"; title: string; meta: string }
  | { kind: "empty" };

type Scene = {
  weekLabel: string;
  totals: { scheduled: number; inProgress: number; unscheduledLabel: string };
  rows: { name: string; cells: Cell[] }[];
};

const j = (title: string, meta: string): Cell => ({ kind: "job", title, meta });
const e: Cell = { kind: "empty" };

// 3 scenes × 3 crews × 5 days. Scene math is internally consistent —
// header "N jobs" equals scheduled + in-progress (= visible tiles on
// the board); unscheduled count is the awaiting column off-canvas.
const SCENES: Scene[] = [
  {
    weekLabel: "Wk of Jun 03",
    totals: { scheduled: 5, inProgress: 1, unscheduledLabel: "3 awaiting" },
    rows: [
      {
        name: "A-1",
        cells: [
          j("Sanchez", "64 LF"),
          j("Reyes", "92 LF"),
          e,
          j("Lopez", "146 LF · gate"),
          e,
        ],
      },
      {
        name: "B-2",
        cells: [
          e,
          j("Cohen", "60 LF · pool"),
          j("Cohen", "cont."),
          e,
          j("Diaz", "210 LF"),
        ],
      },
      {
        name: "C-3",
        cells: [j("Park", "44 LF"), e, e, e, e],
      },
    ],
  },
  // Mid-week reassignment: Lopez gate moved A-1 Thu -> C-3 Thu (frees
  // up A-1 for the new Vega job Friday); Cohen pool extended into Thu.
  {
    weekLabel: "Wk of Jun 03",
    totals: { scheduled: 6, inProgress: 1, unscheduledLabel: "2 awaiting" },
    rows: [
      {
        name: "A-1",
        cells: [
          j("Sanchez", "64 LF"),
          j("Reyes", "92 LF"),
          e,
          e,
          j("Vega", "78 LF"),
        ],
      },
      {
        name: "B-2",
        cells: [
          e,
          j("Cohen", "60 LF · pool"),
          j("Cohen", "cont."),
          j("Cohen", "cont."),
          j("Diaz", "210 LF"),
        ],
      },
      {
        name: "C-3",
        cells: [j("Park", "44 LF"), e, e, j("Lopez", "146 LF · gate"), e],
      },
    ],
  },
  // Next week — fresh job board.
  {
    weekLabel: "Wk of Jun 10",
    totals: { scheduled: 7, inProgress: 0, unscheduledLabel: "2 awaiting" },
    rows: [
      {
        name: "A-1",
        cells: [
          j("Nguyen", "102 LF"),
          e,
          j("Patel", "56 LF · pool"),
          j("Patel", "cont."),
          j("Brown", "180 LF"),
        ],
      },
      {
        name: "B-2",
        cells: [
          j("Hernandez", "88 LF"),
          j("Hernandez", "cont."),
          e,
          j("Wong", "72 LF · gate"),
          e,
        ],
      },
      {
        name: "C-3",
        cells: [
          e,
          j("Khan", "52 LF"),
          j("Garcia", "210 LF"),
          j("Garcia", "cont."),
          e,
        ],
      },
    ],
  },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SCENE_MS = 4500;

export default function AnimatedScheduleMockup({
  lang = "en",
}: { lang?: Lang } = {}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const t = T[lang];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const id = window.setInterval(() => {
      setSceneIndex((i) => (i + 1) % SCENES.length);
    }, SCENE_MS);
    return () => window.clearInterval(id);
  }, []);

  const scene = SCENES[sceneIndex];
  const totalJobs = scene.totals.scheduled + scene.totals.inProgress;

  return (
    <div className="relative">
      <CornerTicks />
      <div className="bg-white text-ink border border-line">
        {/* Header */}
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-text-soft">
            <Calendar className="w-3 h-3 text-brand" />
            <span>{t.header} ·</span>
            <span
              key={`week-${sceneIndex}`}
              className="fqp-cell-in inline-block"
            >
              {scene.weekLabel}
            </span>
          </div>
          <div
            key={`tot-${sceneIndex}`}
            className="fqp-cell-in font-mono text-[10px] uppercase tracking-[0.22em] text-brand"
          >
            {totalJobs} {t.jobsLabel} · 3 {t.crewsSuffix}
          </div>
        </div>

        {/* Day header row */}
        <div className="grid grid-cols-[88px_repeat(5,_1fr)] border-b border-line bg-paper">
          <div className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-soft border-r border-line">
            {t.crewCol}
          </div>
          {t.days.map((d, i) => (
            <div
              key={d}
              className={`px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-text-soft ${
                i < t.days.length - 1 ? "border-r border-line" : ""
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Crew rows */}
        {scene.rows.map((row, rowI) => (
          <div
            key={row.name}
            className={`grid grid-cols-[88px_repeat(5,_1fr)] ${
              rowI < scene.rows.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <div className="px-3 py-3 border-r border-line flex items-center">
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "var(--text-md)",
                  textTransform: "uppercase",
                  letterSpacing: "0.005em",
                }}
              >
                {row.name}
              </span>
            </div>
            {row.cells.map((cell, colI) => (
              <div
                key={colI}
                className={`p-2 min-h-[64px] ${
                  colI < row.cells.length - 1 ? "border-r border-line" : ""
                }`}
              >
                {cell.kind === "job" ? (
                  <div
                    key={`${sceneIndex}-${rowI}-${colI}`}
                    className="fqp-cell-in bg-brand-soft border-l-2 border-brand p-2"
                    style={{
                      animationDelay: `${(rowI * 5 + colI) * 35}ms`,
                    }}
                  >
                    <div
                      className="text-ink leading-tight"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.005em",
                      }}
                    >
                      {cell.title}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-soft mt-0.5">
                      {cell.meta}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}

        {/* Totals strip */}
        <div className="px-5 py-3 border-t border-line bg-paper grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
          <div>
            <div className="text-text-soft">{t.scheduled}</div>
            <div
              key={`sch-${sceneIndex}`}
              className="fqp-cell-in text-ink mt-0.5"
            >
              {scene.totals.scheduled}
            </div>
          </div>
          <div>
            <div className="text-text-soft">{t.inProgress}</div>
            <div
              key={`prog-${sceneIndex}`}
              className="fqp-cell-in text-brand mt-0.5"
            >
              {scene.totals.inProgress}
            </div>
          </div>
          <div>
            <div className="text-text-soft">{t.unscheduled}</div>
            <div
              key={`uns-${sceneIndex}`}
              className="fqp-cell-in text-ink mt-0.5"
            >
              {lang === "es"
                ? scene.totals.unscheduledLabel.replace(
                    /(\d+)\s+awaiting/,
                    `$1 ${t.awaitingSuffix}`,
                  )
                : scene.totals.unscheduledLabel}
            </div>
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
