/*
  Warnings:

  - Changed the type of `type` on the `TrainingOrganizers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrganizerType" AS ENUM ('INSTRUCTOR', 'PROTOCOLE');

-- DropForeignKey
ALTER TABLE "Authentification" DROP CONSTRAINT "Authentification_userId_fkey";

-- AlterTable
ALTER TABLE "TrainingOrganizers" DROP COLUMN "type",
ADD COLUMN     "type" "OrganizerType" NOT NULL;

-- DropEnum
DROP TYPE "FormationPersonnelType";

-- AddForeignKey
ALTER TABLE "Authentification" ADD CONSTRAINT "Authentification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
