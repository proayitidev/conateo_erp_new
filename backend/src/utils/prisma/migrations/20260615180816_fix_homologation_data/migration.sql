/*
  Warnings:

  - You are about to drop the column `applicantId` on the `HomologationApplication` table. All the data in the column will be lost.
  - Added the required column `manufacturerId` to the `HomologationApplication` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HomologationApplication" DROP CONSTRAINT "HomologationApplication_applicantId_fkey";

-- AlterTable
ALTER TABLE "HomologationApplication" DROP COLUMN "applicantId",
ADD COLUMN     "manufacturerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "HomologationApplication" ADD CONSTRAINT "HomologationApplication_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
