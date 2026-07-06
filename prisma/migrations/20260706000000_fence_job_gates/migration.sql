-- Per-gate specs for FenceJob: [{style, widthFeet, motor, qty}, ...]
-- Null on legacy rows — the calc engine falls back to the
-- numGatesSingle/numGatesDouble + gateStyle/gateMotor columns.
ALTER TABLE "FenceJob" ADD COLUMN "gates" JSONB;
