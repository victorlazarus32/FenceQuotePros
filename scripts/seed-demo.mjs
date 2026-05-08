// Idempotent seed via raw SQLite (no Prisma client). Wipes the demo user's
// records and re-creates a realistic Allday Fence dataset.
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

const db = new Database("./dev.db");
const cents = (d) => Math.round(d * 100);
const cuid = () => "c" + randomUUID().replace(/-/g, "").slice(0, 24);
const now = () => new Date().toISOString();
const dt = (s) => new Date(s).toISOString();

const DEMO_EMAIL = "demo@fencequote.app";

// Get or create demo user
let user = db
  .prepare("SELECT id FROM User WHERE email = ?")
  .get(DEMO_EMAIL);
if (!user) {
  const id = cuid();
  db.prepare(
    `INSERT INTO User (id, email, name, createdAt) VALUES (?, ?, ?, ?)`,
  ).run(id, DEMO_EMAIL, "Victor Moreno", now());
  user = { id };
}
const userId = user.id;

// Wipe prior demo data
db.exec("BEGIN");
try {
  const estIds = db
    .prepare("SELECT id FROM Estimate WHERE userId = ?")
    .all(userId)
    .map((r) => r.id);
  const invIds = db
    .prepare("SELECT id FROM Invoice WHERE userId = ?")
    .all(userId)
    .map((r) => r.id);
  const inClause = (ids) =>
    ids.length === 0 ? "(NULL)" : "(" + ids.map(() => "?").join(",") + ")";
  if (invIds.length)
    db.prepare(
      `DELETE FROM Payment WHERE invoiceId IN ${inClause(invIds)}`,
    ).run(...invIds);
  if (estIds.length)
    db.prepare(
      `DELETE FROM LineItem WHERE estimateId IN ${inClause(estIds)}`,
    ).run(...estIds);
  if (invIds.length)
    db.prepare(
      `DELETE FROM LineItem WHERE invoiceId IN ${inClause(invIds)}`,
    ).run(...invIds);
  if (estIds.length)
    db.prepare(
      `DELETE FROM FenceJob WHERE estimateId IN ${inClause(estIds)}`,
    ).run(...estIds);
  db.prepare("DELETE FROM Invoice WHERE userId = ?").run(userId);
  db.prepare("DELETE FROM Estimate WHERE userId = ?").run(userId);
  db.prepare("DELETE FROM Client WHERE userId = ?").run(userId);

  // Re-brand demo user
  db.prepare(
    `UPDATE User SET name=?, companyName=?, phone=?, addressLine1=?, city=?, state=?, zip=? WHERE id=?`,
  ).run(
    "Victor Moreno",
    "Allday Fence Company",
    "(305) 910-6601",
    "13616 SW 115th Ln",
    "Miami",
    "FL",
    "33186",
    userId,
  );

  // Clients
  const insClient = db.prepare(
    `INSERT INTO Client (id, userId, name, email, phone, addressLine1, city, state, zip, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const clients = {};
  function client(key, c) {
    const id = cuid();
    insClient.run(
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
      now(),
    );
    clients[key] = id;
  }
  client("maria", {
    name: "Maria Rodriguez",
    email: "maria.rod@example.com",
    phone: "(305) 555-0142",
    addressLine1: "8420 SW 142nd Ave",
    city: "Miami",
    state: "FL",
    zip: "33183",
    notes: "Backyard pool barrier — referred by Sunrise Pools.",
  });
  client("hoa", {
    name: "Coral Gables HOA",
    email: "ops@coralgableshoa.example",
    phone: "(305) 555-0177",
    addressLine1: "2200 Coral Way",
    city: "Coral Gables",
    state: "FL",
    zip: "33134",
    notes: "Property manager: David Chen. Net-30 billing.",
  });
  client("jp", {
    name: "James Patterson",
    email: "jp@example.com",
    phone: "(786) 555-0119",
    addressLine1: "1450 Ocean Dr",
    city: "Miami Beach",
    state: "FL",
    zip: "33139",
    notes: "Aluminum only — coastal salt exposure.",
  });
  client("espe", {
    name: "Esperanza Jiménez",
    phone: "(305) 555-0204",
    addressLine1: "11250 SW 232nd St",
    city: "Homestead",
    state: "FL",
    zip: "33032",
    notes: "Prefiere comunicación en español.",
  });
  client("school", {
    name: "Pinecrest Elementary",
    email: "facilities@pinecrest.example",
    phone: "(305) 555-0188",
    addressLine1: "10355 SW 57th Ave",
    city: "Pinecrest",
    state: "FL",
    zip: "33156",
    notes: "Facilities dept. Permit-required job.",
  });

  // Helpers
  const insEst = db.prepare(
    `INSERT INTO Estimate (id, userId, clientId, number, status, issueDate, expiryDate, notes, terms,
       subtotalCents, taxRate, taxCents, totalCents, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insInv = db.prepare(
    `INSERT INTO Invoice (id, userId, clientId, estimateId, number, status, issueDate, dueDate, notes, terms,
       subtotalCents, taxRate, taxCents, totalCents, paidCents, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insLI = db.prepare(
    `INSERT INTO LineItem (id, estimateId, invoiceId, description, quantity, unit, unitPriceCents, totalCents, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insFJ = db.prepare(
    `INSERT INTO FenceJob (id, estimateId, fenceType, heightFeet, linearFeet, postSpacingFeet,
       numGatesSingle, numGatesDouble, removeExisting, removeLinearFeet, terrain, poolAdjacent, hvhz, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insPay = db.prepare(
    `INSERT INTO Payment (id, invoiceId, amountCents, method, reference, receivedAt, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  function makeEst(opts) {
    const id = cuid();
    insEst.run(
      id,
      userId,
      opts.clientId,
      opts.number,
      opts.status,
      dt(opts.issueDate),
      opts.expiryDate ? dt(opts.expiryDate) : null,
      opts.notes ?? null,
      opts.terms ?? null,
      opts.subtotalCents,
      opts.taxRate,
      opts.taxCents,
      opts.totalCents,
      now(),
      now(),
    );
    opts.lines.forEach((l, i) =>
      insLI.run(
        cuid(),
        id,
        null,
        l.description,
        l.quantity,
        l.unit,
        l.unitPriceCents,
        l.totalCents,
        i,
      ),
    );
    if (opts.fenceJob) {
      const f = opts.fenceJob;
      insFJ.run(
        cuid(),
        id,
        f.fenceType,
        f.heightFeet,
        f.linearFeet,
        f.postSpacingFeet,
        f.numGatesSingle,
        f.numGatesDouble,
        f.removeExisting ? 1 : 0,
        f.removeLinearFeet,
        f.terrain,
        f.poolAdjacent ? 1 : 0,
        f.hvhz ? 1 : 0,
        f.notes ?? null,
      );
    }
    return id;
  }

  function makeInv(opts) {
    const id = cuid();
    insInv.run(
      id,
      userId,
      opts.clientId,
      opts.estimateId ?? null,
      opts.number,
      opts.status,
      dt(opts.issueDate),
      opts.dueDate ? dt(opts.dueDate) : null,
      opts.notes ?? null,
      opts.terms ?? null,
      opts.subtotalCents,
      opts.taxRate,
      opts.taxCents,
      opts.totalCents,
      opts.paidCents,
      now(),
      now(),
    );
    opts.lines.forEach((l, i) =>
      insLI.run(
        cuid(),
        null,
        id,
        l.description,
        l.quantity,
        l.unit,
        l.unitPriceCents,
        l.totalCents,
        i,
      ),
    );
    (opts.payments ?? []).forEach((p) =>
      insPay.run(
        cuid(),
        id,
        p.amountCents,
        p.method,
        p.reference ?? null,
        dt(p.receivedAt),
        p.notes ?? null,
      ),
    );
    return id;
  }

  // Estimate 1: Maria — pool barrier, accepted
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
  const est1Id = makeEst({
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

  // Convert est1 to a paid invoice
  makeInv({
    clientId: clients.maria,
    estimateId: est1Id,
    number: "INV-2001",
    status: "paid",
    issueDate: "2026-04-20",
    dueDate: "2026-05-20",
    notes:
      'Pool-barrier compliant install. All gates self-closing/self-latching with latch height 54". Permit included.',
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
        reference: "Stripe pi_3O8",
        receivedAt: "2026-04-30",
        notes: "Balance",
      },
    ],
  });

  // Estimate 2: HOA — large privacy
  makeEst({
    clientId: clients.hoa,
    number: "EST-1002",
    status: "sent",
    issueDate: "2026-04-25",
    expiryDate: "2026-05-25",
    notes:
      "Replacement of perimeter privacy fence along Coral Way side. HVHZ-compliant footings.",
    terms: "Net-30. 25% retainage held until walk-through.",
    subtotalCents: cents(28400),
    taxRate: 7,
    taxCents: cents(1988),
    totalCents: cents(30388),
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
        description: "Double drive gate (with hardware)",
        quantity: 2,
        unit: "ea",
        unitPriceCents: cents(680),
        totalCents: cents(1360),
      },
      {
        description: "Tear-out and haul-off of existing fence",
        quantity: 480,
        unit: "lf",
        unitPriceCents: cents(4),
        totalCents: cents(1920),
      },
      {
        description: "Permit (City of Coral Gables)",
        quantity: 1,
        unit: "ea",
        unitPriceCents: cents(450),
        totalCents: cents(450),
      },
      {
        description: "Cleanup and dump fees",
        quantity: 1,
        unit: "ea",
        unitPriceCents: cents(1288),
        totalCents: cents(1288),
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

  // Estimate 3: JP — coastal aluminum, draft
  makeEst({
    clientId: clients.jp,
    number: "EST-1003",
    status: "draft",
    issueDate: "2026-05-01",
    expiryDate: "2026-06-01",
    notes:
      "Coastal — aluminum recommended over steel due to salt corrosion.",
    terms: "50% deposit due upon acceptance. Balance due upon completion.",
    subtotalCents: cents(6240),
    taxRate: 7,
    taxCents: cents(436.8),
    totalCents: cents(6676.8),
    lines: [
      {
        description: "Aluminum picket fence — 4' tall",
        quantity: 95,
        unit: "lf",
        unitPriceCents: cents(48),
        totalCents: cents(4560),
      },
      {
        description: "Posts (6' spacing, set in concrete)",
        quantity: 17,
        unit: "ea",
        unitPriceCents: cents(40),
        totalCents: cents(680),
      },
      {
        description: "Single walk gate (with hardware)",
        quantity: 1,
        unit: "ea",
        unitPriceCents: cents(550),
        totalCents: cents(550),
      },
      {
        description: "Powder-coat upgrade (matte black)",
        quantity: 95,
        unit: "lf",
        unitPriceCents: cents(4.74),
        totalCents: cents(450),
      },
    ],
    fenceJob: {
      fenceType: "aluminum",
      heightFeet: 4,
      linearFeet: 95,
      postSpacingFeet: 6,
      numGatesSingle: 1,
      numGatesDouble: 0,
      removeExisting: false,
      removeLinearFeet: 0,
      terrain: "flat",
      poolAdjacent: false,
      hvhz: true,
    },
  });

  // Estimate 4: Esperanza — chain link, accepted
  makeEst({
    clientId: clients.espe,
    number: "EST-1004",
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

  // Invoice 2 — School, partial
  makeInv({
    clientId: clients.school,
    number: "INV-2002",
    status: "partial",
    issueDate: "2026-04-15",
    dueDate: "2026-05-15",
    notes: "Playground perimeter — black aluminum with privacy mesh.",
    terms: "Net-30. School purchase order #PO-44219.",
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
        notes: "Partial payment per PO",
      },
    ],
  });

  // Invoice 3 — JP repair, sent
  makeInv({
    clientId: clients.jp,
    number: "INV-2003",
    status: "sent",
    issueDate: "2026-04-05",
    dueDate: "2026-05-05",
    notes: "Repair of storm-damaged section.",
    terms: "Net-30.",
    subtotalCents: cents(1850),
    taxRate: 7,
    taxCents: cents(129.5),
    totalCents: cents(1979.5),
    paidCents: 0,
    lines: [
      {
        description: "Aluminum repair — replace 12 panels + 4 posts",
        quantity: 1,
        unit: "ea",
        unitPriceCents: cents(1850),
        totalCents: cents(1850),
      },
    ],
  });

  db.exec("COMMIT");
} catch (e) {
  db.exec("ROLLBACK");
  throw e;
}

// Summary
const c = db.prepare("SELECT COUNT(*) c FROM Client WHERE userId=?").get(userId).c;
const e = db.prepare("SELECT COUNT(*) c FROM Estimate WHERE userId=?").get(userId).c;
const i = db.prepare("SELECT COUNT(*) c FROM Invoice WHERE userId=?").get(userId).c;
console.log(`Seeded: clients=${c} estimates=${e} invoices=${i}`);
