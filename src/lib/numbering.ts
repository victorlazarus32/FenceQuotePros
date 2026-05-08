import "server-only";
import { db } from "./db";

export async function nextEstimateNumber(userId: string): Promise<string> {
  const last = await db.estimate.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });
  const next = parseSeq(last?.number) + 1;
  return `EST-${next.toString().padStart(4, "0")}`;
}

export async function nextInvoiceNumber(userId: string): Promise<string> {
  const last = await db.invoice.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });
  const next = parseSeq(last?.number) + 1;
  return `INV-${next.toString().padStart(4, "0")}`;
}

function parseSeq(num: string | undefined): number {
  if (!num) return 0;
  const m = num.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}
