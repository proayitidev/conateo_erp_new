/*
  Warnings:

  - The values [IN_REVIEW,APPROVED,REJECTED] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "FactureSTatus" AS ENUM ('PENDING', 'PAID');

-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('PENDING', 'CANCELED', 'CLOSED', 'MISSING_DOCUMENTS', 'PENDING_CERTIFICATE', 'PENDING_INVOICE', 'PENDING_APPROVAL_FORM', 'PENDING_PAYMENT', 'INVOICE_PAID');
ALTER TABLE "public"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- CreateTable
CREATE TABLE "HomolocationFacture" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "FactureSTatus" NOT NULL DEFAULT 'PAID',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomolocationFacture_pkey" PRIMARY KEY ("id")
);
