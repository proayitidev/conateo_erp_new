/*
  Warnings:

  - You are about to drop the `HomolocationFacture` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[factureId]` on the table `HomologationApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FactureStatus" AS ENUM ('CREATED', 'SENT', 'PAID', 'OVERDUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "FactureType" AS ENUM ('HOMOLOGATION', 'RADIODIFUSION');

-- CreateEnum
CREATE TYPE "RadioApplicationStatus" AS ENUM ('PENDING', 'CANCELED', 'APPROVED', 'REJECTED', 'PENDING_PAYMENT', 'PAYMENT_RECEIVED', 'PENDING_INSPECTION', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED', 'INSPECTION_FAILED', 'PENDING_CERTIFICATE', 'CERTIFICATE_ISSUED', 'PENDING_RENEWAL', 'RENEWED');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('ATTESTATION', 'FREQUENCY_ALLOCATION', 'STATION_LICENSE');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StationType" AS ENUM ('AM', 'FM', 'TV');

-- CreateEnum
CREATE TYPE "PersonnelRole" AS ENUM ('OWNER', 'MANAGER');

-- CreateEnum
CREATE TYPE "RadioStationLicenceStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'IN_RENEW');

-- DropForeignKey
ALTER TABLE "HomolocationFacture" DROP CONSTRAINT "HomolocationFacture_homologationApplicationId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "radioApplicationId" TEXT,
ADD COLUMN     "stationInspectionId" TEXT;

-- AlterTable
ALTER TABLE "HomologationApplication" ADD COLUMN     "factureId" INTEGER;

-- DropTable
DROP TABLE "HomolocationFacture";

-- CreateTable
CREATE TABLE "Facture" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "FactureStatus" NOT NULL DEFAULT 'CREATED',
    "type" "FactureType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioStation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stationCode" TEXT NOT NULL,
    "type" "StationType" NOT NULL,
    "nif" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "patente" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "site_web" TEXT,
    "coverageZone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequencyBand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startFreq" DOUBLE PRECISION NOT NULL,
    "endFreq" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'MHz',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrequencyBand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequencyAllocation" (
    "id" TEXT NOT NULL,
    "frequencyBandId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "startFreq" DOUBLE PRECISION NOT NULL,
    "endFreq" DOUBLE PRECISION NOT NULL,
    "power" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'MHz',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrequencyAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationPersonnel" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "role" "PersonnelRole" NOT NULL,
    "nin" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationPersonnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageZone" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverageZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioApplication" (
    "id" TEXT NOT NULL,
    "status" "RadioApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "stationId" TEXT NOT NULL,
    "requestType" "CertificateType" NOT NULL,
    "description" TEXT,
    "paymentStatus" "RadioApplicationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "inspectionStatus" "RadioApplicationStatus" NOT NULL DEFAULT 'PENDING_INSPECTION',
    "inspectionId" TEXT,
    "signatureName" TEXT,
    "signatureDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioFacture" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'HTG',
    "status" "FactureStatus" NOT NULL DEFAULT 'CREATED',
    "applicationId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "year" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioFacture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioCertificate" (
    "id" TEXT NOT NULL,
    "certificateType" "CertificateType" NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "frequencies" TEXT NOT NULL,
    "power" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateRenewal" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "newExpiryDate" TIMESTAMP(3) NOT NULL,
    "factureId" TEXT,
    "inspectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CertificateRenewal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationInspection" (
    "id" TEXT NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'PENDING',
    "stationId" TEXT NOT NULL,
    "applicationId" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "inspectionDate" TIMESTAMP(3),
    "inspectorName" TEXT,
    "inspectorNotes" TEXT,
    "result" TEXT,
    "passed" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioStationD" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stationCode" TEXT NOT NULL,
    "type" "StationType" NOT NULL,
    "nif" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "patente" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "site_web" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioStationD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationFrequence" (
    "id" SERIAL NOT NULL,
    "frequence" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "power" TEXT NOT NULL,
    "assign_date" TIMESTAMP(3) NOT NULL,
    "radioStationDId" TEXT NOT NULL,

    CONSTRAINT "StationFrequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationEmetteur" (
    "id" SERIAL NOT NULL,
    "fabricant" TEXT NOT NULL,
    "modèle" TEXT NOT NULL,
    "SN" TEXT NOT NULL,
    "nominal_power" TEXT NOT NULL,
    "installatinDate" TIMESTAMP(3) NOT NULL,
    "radioStationDId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationEmetteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioStationLicence" (
    "id" INTEGER NOT NULL,
    "autorisationType" TEXT NOT NULL,
    "deliverDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "Statut" "RadioStationLicenceStatus" NOT NULL,
    "radioStationDId" TEXT,

    CONSTRAINT "RadioStationLicence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redevance" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "statut" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentRef" TEXT,
    "radioStationDId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Redevance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioInspection" (
    "id" SERIAL NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "inspecteurId" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "mesuresCorrectives" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "radioStationDId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioInspection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RadioStation_stationCode_key" ON "RadioStation"("stationCode");

-- CreateIndex
CREATE UNIQUE INDEX "RadioApplication_inspectionId_key" ON "RadioApplication"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "RadioCertificate_certificateNumber_key" ON "RadioCertificate"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateRenewal_inspectionId_key" ON "CertificateRenewal"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "RadioStationD_stationCode_key" ON "RadioStationD"("stationCode");

-- CreateIndex
CREATE UNIQUE INDEX "StationFrequence_radioStationDId_key" ON "StationFrequence"("radioStationDId");

-- CreateIndex
CREATE UNIQUE INDEX "StationFrequence_frequence_department_key" ON "StationFrequence"("frequence", "department");

-- CreateIndex
CREATE UNIQUE INDEX "HomologationApplication_factureId_key" ON "HomologationApplication"("factureId");

-- AddForeignKey
ALTER TABLE "HomologationApplication" ADD CONSTRAINT "HomologationApplication_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_radioApplicationId_fkey" FOREIGN KEY ("radioApplicationId") REFERENCES "RadioApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_stationInspectionId_fkey" FOREIGN KEY ("stationInspectionId") REFERENCES "StationInspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequencyAllocation" ADD CONSTRAINT "FrequencyAllocation_frequencyBandId_fkey" FOREIGN KEY ("frequencyBandId") REFERENCES "FrequencyBand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrequencyAllocation" ADD CONSTRAINT "FrequencyAllocation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "RadioApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationPersonnel" ADD CONSTRAINT "StationPersonnel_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "RadioStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverageZone" ADD CONSTRAINT "CoverageZone_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "RadioStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioApplication" ADD CONSTRAINT "RadioApplication_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "RadioStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioApplication" ADD CONSTRAINT "RadioApplication_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "StationInspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioFacture" ADD CONSTRAINT "RadioFacture_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "RadioApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioCertificate" ADD CONSTRAINT "RadioCertificate_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "RadioStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioCertificate" ADD CONSTRAINT "RadioCertificate_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "RadioApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateRenewal" ADD CONSTRAINT "CertificateRenewal_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "RadioCertificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateRenewal" ADD CONSTRAINT "CertificateRenewal_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "RadioApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateRenewal" ADD CONSTRAINT "CertificateRenewal_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "RadioFacture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateRenewal" ADD CONSTRAINT "CertificateRenewal_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "StationInspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationInspection" ADD CONSTRAINT "StationInspection_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "RadioStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationFrequence" ADD CONSTRAINT "StationFrequence_radioStationDId_fkey" FOREIGN KEY ("radioStationDId") REFERENCES "RadioStationD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationEmetteur" ADD CONSTRAINT "StationEmetteur_radioStationDId_fkey" FOREIGN KEY ("radioStationDId") REFERENCES "RadioStationD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioStationLicence" ADD CONSTRAINT "RadioStationLicence_radioStationDId_fkey" FOREIGN KEY ("radioStationDId") REFERENCES "RadioStationD"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redevance" ADD CONSTRAINT "Redevance_radioStationDId_fkey" FOREIGN KEY ("radioStationDId") REFERENCES "RadioStationD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioInspection" ADD CONSTRAINT "RadioInspection_inspecteurId_fkey" FOREIGN KEY ("inspecteurId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioInspection" ADD CONSTRAINT "RadioInspection_radioStationDId_fkey" FOREIGN KEY ("radioStationDId") REFERENCES "RadioStationD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
