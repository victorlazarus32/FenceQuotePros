// Deposit calculation. Three modes:
//   "none"    — depositCents = 0
//   "percent" — depositCents = round(totalCents * percent / 100)
//   "fixed"   — depositCents = depositFixedCents (capped at totalCents)
//
// "fixed" is capped so a contractor who types a deposit larger than the
// total doesn't generate a negative balance-due figure on the proposal.

export type DepositMode = "none" | "percent" | "fixed";

export interface DepositConfig {
  mode: DepositMode;
  percent: number;          // 0–100, used when mode === "percent"
  fixedCents: number;       // used when mode === "fixed"
}

export function computeDepositCents(
  totalCents: number,
  cfg: DepositConfig,
): number {
  if (cfg.mode === "none") return 0;
  if (cfg.mode === "percent") {
    const pct = Math.max(0, Math.min(100, cfg.percent));
    return Math.round((totalCents * pct) / 100);
  }
  // fixed
  return Math.max(0, Math.min(totalCents, cfg.fixedCents));
}

export function balanceDueCents(
  totalCents: number,
  depositCents: number,
): number {
  return Math.max(0, totalCents - depositCents);
}
