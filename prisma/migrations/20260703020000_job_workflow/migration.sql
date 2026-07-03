-- AlterTable
ALTER TABLE "Estimate" ADD COLUMN     "workflowStatus" TEXT NOT NULL DEFAULT 'intake',
ADD COLUMN     "workflowClosedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Estimate_userId_workflowStatus_idx" ON "Estimate"("userId", "workflowStatus");

-- CreateTable
CREATE TABLE "WorkflowEvent" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowEvent_estimateId_createdAt_idx" ON "WorkflowEvent"("estimateId", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkflowEvent" ADD CONSTRAINT "WorkflowEvent_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "JobTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "auto" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobTask_userId_completedAt_idx" ON "JobTask"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "JobTask_estimateId_idx" ON "JobTask"("estimateId");

-- AddForeignKey
ALTER TABLE "JobTask" ADD CONSTRAINT "JobTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTask" ADD CONSTRAINT "JobTask_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: give existing estimates a sensible starting stage from
-- their document status so the pipeline isn't all "intake" on day one.
UPDATE "Estimate" SET "workflowStatus" = 'quote_sent' WHERE "status" = 'sent';
UPDATE "Estimate" SET "workflowStatus" = 'accepted'   WHERE "status" = 'accepted';
UPDATE "Estimate" SET "workflowStatus" = 'closed_lost', "workflowClosedAt" = NOW() WHERE "status" = 'declined';
