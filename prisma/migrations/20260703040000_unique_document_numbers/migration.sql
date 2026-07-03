-- Duplicate document numbers were possible: numbering picked "the last
-- invoice by createdAt", which is ambiguous on timestamp ties, and no
-- constraint existed as a backstop. Dedupe any existing collisions with an
-- auditable suffix (INV-2002 → INV-2002-2), then enforce uniqueness.

WITH d AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "userId", "number" ORDER BY "createdAt", id) AS rn
  FROM "Invoice"
)
UPDATE "Invoice" i
SET "number" = i."number" || '-' || d.rn
FROM d
WHERE d.id = i.id AND d.rn > 1;

WITH d AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "userId", "number" ORDER BY "createdAt", id) AS rn
  FROM "Estimate"
)
UPDATE "Estimate" e
SET "number" = e."number" || '-' || d.rn
FROM d
WHERE d.id = e.id AND d.rn > 1;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_userId_number_key" ON "Invoice"("userId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_userId_number_key" ON "Estimate"("userId", "number");
