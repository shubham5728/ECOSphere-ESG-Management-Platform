-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CsrActivity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "maxParticipants" INTEGER,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "pointsReward" INTEGER NOT NULL DEFAULT 100,
    "departmentId" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CsrActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "csrActivityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proofUrl" TEXT,
    "proofNote" TEXT,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMetric" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "femaleCount" INTEGER NOT NULL DEFAULT 0,
    "trainingHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "safetyIncidents" INTEGER NOT NULL DEFAULT 0,
    "volunteerHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participation_csrActivityId_userId_key" ON "Participation"("csrActivityId", "userId");

-- AddForeignKey
ALTER TABLE "CsrActivity" ADD CONSTRAINT "CsrActivity_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_csrActivityId_fkey" FOREIGN KEY ("csrActivityId") REFERENCES "CsrActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMetric" ADD CONSTRAINT "SocialMetric_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
