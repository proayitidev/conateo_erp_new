-- DropForeignKey
ALTER TABLE "DocumentPriv" DROP CONSTRAINT "DocumentPriv_typeDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "ModulePriv" DROP CONSTRAINT "ModulePriv_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "RolePriv" DROP CONSTRAINT "RolePriv_privilegeId_fkey";

-- AddForeignKey
ALTER TABLE "RolePriv" ADD CONSTRAINT "RolePriv_privilegeId_fkey" FOREIGN KEY ("privilegeId") REFERENCES "Privileges"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModulePriv" ADD CONSTRAINT "ModulePriv_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AppModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPriv" ADD CONSTRAINT "DocumentPriv_typeDocumentId_fkey" FOREIGN KEY ("typeDocumentId") REFERENCES "TypeDocuments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
