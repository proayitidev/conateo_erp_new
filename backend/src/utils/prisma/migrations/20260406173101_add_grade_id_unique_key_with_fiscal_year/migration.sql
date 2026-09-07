/*
  Warnings:

  - A unique constraint covering the columns `[type,gradeId,fiscalYear]` on the table `fees` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "fees_type_gradeId_key";

-- CreateIndex
CREATE UNIQUE INDEX "fees_type_gradeId_fiscalYear_key" ON "fees"("type", "gradeId", "fiscalYear");
