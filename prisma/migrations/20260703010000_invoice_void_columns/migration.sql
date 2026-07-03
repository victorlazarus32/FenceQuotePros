-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "voidedAt" TIMESTAMP(3),
ADD COLUMN     "voidReason" TEXT;

-- Data migration: `overdue` is now DERIVED at read time (sent|partial with a
-- past due date), never stored. Convert any legacy stored value back to the
-- underlying money state so the derivation owns it from here on.
UPDATE "Invoice" SET "status" = 'sent' WHERE "status" = 'overdue' AND "paidCents" = 0;
UPDATE "Invoice" SET "status" = 'partial' WHERE "status" = 'overdue' AND "paidCents" > 0;
