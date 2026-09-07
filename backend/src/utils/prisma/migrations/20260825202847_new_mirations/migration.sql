/*
  Warnings:

  - The values [RADIODIFUSION] on the enum `FactureType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `amount` on the `Facture` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Facture` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Facture` table. All the data in the column will be lost.
  - You are about to drop the `Redevance` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TypeResponsable" AS ENUM ('gerantResponsble', 'responsable_tech');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('commercial', 'communautaire', 'religieux');

-- CreateEnum
CREATE TYPE "EquipementType" AS ENUM ('emetteur', 'stl', 'antenne');

-- AlterEnum
BEGIN;
CREATE TYPE "FactureType_new" AS ENUM ('DOUANE', 'HOMOLOGATION', 'SHORTCODE', 'RADIOTELEDIFFUSION', 'NUMEROTATION_PNN', 'FRAIS_PROCEDURE_RADIO', 'FRAIS_PROCEDURE_CHANGEMENT_NOM', 'FRAIS_PROCEDURE_CHANGEMENT_GERANT', 'FRAIS_PROCEDURE_VERIFICATION', 'FRAIS_PROCEDURE_INSPECTION', 'CONCESSION', 'FNE', 'APPPEL_SORTANT', 'FRAIS_RADIO_AMATEUR');
ALTER TABLE "Facture" ALTER COLUMN "type" TYPE "FactureType_new" USING ("type"::text::"FactureType_new");
ALTER TYPE "FactureType" RENAME TO "FactureType_old";
ALTER TYPE "FactureType_new" RENAME TO "FactureType";
DROP TYPE "public"."FactureType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Redevance" DROP CONSTRAINT "Redevance_radioStationDId_fkey";

-- AlterTable
ALTER TABLE "Facture" DROP COLUMN "amount",
DROP COLUMN "currency",
DROP COLUMN "dueDate",
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentRef" TEXT;

-- DropTable
DROP TABLE "Redevance";

-- CreateTable
CREATE TABLE "FactureFrequence" (
    "id" SERIAL NOT NULL,
    "factureId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "nomGerant" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "frequencie" TEXT NOT NULL,
    "departement" TEXT NOT NULL,
    "anneeFiscal" TEXT NOT NULL,
    "redevances" DOUBLE PRECISION NOT NULL,
    "stl" DOUBLE PRECISION NOT NULL,
    "certificat" DOUBLE PRECISION NOT NULL,
    "operateur" DOUBLE PRECISION NOT NULL,
    "vignette" DOUBLE PRECISION NOT NULL,
    "stationFrequenceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactureFrequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "NIF" TEXT NOT NULL,
    "noReferenceMC" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "stationLocalisationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationInfo" (
    "id" SERIAL NOT NULL,
    "adresse" TEXT NOT NULL,
    "patente" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "departement" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "email" TEXT,
    "webcasting" BOOLEAN NOT NULL DEFAULT false,
    "gerantId" INTEGER,
    "respTechId" INTEGER,
    "stationLicenceId" TEXT,
    "frequenciesId" TEXT,
    "stationLocalisationId" INTEGER,
    "type" "StationType" NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stationId" TEXT,

    CONSTRAINT "StationInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stationAddress" (
    "id" SERIAL NOT NULL,
    "adresse" TEXT NOT NULL,
    "patente" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "departement" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "stationAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioManager" (
    "id" SERIAL NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "nifNinu" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "type" "TypeResponsable" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationLicence" (
    "id" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "validity" TEXT,
    "expirationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationLicence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frequencies" (
    "id" TEXT NOT NULL,
    "frequece_canal" TEXT,
    "puissance_autorise" TEXT NOT NULL,
    "frequence_stl" TEXT NOT NULL,
    "date_assination" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Frequencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationLocalisation" (
    "id" SERIAL NOT NULL,
    "adresse_Studio" TEXT NOT NULL,
    "emplacement_site_emission" TEXT,
    "longiture" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "altitude" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationLocalisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationEquimenent" (
    "id" SERIAL NOT NULL,
    "type" "EquipementType" NOT NULL,
    "fabricant" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "no_serie" TEXT NOT NULL,
    "frequence" TEXT,
    "stationAntenneId" TEXT,
    "stationInfoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationEquimenent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationAntenne" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "gain_db" TEXT,
    "polarisation" TEXT,
    "hauteur_sol_m" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StationAntenne_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FactureFrequence" ADD CONSTRAINT "FactureFrequence_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactureFrequence" ADD CONSTRAINT "FactureFrequence_stationFrequenceId_fkey" FOREIGN KEY ("stationFrequenceId") REFERENCES "StationFrequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationInfo" ADD CONSTRAINT "StationInfo_gerantId_fkey" FOREIGN KEY ("gerantId") REFERENCES "RadioManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationInfo" ADD CONSTRAINT "StationInfo_respTechId_fkey" FOREIGN KEY ("respTechId") REFERENCES "RadioManager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationInfo" ADD CONSTRAINT "StationInfo_stationLicenceId_fkey" FOREIGN KEY ("stationLicenceId") REFERENCES "StationLicence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationInfo" ADD CONSTRAINT "StationInfo_frequenciesId_fkey" FOREIGN KEY ("frequenciesId") REFERENCES "Frequencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationInfo" ADD CONSTRAINT "StationInfo_stationLocalisationId_fkey" FOREIGN KEY ("stationLocalisationId") REFERENCES "StationLocalisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationInfo" ADD CONSTRAINT "StationInfo_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationEquimenent" ADD CONSTRAINT "StationEquimenent_stationAntenneId_fkey" FOREIGN KEY ("stationAntenneId") REFERENCES "StationAntenne"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationEquimenent" ADD CONSTRAINT "StationEquimenent_stationInfoId_fkey" FOREIGN KEY ("stationInfoId") REFERENCES "StationInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
