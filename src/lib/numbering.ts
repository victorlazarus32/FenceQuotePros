import "server-only";
import { db } from "./db";

// Document numbering. MAX-based, not last-created-based: ordering by
// createdAt breaks on timestamp ties (bulk-seeded or same-second rows made
// "the last invoice" ambiguous and minted a DUPLICATE number — caught live
// by the Phase-2 gauntlet). The DB also enforces @@unique([userId, number])
// as the hard integrity backstop; a rare concurrent-create collision fails
// loudly (P2002) instead of silently duplicating a money document.

export async function nextEstimateNumber(userId: string): Promise<string> {
  const numbers = await db.estimate.findMany({
    where: { userId },
    select: { number: true },
  });
  const next = maxSeq(numbers.map((n) => n.number)) + 1;
  return `EST-${next.toString().padStart(4, "0")}`;
}

export async function nextInvoiceNumber(userId: string): Promise<string> {
  const numbers = await db.invoice.findMany({
    where: { userId },
    select: { number: true },
  });
  const next = maxSeq(numbers.map((n) => n.number)) + 1;
  return `INV-${next.toString().padStart(4, "0")}`;
}

function maxSeq(numbers: readonly string[]): number {
  let max = 0;
  for (const num of numbers) {
    const m = num.match(/(\d+)(?:-\d+)?$/); // tolerate dedup suffixes
    const seq = m ? parseInt(m[1], 10) : 0;
    if (seq > max) max = seq;
  }
  return max;
}
