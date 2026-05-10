-- AlterTable
ALTER TABLE "FenceJob" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "crewId" TEXT,
ADD COLUMN     "installStatus" TEXT NOT NULL DEFAULT 'unscheduled',
ADD COLUMN     "scheduledDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Crew" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorTag" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Crew_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Crew_userId_active_idx" ON "Crew"("userId", "active");

-- CreateIndex
CREATE INDEX "FenceJob_scheduledDate_idx" ON "FenceJob"("scheduledDate");

-- CreateIndex
CREATE INDEX "FenceJob_crewId_idx" ON "FenceJob"("crewId");

-- AddForeignKey
ALTER TABLE "FenceJob" ADD CONSTRAINT "FenceJob_crewId_fkey" FOREIGN KEY ("crewId") REFERENCES "Crew"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crew" ADD CONSTRAINT "Crew_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
