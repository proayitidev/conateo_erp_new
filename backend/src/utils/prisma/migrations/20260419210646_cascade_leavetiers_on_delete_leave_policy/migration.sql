-- DropForeignKey
ALTER TABLE "LeaveTier" DROP CONSTRAINT "LeaveTier_policyId_fkey";

-- AddForeignKey
ALTER TABLE "LeaveTier" ADD CONSTRAINT "LeaveTier_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LeavePolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
