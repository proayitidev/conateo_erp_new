/*
  Warnings:

  - You are about to drop the `Application` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_equipmentId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_representativeId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_applicationId_fkey";

-- DropTable
DROP TABLE "Application";

-- CreateTable
CREATE TABLE "HomologationApplication" (
    "id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "applicantId" TEXT NOT NULL,
    "representativeId" TEXT,
    "equipmentId" TEXT NOT NULL,
    "signatureName" TEXT,
    "signatureDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomologationApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HomologationApplication" ADD CONSTRAINT "HomologationApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomologationApplication" ADD CONSTRAINT "HomologationApplication_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomologationApplication" ADD CONSTRAINT "HomologationApplication_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "HomologationApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
