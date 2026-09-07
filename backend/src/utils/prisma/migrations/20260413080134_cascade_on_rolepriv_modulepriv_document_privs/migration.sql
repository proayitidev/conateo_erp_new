-- DropForeignKey
ALTER TABLE "DocumentPriv" DROP CONSTRAINT "DocumentPriv_roleId_fkey";

-- DropForeignKey
ALTER TABLE "ModulePriv" DROP CONSTRAINT "ModulePriv_roleId_fkey";

-- AddForeignKey
ALTER TABLE "ModulePriv" ADD CONSTRAINT "ModulePriv_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPriv" ADD CONSTRAINT "DocumentPriv_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
