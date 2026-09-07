-- CreateEnum
CREATE TYPE "RadioDiffusionDocumentType" AS ENUM ('LICENCE', 'DOSSIER_TECHNIQUE', 'RAPPORT_INSPECTION', 'CORRESPONDANCE', 'CERTIFICAT_TECHNIQUE', 'AUTRE');

-- CreateTable
CREATE TABLE "RadioDiffusionDocument" (
    "id" SERIAL NOT NULL,
    "type" "RadioDiffusionDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" DOUBLE PRECISION NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "radioStationDId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadioDiffusionDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RadioDiffusionDocument" ADD CONSTRAINT "RadioDiffusionDocument_radioStationDId_fkey" FOREIGN KEY ("radioStationDId") REFERENCES "RadioStationD"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
