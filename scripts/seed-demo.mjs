// Idempotent demo seed for the REAL database (Postgres via DATABASE_URL).
// Replaces the legacy better-sqlite3 version, which targeted the retired
// ./dev.db and could not run against the Prisma/Postgres app at all.
//
// - Uses `pg` directly (the generated Prisma client is TypeScript-only, so a
//   plain .mjs script can't import it).
// - The demo tenant gets a PASSWORD (printed once) — passwordless accounts
//   are claimable via signup and were an account-takeover vector.
// - Dataset is a neutral fictional contractor, not a real company's brand.
//
// Usage:  node scripts/seed-demo.mjs
// Env:    DATABASE_URL (required) · SEED_DEMO_PASSWORD (optional)

import { randomUUID, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const cents = (d) => Math.round(d * 100);
const cuid = () => "c" + randomUUID().replace(/-/g, "").slice(0, 24);

const DEMO_EMAIL = "demo@fencequotepros.com";
const DEMO_PASSWORD =
  process.env.SEED_DEMO_PASSWORD || randomBytes(9).toString("base64url");

async function q(text, params = []) {
  return client.query(text, params);
}

async function main() {
  await client.connect();

  // Get or create the demo user — always WITH a password.
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let userId;
  const existing = await q(`SELECT id FROM "User" WHERE email = $1`, [
    DEMO_EMAIL,
  ]);
  if (existing.rows.length) {
    userId = existing.rows[0].id;
    await q(`UPDATE "User" SET "passwordHash" = $1 WHERE id = $2`, [
      passwordHash,
      userId,
    ]);
  } else {
    userId = cuid();
    await q(
      `INSERT INTO "User" (id, email, "passwordHash", name, "createdAt")
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, DEMO_EMAIL, passwordHash, "Demo Contractor"],
    );
  }

  await q("BEGIN");
  try {
    // Wipe the demo tenant's prior data (children cascade from these).
    await q(`DELETE FROM "Invoice" WHERE "userId" = $1`, [userId]);
    await q(`DELETE FROM "Estimate" WHERE "userId" = $1`, [userId]);
    await q(`DELETE FROM "Client" WHERE "userId" = $1`, [userId]);

    // Neutral fictional branding — this is a product demo, not a real firm.
    await q(
      `UPDATE "User" SET name=$1, "companyName"=$2, phone=$3,
         "addressLine1"=$4, city=$5, state=$6, zip=$7,
         "licenseNumber"=$8 WHERE id=$9`,
      [
        "Demo Contractor",
        "Blue Heron Fence Co. (Demo)",
        "(305) 555-0100",
        "100 Demo Way",
        "Miami",
        "FL",
        "33101",
        "CGC-DEMO-0000",
        userId,
      ],
    );

    // ── Clients ──
    const clients = {};
    async function addClient(key, c) {
      const id = cuid();
      await q(
        `INSERT INTO "Client" (id, "userId", name, email, phone,
           "addressLine1", city, state, zip, notes, "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`,
        [
          id,
          userId,
          c.name,
          c.email ?? null,
          c.phone ?? null,
          c.addressLine1 ?? null,
          c.city ?? null,
          c.state ?? null,
          c.zip ?? null,
          c.notes ?? null,
        ],
      );
      clients[key] = id;
    }
    await addClient("maria", {
      name: "Maria Rodriguez",
      email: "maria.demo@example.com",
      phone: "(305) 555-0142",
      addressLine1: "8420 SW 142nd Ave",
      city: "Miami",
      state: "FL",
      zip: "33183",
      notes: "Backyard pool barrier — referred by a neighbor.",
    });
    await addClient("hoa", {
      name: "Coral Gables HOA (Demo)",
      email: "hoa.demo@example.com",
      phone: "(305) 555-0177",
      addressLine1: "2200 Coral Way",
      city: "Coral Gables",
      state: "FL",
      zip: "33134",
      notes: "Property manager: David Chen. Net-30 billing.",
    });
    await addClient("espe", {
      name: "Esperanza Jiménez",
      phone: "(305) 555-0204",
      addressLine1: "11250 SW 232nd St",
      city: "Homestead",
      state: "FL",
      zip: "33032",
      notes: "Prefiere comunicación en español.",
    });

    // ── Helpers ──
    async function addLine(estimateId, invoiceId, l, i) {
      await q(
        `INSERT INTO "LineItem" (id, "estimateId", "invoiceId", description,
           quantity, unit, "unitPriceCents", "totalCents", "sortOrder")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          cuid(),
          estimateId,
          invoiceId,
          l.description,
          l.quantity,
          l.unit,
          l.unitPriceCents,
          l.totalCents,
          i,
        ],
      );
    }

    async function makeEstimate(o) {
      const id = cuid();
      await q(
        `INSERT INTO "Estimate" (id, "userId", "clientId", number, status,
           "issueDate", "expiryDate", notes, terms, "subtotalCents", "taxRate",
           "taxCents", "totalCents", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())`,
        [
          id,
          userId,
          o.clientId,
          o.number,
          o.status,
          o.issueDate,
          o.expiryDate ?? null,
          o.notes ?? null,
          o.terms ?? null,
          o.subtotalCents,
          o.taxRate,
          o.taxCents,
          o.totalCents,
        ],
      );
      for (const [i, l] of o.lines.entries()) await addLine(id, null, l, i);
      if (o.fenceJob) {
        const f = o.fenceJob;
        await q(
          `INSERT INTO "FenceJob" (id, "estimateId", "fenceType", "heightFeet",
             "linearFeet", "postSpacingFeet", "numGatesSingle", "numGatesDouble",
             "removeExisting", "removeLinearFeet", terrain, "poolAdjacent", hvhz)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            cuid(),
            id,
            f.fenceType,
            f.heightFeet,
            f.linearFeet,
            f.postSpacingFeet,
            f.numGatesSingle,
            f.numGatesDouble,
            f.removeExisting,
            f.removeLinearFeet,
            f.terrain,
            f.poolAdjacent,
            f.hvhz,
          ],
        );
      }
      return id;
    }

    async function makeInvoice(o) {
      const id = cuid();
      await q(
        `INSERT INTO "Invoice" (id, "userId", "clientId", "estimateId", number,
           status, "issueDate", "dueDate", notes, terms, "subtotalCents",
           "taxRate", "taxCents", "totalCents", "paidCents", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),NOW())`,
        [
          id,
          userId,
          o.clientId,
          o.estimateId ?? null,
          o.number,
          o.status,
          o.issueDate,
          o.dueDate ?? null,
          o.notes ?? null,
          o.terms ?? null,
          o.subtotalCents,
          o.taxRate,
          o.taxCents,
          o.totalCents,
          o.paidCents,
        ],
      );
      for (const [i, l] of o.lines.entries()) await addLine(null, id, l, i);
      for (const p of o.payments ?? []) {
        await q(
          `INSERT INTO "Payment" (id, "invoiceId", "amountCents", method,
             reference, "receivedAt", notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            cuid(),
            id,
            p.amountCents,
            p.method,
            p.reference ?? null,
            p.receivedAt,
            p.notes ?? null,
          ],
        );
      }
      return id;
    }

    // ── Estimate 1: pool barrier, accepted → paid invoice ──
    const est1Lines = [
      {
        description: "Aluminum picket fence — 5' tall",
        quantity: 140,
        unit: "lf",
        unitPriceCents: cents(52),
        totalCents: cents(7280),
      },
      {
        description: "Posts (6' spacing, set in concrete)",
        quantity: 25,
        unit: "ea",
        unitPriceCents: cents(40),
        totalCents: cents(1000),
      },
      {
        description: "Single walk gate (with hardware)",
        quantity: 1,
        unit: "ea",
        unitPriceCents: cents(140),
        totalCents: cents(140),
      },
    ];
    const est1 = await makeEstimate({
      clientId: clients.maria,
      number: "EST-1001",
      status: "accepted",
      issueDate: "2026-04-12",
      expiryDate: "2026-05-12",
      notes:
        'Pool-barrier compliant install. All gates self-closing/self-latching with latch height 54". Permit included.',
      terms: "50% deposit due upon acceptance. Balance due upon completion.",
      subtotalCents: cents(8420),
      taxRate: 7,
      taxCents: cents(589.4),
      totalCents: cents(9009.4),
      lines: est1Lines,
      fenceJob: {
        fenceType: "aluminum",
        heightFeet: 5,
        linearFeet: 140,
        postSpacingFeet: 6,
        numGatesSingle: 1,
        numGatesDouble: 0,
        removeExisting: false,
        removeLinearFeet: 0,
        terrain: "flat",
        poolAdjacent: true,
        hvhz: true,
      },
    });
    await makeInvoice({
      clientId: clients.maria,
      estimateId: est1,
      number: "INV-2001",
      status: "paid",
      issueDate: "2026-04-20",
      dueDate: "2026-05-20",
      terms: "50% deposit due upon acceptance. Balance due upon completion.",
      subtotalCents: cents(8420),
      taxRate: 7,
      taxCents: cents(589.4),
      totalCents: cents(9009.4),
      paidCents: cents(9009.4),
      lines: est1Lines,
      payments: [
        {
          amountCents: cents(4500),
          method: "check",
          reference: "Check #1042",
          receivedAt: "2026-04-21",
          notes: "50% deposit",
        },
        {
          amountCents: cents(4509.4),
          method: "ach",
          reference: "ACH 4/30",
          receivedAt: "2026-04-30",
          notes: "Balance",
        },
      ],
    });

    // ── Estimate 2: HOA privacy replacement, sent ──
    await makeEstimate({
      clientId: clients.hoa,
      number: "EST-1002",
      status: "sent",
      issueDate: "2026-04-25",
      expiryDate: "2026-05-25",
      notes:
        "Replacement of perimeter privacy fence along Coral Way side. HVHZ-compliant footings.",
      terms: "Net-30. 25% retainage held until walk-through.",
      subtotalCents: cents(25302),
      taxRate: 7,
      taxCents: cents(1771.14),
      totalCents: cents(27073.14),
      lines: [
        {
          description: "Wood privacy fence — 6' tall",
          quantity: 480,
          unit: "lf",
          unitPriceCents: cents(45),
          totalCents: cents(21600),
        },
        {
          description: "Posts (6' spacing, set in concrete)",
          quantity: 81,
          unit: "ea",
          unitPriceCents: cents(22),
          totalCents: cents(1782),
        },
        {
          description: "Tear-out and haul-off of existing fence",
          quantity: 480,
          unit: "lf",
          unitPriceCents: cents(4),
          totalCents: cents(1920),
        },
      ],
      fenceJob: {
        fenceType: "wood_privacy",
        heightFeet: 6,
        linearFeet: 480,
        postSpacingFeet: 6,
        numGatesSingle: 0,
        numGatesDouble: 2,
        removeExisting: true,
        removeLinearFeet: 480,
        terrain: "flat",
        poolAdjacent: false,
        hvhz: true,
      },
    });

    // ── Estimate 3: chain link, accepted (Spanish-preferring client) ──
    await makeEstimate({
      clientId: clients.espe,
      number: "EST-1003",
      status: "accepted",
      issueDate: "2026-04-29",
      expiryDate: "2026-05-29",
      notes: "Cerca de malla ciclónica para perímetro de propiedad.",
      terms: "50% depósito al aceptar. Saldo al finalizar.",
      subtotalCents: cents(3850),
      taxRate: 7,
      taxCents: cents(269.5),
      totalCents: cents(4119.5),
      lines: [
        {
          description: "Chain link fence — 6' tall",
          quantity: 220,
          unit: "lf",
          unitPriceCents: cents(15),
          totalCents: cents(3300),
        },
        {
          description: "Posts (8' spacing, set in concrete)",
          quantity: 29,
          unit: "ea",
          unitPriceCents: cents(15),
          totalCents: cents(435),
        },
        {
          description: "Single walk gate (with hardware)",
          quantity: 1,
          unit: "ea",
          unitPriceCents: cents(115),
          totalCents: cents(115),
        },
      ],
      fenceJob: {
        fenceType: "chain_link",
        heightFeet: 6,
        linearFeet: 220,
        postSpacingFeet: 8,
        numGatesSingle: 1,
        numGatesDouble: 0,
        removeExisting: false,
        removeLinearFeet: 0,
        terrain: "flat",
        poolAdjacent: false,
        hvhz: true,
      },
    });

    // ── Invoice 2: partial payment ──
    await makeInvoice({
      clientId: clients.hoa,
      number: "INV-2002",
      status: "partial",
      issueDate: "2026-04-15",
      dueDate: "2026-05-15",
      notes: "Phase 1 — north perimeter section.",
      terms: "Net-30.",
      subtotalCents: cents(12800),
      taxRate: 7,
      taxCents: cents(896),
      totalCents: cents(13696),
      paidCents: cents(6500),
      lines: [
        {
          description: "Aluminum picket fence — 6' tall",
          quantity: 220,
          unit: "lf",
          unitPriceCents: cents(54),
          totalCents: cents(11880),
        },
        {
          description: "Posts (6' spacing, set in concrete)",
          quantity: 38,
          unit: "ea",
          unitPriceCents: cents(24.21),
          totalCents: cents(920),
        },
      ],
      payments: [
        {
          amountCents: cents(6500),
          method: "ach",
          reference: "ACH 4/22",
          receivedAt: "2026-04-22",
          notes: "Partial payment",
        },
      ],
    });

    await q("COMMIT");
  } catch (e) {
    await q("ROLLBACK");
    throw e;
  }

  const counts = await q(
    `SELECT
       (SELECT COUNT(*) FROM "Client"   WHERE "userId" = $1) AS clients,
       (SELECT COUNT(*) FROM "Estimate" WHERE "userId" = $1) AS estimates,
       (SELECT COUNT(*) FROM "Invoice"  WHERE "userId" = $1) AS invoices`,
    [userId],
  );
  const r = counts.rows[0];
  console.log(
    `Seeded: clients=${r.clients} estimates=${r.estimates} invoices=${r.invoices}`,
  );
  console.log(`Demo login: ${DEMO_EMAIL}`);
  console.log(
    process.env.SEED_DEMO_PASSWORD
      ? "Demo password: (from SEED_DEMO_PASSWORD)"
      : `Demo password: ${DEMO_PASSWORD}  ← save this; it is not stored anywhere else`,
  );
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
