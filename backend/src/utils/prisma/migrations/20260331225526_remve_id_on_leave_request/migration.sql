/*
  Warnings:

  - You are about to drop the column `documentId` on the `EmployeeLeavesRequest` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employeeLeavesRequestId]` on the table `Documents` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "EmployeeLeavesRequest" DROP CONSTRAINT "EmployeeLeavesRequest_documentId_fkey";

-- DropIndex
DROP INDEX "EmployeeLeavesRequest_documentId_key";

-- AlterTable
ALTER TABLE "Documents" ADD COLUMN     "employeeLeavesRequestId" INTEGER;

-- AlterTable
ALTER TABLE "EmployeeLeavesRequest" DROP COLUMN "documentId";

-- CreateIndex
CREATE UNIQUE INDEX "Documents_employeeLeavesRequestId_key" ON "Documents"("employeeLeavesRequestId");

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_employeeLeavesRequestId_fkey" FOREIGN KEY ("employeeLeavesRequestId") REFERENCES "EmployeeLeavesRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
