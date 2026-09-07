/*
  Warnings:

  - A unique constraint covering the columns `[attestationRequestId]` on the table `Documents` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "typeDocumentType" ADD VALUE 'ATTESTATION';

-- AlterTable
ALTER TABLE "Documents" ADD COLUMN     "attestationRequestId" INTEGER;

-- CreateTable
CREATE TABLE "AttestationRequest" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "status" "DocumentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttestationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Documents_attestationRequestId_key" ON "Documents"("attestationRequestId");

-- AddForeignKey
ALTER TABLE "AttestationRequest" ADD CONSTRAINT "AttestationRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_attestationRequestId_fkey" FOREIGN KEY ("attestationRequestId") REFERENCES "AttestationRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
