-- CreateEnum
CREATE TYPE "FormationPersonnelType" AS ENUM ('INSTRUCTOR', 'PROTOCOLE');

-- AlterTable
ALTER TABLE "AppModule" ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "FormationEmp" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "place" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormationEmp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormationPersonnels" (
    "type" "FormationPersonnelType" NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "formationEmpId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_EmployeeToFormationEmp" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EmployeeToFormationEmp_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormationPersonnels_employeeId_formationEmpId_key" ON "FormationPersonnels"("employeeId", "formationEmpId");

-- CreateIndex
CREATE INDEX "_EmployeeToFormationEmp_B_index" ON "_EmployeeToFormationEmp"("B");

-- AddForeignKey
ALTER TABLE "FormationPersonnels" ADD CONSTRAINT "FormationPersonnels_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormationPersonnels" ADD CONSTRAINT "FormationPersonnels_formationEmpId_fkey" FOREIGN KEY ("formationEmpId") REFERENCES "FormationEmp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToFormationEmp" ADD CONSTRAINT "_EmployeeToFormationEmp_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToFormationEmp" ADD CONSTRAINT "_EmployeeToFormationEmp_B_fkey" FOREIGN KEY ("B") REFERENCES "FormationEmp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
