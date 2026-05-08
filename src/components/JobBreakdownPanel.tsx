// Internal contractor view — surfaces the modular engine's breakdown,
// material list, and profit on the estimate detail page. `no-print` so the
// customer's printed copy is unaffected.

import { formatMoney } from "@/lib/format";
import type { FenceCalcResult } from "@/lib/fence";

export function JobBreakdownPanel({
  result,
}: {
  result: FenceCalcResult;
}) {
  const { breakdown, materialList, profit } = result;
  const m = breakdown.appliedMultipliers;

  return (
    <section className="no-print rounded-lg border-2 border-brand bg-brand-soft p-5">
      <header className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-wide font-semibold text-brand">
            Internal · contractor view
          </div>
          <h2
            className="h-card text-ink"
            style={{ fontSize: "var(--text-lg)" }}
          >
            Job breakdown
          </h2>
        </div>
        <div className="text-xs text-slate-500 italic">
          Recomputed from saved inputs · not visible on the printed estimate
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cost breakdown */}
        <div className="bg-white rounded-md border border-line p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
            Cost breakdown
          </div>
          <dl className="space-y-1 text-sm">
            <BreakRow
              label="Material"
              value={formatMoney(breakdown.materialCents)}
            />
            <BreakRow
              label="Labor"
              value={formatMoney(breakdown.laborCents)}
            />
            <BreakRow
              label="Gates"
              value={formatMoney(breakdown.gatesCents)}
              hidden={breakdown.gatesCents === 0}
            />
            <BreakRow
              label="Motors"
              value={formatMoney(breakdown.motorsCents)}
              hidden={breakdown.motorsCents === 0}
            />
            <BreakRow
              label="Removal"
              value={formatMoney(breakdown.removalCents)}
              hidden={breakdown.removalCents === 0}
            />
            <BreakRow
              label="Permit"
              value={formatMoney(breakdown.permitCents)}
              hidden={breakdown.permitCents === 0}
            />
            <BreakRow
              label="Engineering"
              value={formatMoney(breakdown.engineeringCents)}
              hidden={breakdown.engineeringCents === 0}
            />
            <div className="border-t border-line my-2 pt-2 space-y-1">
              <BreakRow
                label="Cost subtotal"
                value={formatMoney(breakdown.subtotalCostCents)}
                bold
              />
              <BreakRow
                label="Margin"
                value={formatMoney(breakdown.marginCents)}
                accent
              />
              <BreakRow
                label="Final"
                value={formatMoney(breakdown.finalCents)}
                bold
                large
              />
            </div>
          </dl>
          <div className="mt-3 pt-3 border-t border-dashed border-line text-xs text-slate-500 font-mono tabular-nums">
            <div>{formatMoney(breakdown.costPerFootCents)} / lf (final)</div>
            <div className="mt-1 leading-relaxed">
              labor multipliers ·{" "}
              <span title="Terrain">t×{m.terrain.toFixed(2)}</span>{" "}
              <span title="Soil">s×{m.soil.toFixed(2)}</span>{" "}
              <span title="Access">a×{m.access.toFixed(2)}</span>{" "}
              <span title="Difficulty">d×{m.difficulty.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Material list */}
        <div className="bg-white rounded-md border border-line p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
            Material list
          </div>
          <dl className="space-y-1 text-sm font-mono tabular-nums">
            <BreakRow
              label="Total posts"
              value={String(materialList.totalPostCount)}
              bold
            />
            <BreakRow
              label="  · Corner"
              value={String(materialList.cornerPostCount)}
              muted
            />
            <BreakRow
              label="  · End"
              value={String(materialList.endPostCount)}
              muted
            />
            <BreakRow
              label="  · Line"
              value={String(materialList.linePostCount)}
              muted
            />
            <BreakRow
              label="Rails"
              value={String(materialList.railCount)}
            />
            {materialList.picketCount > 0 && (
              <BreakRow
                label="Pickets"
                value={String(materialList.picketCount)}
              />
            )}
            <div className="border-t border-line my-2 pt-2 space-y-1">
              <BreakRow
                label="Concrete (cu ft)"
                value={materialList.concreteCubicFeet.toFixed(1)}
              />
              <BreakRow
                label="Concrete bags"
                value={String(materialList.concreteBags)}
                muted
              />
            </div>
          </dl>
          <p className="mt-3 pt-3 border-t border-dashed border-line text-xs text-slate-500 italic">
            Material counts are informational. Bundled into the priced lines
            above.
          </p>
        </div>

        {/* Profit */}
        <div className="bg-white rounded-md border border-line p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-3">
            Profit
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">
                Effective margin
              </div>
              <div
                className="text-ink tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "var(--text-2xl)",
                  lineHeight: 1,
                }}
              >
                {(profit.marginPercent * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Net profit</div>
              <div
                className="text-brand tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "var(--text-xl)",
                  lineHeight: 1,
                }}
              >
                {formatMoney(profit.netProfitCents)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">
                Cost per foot (final)
              </div>
              <div className="font-mono tabular-nums text-ink">
                {formatMoney(breakdown.costPerFootCents)}
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

function BreakRow({
  label,
  value,
  bold,
  large,
  muted,
  accent,
  hidden,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
  muted?: boolean;
  accent?: boolean;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <div
      className={[
        "flex items-baseline justify-between gap-3",
        muted ? "text-slate-500" : "text-slate-700",
        bold ? "font-semibold" : "",
      ].join(" ")}
    >
      <span className="whitespace-pre">{label}</span>
      <span
        className={[
          "font-mono tabular-nums",
          large ? "text-ink" : "",
          accent ? "text-brand" : "",
        ].join(" ")}
        style={
          large
            ? {
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-lg)",
              }
            : undefined
        }
      >
        {value}
      </span>
    </div>
  );
}
