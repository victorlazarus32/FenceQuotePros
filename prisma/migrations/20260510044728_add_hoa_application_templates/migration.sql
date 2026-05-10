-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "hoaTemplateId" TEXT;

-- AlterTable
ALTER TABLE "EstimateDocument" ADD COLUMN     "hoaTemplateId" TEXT;

-- CreateTable
CREATE TABLE "HoaApplicationTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pdfStorageKey" TEXT NOT NULL,
    "pdfFilename" TEXT NOT NULL,
    "fieldMappings" TEXT NOT NULL DEFAULT '[]',
    "ownerSignatureFieldName" TEXT,
    "contractorSignatureFieldName" TEXT,
    "requiresOwnerSignature" BOOLEAN NOT NULL DEFAULT true,
    "requiresContractorSignature" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HoaApplicationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HoaApplicationTemplate_userId_idx" ON "HoaApplicationTemplate"("userId");

-- CreateIndex
CREATE INDEX "Client_hoaTemplateId_idx" ON "Client"("hoaTemplateId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_hoaTemplateId_fkey" FOREIGN KEY ("hoaTemplateId") REFERENCES "HoaApplicationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoaApplicationTemplate" ADD CONSTRAINT "HoaApplicationTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateDocument" ADD CONSTRAINT "EstimateDocument_hoaTemplateId_fkey" FOREIGN KEY ("hoaTemplateId") REFERENCES "HoaApplicationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
