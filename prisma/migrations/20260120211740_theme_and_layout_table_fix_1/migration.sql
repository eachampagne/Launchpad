/*
  Warnings:

  - A unique constraint covering the columns `[layoutId]` on the table `Dashboard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Layout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Theme` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Layout" ADD COLUMN     "ownerId" INTEGER NOT NULL,
ALTER COLUMN "public" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "ownerId" INTEGER NOT NULL,
ALTER COLUMN "public" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_layoutId_key" ON "Dashboard"("layoutId");

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Layout" ADD CONSTRAINT "Layout_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
