-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "hoaContactEmail" TEXT,
ADD COLUMN     "hoaContactName" TEXT,
ADD COLUMN     "hoaContactPhone" TEXT,
ADD COLUMN     "hoaName" TEXT,
ADD COLUMN     "hoaNotes" TEXT,
ADD COLUMN     "hoaRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hoaSubmissionUrl" TEXT;
