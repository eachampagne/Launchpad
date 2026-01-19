-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_primaryDashId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "primaryDashId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_primaryDashId_fkey" FOREIGN KEY ("primaryDashId") REFERENCES "Dashboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
