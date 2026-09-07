-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('ASSURANCE', 'GAZ', 'DEBITCARD');

-- CreateEnum
CREATE TYPE "AmountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('READ', 'CREATE', 'EDIT', 'DELETE', 'UPLOAD', 'DOWNLOAD', 'APPROVE');

-- CreateEnum
CREATE TYPE "AffectationType" AS ENUM ('DIRECTION', 'SECTION', 'SERVICE', 'UNITÉ');

-- CreateEnum
CREATE TYPE "AuthentificationType" AS ENUM ('NEWuSER', 'CHANGEPASSWORD');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('ON_NET', 'OFF_NET', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('create', 'signature', 'approval');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('pending', 'approved', 'signed', 'rejected');

-- CreateEnum
CREATE TYPE "typeDocumentType" AS ENUM ('ARCHIVAGE', 'TRAINING', 'MOVEMENT', 'LEAVES');

-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('STAGIAIRE', 'CONTRACTUAL', 'FONCTIONNAIRE');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE');

-- CreateEnum
CREATE TYPE "FormationType" AS ENUM ('LICENSE', 'DIPLOME', 'CERTIFICATE', 'MASTER', 'DOCTOR');

-- CreateEnum
CREATE TYPE "EmployeeStateType" AS ENUM ('NON_ACTIF', 'ACTIF', 'ON_LEAVE', 'SUSPENDED', 'RETIRED');

-- CreateEnum
CREATE TYPE "PresenceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "LeavingType" AS ENUM ('ANNUAL_LEAVE', 'PATERNITY_LEAVE', 'SPECIAL_LEAVE', 'MATERNITY_LEAVE', 'SICK_LEAVE', 'STUDY_LEAVE', 'OTHER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TECHNICAL_SPECS', 'TEST_REPORTS', 'FCC_CE_CERTIFICATE', 'AUTHORIZATION_LETTER', 'PHOTO_EQUIPMENT');

-- CreateEnum
CREATE TYPE "LeavePolicyType" AS ENUM ('ANNUAL', 'SPECIAL', 'TRAINING', 'PARENTAL', 'MATERNITY', 'SICK', 'LONG_LASTING');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('USER', 'USER_PASSWORD', 'ROLE', 'PRIVILEGE', 'NUMERISATION', 'DOCUMENYTYPE', 'AFFECTATION');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('SIGNOUT', 'SIGNIN', 'CREATE', 'UPDATE', 'DELETE', 'SIGNED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('DOTATION', 'MUTATION', 'PROMOTION', 'CESSATION');

-- CreateEnum
CREATE TYPE "DotationType" AS ENUM ('CONTRACT', 'STAGE', 'NOMINATION');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MESSAGE', 'ALERT', 'REMINDER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'AWATING_ACTIVATION', 'SUSPENDED', 'CLOSED');

-- CreateTable
CREATE TABLE "grille_salarial" (
    "id" SERIAL NOT NULL,
    "minSalary" DOUBLE PRECISION NOT NULL,
    "maxSalary" DOUBLE PRECISION NOT NULL,
    "levelData" DOUBLE PRECISION,
    "fiscalYear" INTEGER NOT NULL DEFAULT 2024,
    "prevGradeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grille_salarial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fees" (
    "id" SERIAL NOT NULL,
    "type" "FeeType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "amountType" "AmountType" NOT NULL,
    "gradeId" INTEGER NOT NULL,

    CONSTRAINT "fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryAdjustment" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "adjustmentDate" TIMESTAMP(3) NOT NULL,
    "employeeStatusId" INTEGER,

    CONSTRAINT "SalaryAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePriv" (
    "roleId" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL,
    "privilegeId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ModulePriv" (
    "roleId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DocumentPriv" (
    "roleId" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL,
    "typeDocumentId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Privileges" (
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Privileges_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "AppModule" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "AppModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affectation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sigle" TEXT NOT NULL,
    "type" "AffectationType" NOT NULL,
    "leaderId" INTEGER,
    "parentId" INTEGER,

    CONSTRAINT "Affectation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authentification" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "AuthentificationType" NOT NULL,
    "otp" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Authentification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatorCallPrice" (
    "id" SERIAL NOT NULL,
    "operatorId" INTEGER NOT NULL,
    "on_net" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "off_net" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "international" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperatorCallPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facturation" (
    "id" SERIAL NOT NULL,
    "callType" "CallType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "operatorName" TEXT NOT NULL,
    "operatorPrice" DOUBLE PRECISION NOT NULL,
    "callerNumber" TEXT NOT NULL,
    "calledNumber" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "startBalance" DOUBLE PRECISION NOT NULL,
    "endBalance" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "callCost" DOUBLE PRECISION NOT NULL,
    "callCostPerMin" DOUBLE PRECISION,
    "variation" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facturation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeDocuments" (
    "id" SERIAL NOT NULL,
    "type" "typeDocumentType" NOT NULL DEFAULT 'ARCHIVAGE',
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "templatePath" TEXT,
    "affectationId" INTEGER,
    "template" TEXT,

    CONSTRAINT "TypeDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentRoute" (
    "id" SERIAL NOT NULL,
    "type" "ApprovalType" NOT NULL,
    "index" INTEGER NOT NULL,
    "typeDocumentId" INTEGER NOT NULL,
    "affectationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentRoute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentApproval" (
    "id" SERIAL NOT NULL,
    "type" "ApprovalType" NOT NULL,
    "documentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdById" INTEGER NOT NULL,
    "path" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formationId" INTEGER,
    "movementPersonelId" INTEGER,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" DATE,
    "phone" TEXT,
    "ninu" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "email" TEXT,
    "avatar" TEXT,
    "sexe" "Sexe" NOT NULL,
    "bloodGroup" "BloodGroup",
    "hireDate" TIMESTAMP(3),
    "statusId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeStatus" (
    "id" SERIAL NOT NULL,
    "affectationId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "initialSalary" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "attestationPath" TEXT,
    "attestationSignedPath" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "forceEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "etablissement" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "totalHours" INTEGER,
    "type" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Present',

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePresence" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "presenceDate" TIMESTAMP(3) NOT NULL,
    "checkInTime" TIME,
    "checkOutTime" TIME,
    "statusReason" VARCHAR(255),
    "status" "PresenceStatus" NOT NULL DEFAULT 'PRESENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePresence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "employeeType" "EmployeeType" NOT NULL,
    "affectationType" "AffectationType",
    "isApproved" BOOLEAN,
    "salaryGridId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" SERIAL NOT NULL,
    "type" "LeavingType" NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "fixed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "frequencies" TEXT NOT NULL,
    "power" TEXT NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modulation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Modulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "applicantId" TEXT NOT NULL,
    "representativeId" TEXT,
    "equipmentId" TEXT NOT NULL,
    "signatureName" TEXT,
    "signatureDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeavePolicy" (
    "id" SERIAL NOT NULL,
    "type" "LeavePolicyType" NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "typeDocumentId" INTEGER,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeavePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveTier" (
    "id" SERIAL NOT NULL,
    "policyId" INTEGER NOT NULL,
    "minYearsService" INTEGER NOT NULL,
    "daysAvailable" INTEGER NOT NULL,

    CONSTRAINT "LeaveTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeLeavesRequest" (
    "id" SERIAL NOT NULL,
    "daysRequested" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "approved" BOOLEAN,
    "reason" TEXT NOT NULL DEFAULT '',
    "employeeId" INTEGER NOT NULL,
    "documentId" INTEGER,
    "type" "LeavePolicyType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeLeavesRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarriedOverHistory" (
    "id" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "policyId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CarriedOverHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "type" "LogType" NOT NULL,
    "logInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" "LogAction" NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovementPersonel" (
    "id" SERIAL NOT NULL,
    "type" "MovementType" NOT NULL DEFAULT 'DOTATION',
    "dotationType" "DotationType",
    "approved" BOOLEAN,
    "documentPath" TEXT,
    "signedDocumentPath" TEXT,
    "employeeId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovementPersonel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movementSettings" (
    "id" SERIAL NOT NULL,
    "type" "MovementType" NOT NULL,
    "dotationType" "DotationType",
    "typeDocumentsId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movementSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "info" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" INTEGER NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'AWATING_ACTIVATION',
    "password" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EquipmentToModulation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EquipmentToModulation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "fees_type_gradeId_key" ON "fees"("type", "gradeId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePriv_roleId_privilegeId_accessLevel_key" ON "RolePriv"("roleId", "privilegeId", "accessLevel");

-- CreateIndex
CREATE UNIQUE INDEX "ModulePriv_roleId_moduleId_key" ON "ModulePriv"("roleId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentPriv_roleId_typeDocumentId_accessLevel_key" ON "DocumentPriv"("roleId", "typeDocumentId", "accessLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Privileges_code_key" ON "Privileges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Privileges_label_key" ON "Privileges"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Affectation_name_key" ON "Affectation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Affectation_sigle_key" ON "Affectation"("sigle");

-- CreateIndex
CREATE UNIQUE INDEX "Affectation_leaderId_key" ON "Affectation"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "Authentification_userId_key" ON "Authentification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_name_key" ON "Operator"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OperatorCallPrice_operatorId_date_key" ON "OperatorCallPrice"("operatorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "TypeDocuments_code_key" ON "TypeDocuments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TypeDocuments_label_key" ON "TypeDocuments"("label");

-- CreateIndex
CREATE UNIQUE INDEX "TypeDocuments_type_code_key" ON "TypeDocuments"("type", "code");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentApproval_documentId_userId_type_key" ON "DocumentApproval"("documentId", "userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Documents_code_key" ON "Documents"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Documents_formationId_key" ON "Documents"("formationId");

-- CreateIndex
CREATE UNIQUE INDEX "Documents_movementPersonelId_key" ON "Documents"("movementPersonelId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_ninu_key" ON "Employee"("ninu");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_nif_key" ON "Employee"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_statusId_key" ON "Employee"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "formations_employeeId_name_etablissement_type_key" ON "formations"("employeeId", "name", "etablissement", "type");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePresence_employeeId_presenceDate_key" ON "EmployeePresence"("employeeId", "presenceDate");

-- CreateIndex
CREATE UNIQUE INDEX "grades_name_key" ON "grades"("name");

-- CreateIndex
CREATE UNIQUE INDEX "grades_salaryGridId_key" ON "grades"("salaryGridId");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_date_name_key" ON "holidays"("date", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_model_key" ON "Equipment"("model");

-- CreateIndex
CREATE UNIQUE INDEX "Modulation_name_key" ON "Modulation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LeavePolicy_type_key" ON "LeavePolicy"("type");

-- CreateIndex
CREATE UNIQUE INDEX "LeavePolicy_label_key" ON "LeavePolicy"("label");

-- CreateIndex
CREATE INDEX "LeavePolicy_label_idx" ON "LeavePolicy"("label");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveTier_policyId_minYearsService_key" ON "LeaveTier"("policyId", "minYearsService");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeLeavesRequest_documentId_key" ON "EmployeeLeavesRequest"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "CarriedOverHistory_employeeId_policyId_year_key" ON "CarriedOverHistory"("employeeId", "policyId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "MovementPersonel_statusId_key" ON "MovementPersonel"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "movementSettings_typeDocumentsId_key" ON "movementSettings"("typeDocumentsId");

-- CreateIndex
CREATE INDEX "_EquipmentToModulation_B_index" ON "_EquipmentToModulation"("B");

-- AddForeignKey
ALTER TABLE "grille_salarial" ADD CONSTRAINT "grille_salarial_prevGradeId_fkey" FOREIGN KEY ("prevGradeId") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fees" ADD CONSTRAINT "fees_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdjustment" ADD CONSTRAINT "SalaryAdjustment_employeeStatusId_fkey" FOREIGN KEY ("employeeStatusId") REFERENCES "EmployeeStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePriv" ADD CONSTRAINT "RolePriv_privilegeId_fkey" FOREIGN KEY ("privilegeId") REFERENCES "Privileges"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePriv" ADD CONSTRAINT "RolePriv_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulePriv" ADD CONSTRAINT "ModulePriv_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulePriv" ADD CONSTRAINT "ModulePriv_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AppModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPriv" ADD CONSTRAINT "DocumentPriv_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPriv" ADD CONSTRAINT "DocumentPriv_typeDocumentId_fkey" FOREIGN KEY ("typeDocumentId") REFERENCES "TypeDocuments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affectation" ADD CONSTRAINT "Affectation_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affectation" ADD CONSTRAINT "Affectation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Affectation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authentification" ADD CONSTRAINT "Authentification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperatorCallPrice" ADD CONSTRAINT "OperatorCallPrice_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeDocuments" ADD CONSTRAINT "TypeDocuments_affectationId_fkey" FOREIGN KEY ("affectationId") REFERENCES "Affectation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRoute" ADD CONSTRAINT "DocumentRoute_typeDocumentId_fkey" FOREIGN KEY ("typeDocumentId") REFERENCES "TypeDocuments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRoute" ADD CONSTRAINT "DocumentRoute_affectationId_fkey" FOREIGN KEY ("affectationId") REFERENCES "Affectation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApproval" ADD CONSTRAINT "DocumentApproval_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApproval" ADD CONSTRAINT "DocumentApproval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "TypeDocuments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "formations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_movementPersonelId_fkey" FOREIGN KEY ("movementPersonelId") REFERENCES "MovementPersonel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "EmployeeStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeStatus" ADD CONSTRAINT "EmployeeStatus_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeStatus" ADD CONSTRAINT "EmployeeStatus_affectationId_fkey" FOREIGN KEY ("affectationId") REFERENCES "Affectation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePresence" ADD CONSTRAINT "EmployeePresence_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_salaryGridId_fkey" FOREIGN KEY ("salaryGridId") REFERENCES "grille_salarial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeavePolicy" ADD CONSTRAINT "LeavePolicy_typeDocumentId_fkey" FOREIGN KEY ("typeDocumentId") REFERENCES "TypeDocuments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveTier" ADD CONSTRAINT "LeaveTier_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LeavePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLeavesRequest" ADD CONSTRAINT "EmployeeLeavesRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLeavesRequest" ADD CONSTRAINT "EmployeeLeavesRequest_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementPersonel" ADD CONSTRAINT "MovementPersonel_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovementPersonel" ADD CONSTRAINT "MovementPersonel_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "EmployeeStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movementSettings" ADD CONSTRAINT "movementSettings_typeDocumentsId_fkey" FOREIGN KEY ("typeDocumentsId") REFERENCES "TypeDocuments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_id_fkey" FOREIGN KEY ("id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToModulation" ADD CONSTRAINT "_EquipmentToModulation_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentToModulation" ADD CONSTRAINT "_EquipmentToModulation_B_fkey" FOREIGN KEY ("B") REFERENCES "Modulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
