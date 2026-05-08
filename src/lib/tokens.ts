// URL-safe random tokens for public share links (e.g. /p/<token>).
// 16 bytes ≈ 22 base64url chars — enough entropy that brute-force enumeration
// is infeasible.

import { randomBytes } from "node:crypto";

export function generateShareToken(): string {
  return randomBytes(16).toString("base64url");
}
