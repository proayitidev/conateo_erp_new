/*
  Warnings:

  - You are about to drop the `FormationEmp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormationPersonnels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EmployeeToFormationEmp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FormationPersonnels" DROP CONSTRAINT "FormationPersonnels_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "FormationPersonnels" DROP CONSTRAINT "FormationPersonnels_formationEmpId_fkey";

-- DropForeignKey
ALTER TABLE "_EmployeeToFormationEmp" DROP CONSTRAINT "_EmployeeToFormationEmp_A_fkey";

-- DropForeignKey
ALTER TABLE "_EmployeeToFormationEmp" DROP CONSTRAINT "_EmployeeToFormationEmp_B_fkey";

-- DropTable
DROP TABLE "FormationEmp";

-- DropTable
DROP TABLE "FormationPersonnels";

-- DropTable
DROP TABLE "_EmployeeToFormationEmp";

-- CreateTable
CREATE TABLE "EmpTraining" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "place" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingOrganizers" (
    "type" "FormationPersonnelType" NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "EmpTrainingId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EmpTrainingToEmployee" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmpTrainingToEmployee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingOrganizers_employeeId_EmpTrainingId_key" ON "TrainingOrganizers"("employeeId", "EmpTrainingId");

-- CreateIndex
CREATE INDEX "_EmpTrainingToEmployee_B_index" ON "_EmpTrainingToEmployee"("B");

-- AddForeignKey
ALTER TABLE "TrainingOrganizers" ADD CONSTRAINT "TrainingOrganizers_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingOrganizers" ADD CONSTRAINT "TrainingOrganizers_EmpTrainingId_fkey" FOREIGN KEY ("EmpTrainingId") REFERENCES "EmpTraining"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmpTrainingToEmployee" ADD CONSTRAINT "_EmpTrainingToEmployee_A_fkey" FOREIGN KEY ("A") REFERENCES "EmpTraining"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmpTrainingToEmployee" ADD CONSTRAINT "_EmpTrainingToEmployee_B_fkey" FOREIGN KEY ("B") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
