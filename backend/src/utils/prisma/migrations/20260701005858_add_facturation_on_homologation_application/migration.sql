/*
  Warnings:

  - A unique constraint covering the columns `[homologationApplicationId]` on the table `HomolocationFacture` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `HomolocationFacture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homologationApplicationId` to the `HomolocationFacture` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('HTG', 'USD');

-- AlterTable
ALTER TABLE "HomolocationFacture" ADD COLUMN     "currency" "Currency" NOT NULL,
ADD COLUMN     "homologationApplicationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "HomolocationFacture_homologationApplicationId_key" ON "HomolocationFacture"("homologationApplicationId");

-- AddForeignKey
ALTER TABLE "HomolocationFacture" ADD CONSTRAINT "HomolocationFacture_homologationApplicationId_fkey" FOREIGN KEY ("homologationApplicationId") REFERENCES "HomologationApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
