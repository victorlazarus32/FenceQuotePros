-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "companyName" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "logoUrl" TEXT,
    "licenseNumber" TEXT,
    "qualifierLast4" TEXT,
    "signatureDataUrl" TEXT,
    "signatureName" TEXT,
    "signatureSavedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "folioNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "notes" TEXT,
    "terms" TEXT,
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "depositMode" TEXT NOT NULL DEFAULT 'percent',
    "depositPercent" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "depositFixedCents" INTEGER NOT NULL DEFAULT 0,
    "shareToken" TEXT,
    "signedAt" TIMESTAMP(3),
    "signatureDataUrl" TEXT,
    "signedByName" TEXT,
    "signedIp" TEXT,
    "signedUserAgent" TEXT,
    "permitDocsAutoTrigger" BOOLEAN NOT NULL DEFAULT true,
    "permitDocsTriggeredAt" TIMESTAMP(3),
    "permitValueOfWorkCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "estimateId" TEXT,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "terms" TEXT,
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "paidCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT,
    "invoiceId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'ea',
    "unitPriceCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FenceJob" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "fenceType" TEXT NOT NULL,
    "heightFeet" DOUBLE PRECISION NOT NULL,
    "linearFeet" DOUBLE PRECISION NOT NULL,
    "postSpacingFeet" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "numGatesSingle" INTEGER NOT NULL DEFAULT 0,
    "numGatesDouble" INTEGER NOT NULL DEFAULT 0,
    "numCorners" INTEGER NOT NULL DEFAULT 0,
    "numEnds" INTEGER NOT NULL DEFAULT 2,
    "removeExisting" BOOLEAN NOT NULL DEFAULT false,
    "removeLinearFeet" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "haulAway" BOOLEAN NOT NULL DEFAULT true,
    "terrain" TEXT NOT NULL DEFAULT 'flat',
    "soilType" TEXT NOT NULL DEFAULT 'sand',
    "access" TEXT NOT NULL DEFAULT 'easy',
    "poolAdjacent" BOOLEAN NOT NULL DEFAULT false,
    "hvhz" BOOLEAN NOT NULL DEFAULT false,
    "style" TEXT,
    "color" TEXT,
    "finishedSide" TEXT,
    "gateStyle" TEXT NOT NULL DEFAULT 'swing_walk',
    "gateMotor" TEXT NOT NULL DEFAULT 'none',
    "permitRequired" BOOLEAN NOT NULL DEFAULT false,
    "permitCents" INTEGER NOT NULL DEFAULT 0,
    "engineeringRequired" BOOLEAN NOT NULL DEFAULT false,
    "engineeringCents" INTEGER NOT NULL DEFAULT 0,
    "laborMode" TEXT NOT NULL DEFAULT 'per_foot',
    "laborRatePerFootCents" INTEGER NOT NULL DEFAULT 0,
    "laborRatePerHourCents" INTEGER NOT NULL DEFAULT 0,
    "crewSize" INTEGER NOT NULL DEFAULT 2,
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginMode" TEXT NOT NULL DEFAULT 'percent',
    "marginPercent" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "marginFixedCents" INTEGER NOT NULL DEFAULT 0,
    "marginMinimumCents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "FenceJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'cash',
    "reference" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estimateId" TEXT,
    "kind" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "fromAddress" TEXT,
    "subject" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "providerId" TEXT,
    "errorMessage" TEXT,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateView" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstimateView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyPhoto" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "angleLabel" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FenceVisualization" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "maskKey" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "resultKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "provider" TEXT NOT NULL,
    "costCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "FenceVisualization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "estimateId" TEXT,
    "emailMessageId" TEXT,
    "channels" TEXT NOT NULL DEFAULT 'in_app',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateDocument" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "templateSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "fieldValues" TEXT,
    "ownerSignedAt" TIMESTAMP(3),
    "ownerSignatureDataUrl" TEXT,
    "ownerSignedByName" TEXT,
    "ownerSignedIp" TEXT,
    "ownerSignedUserAgent" TEXT,
    "contractorSignedAt" TIMESTAMP(3),
    "contractorSignatureDataUrl" TEXT,
    "contractorSignedByName" TEXT,
    "generatedPdfKey" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstimateDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_shareToken_key" ON "Estimate"("shareToken");

-- CreateIndex
CREATE INDEX "Estimate_userId_status_idx" ON "Estimate"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_estimateId_key" ON "Invoice"("estimateId");

-- CreateIndex
CREATE INDEX "Invoice_userId_status_idx" ON "Invoice"("userId", "status");

-- CreateIndex
CREATE INDEX "EmailMessage_userId_queuedAt_idx" ON "EmailMessage"("userId", "queuedAt");

-- CreateIndex
CREATE INDEX "EmailMessage_estimateId_idx" ON "EmailMessage"("estimateId");

-- CreateIndex
CREATE INDEX "EstimateView_estimateId_viewedAt_idx" ON "EstimateView"("estimateId", "viewedAt");

-- CreateIndex
CREATE INDEX "PropertyPhoto_estimateId_idx" ON "PropertyPhoto"("estimateId");

-- CreateIndex
CREATE INDEX "FenceVisualization_photoId_status_idx" ON "FenceVisualization"("photoId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "EstimateDocument_estimateId_idx" ON "EstimateDocument"("estimateId");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateDocument_estimateId_templateSlug_key" ON "EstimateDocument"("estimateId", "templateSlug");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FenceJob" ADD CONSTRAINT "FenceJob_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateView" ADD CONSTRAINT "EstimateView_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyPhoto" ADD CONSTRAINT "PropertyPhoto_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FenceVisualization" ADD CONSTRAINT "FenceVisualization_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "PropertyPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateDocument" ADD CONSTRAINT "EstimateDocument_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
