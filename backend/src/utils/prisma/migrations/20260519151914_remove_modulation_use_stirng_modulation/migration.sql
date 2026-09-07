/*
  Warnings:

  - You are about to drop the `Modulation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EquipmentToModulation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `modulations` to the `Equipment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationMode" AS ENUM ('ALL', 'USER', 'MODULE', 'SERVICE');

-- DropForeignKey
ALTER TABLE "_EquipmentToModulation" DROP CONSTRAINT "_EquipmentToModulation_A_fkey";

-- DropForeignKey
ALTER TABLE "_EquipmentToModulation" DROP CONSTRAINT "_EquipmentToModulation_B_fkey";

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "modulations" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "mode" "NotificationMode" NOT NULL DEFAULT 'ALL';

-- DropTable
DROP TABLE "Modulation";

-- DropTable
DROP TABLE "_EquipmentToModulation";

-- CreateTable
CREATE TABLE "digitalSignature" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "signaturePath" TEXT NOT NULL,
    "oneTimeToken" TEXT NOT NULL,
    "publicCertificate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digitalSignature_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "digitalSignature" ADD CONSTRAINT "digitalSignature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
