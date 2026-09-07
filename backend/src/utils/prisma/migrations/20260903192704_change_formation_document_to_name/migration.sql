/*
  Warnings:

  - You are about to drop the column `formationId` on the `Documents` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_formationId_fkey";

-- DropIndex
DROP INDEX "Documents_formationId_key";

-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "formationId";

-- AlterTable
ALTER TABLE "formations" ADD COLUMN     "documentName" TEXT;
