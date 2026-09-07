/*
  Warnings:

  - You are about to drop the `Holiday` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Holiday" DROP CONSTRAINT "Holiday_employeeId_fkey";

-- DropTable
DROP TABLE "Holiday";

-- DropEnum
DROP TYPE "LeavingType";

-- DropEnum
DROP TYPE "Status";
