/*
  Warnings:

  - A unique constraint covering the columns `[layoutElementId]` on the table `Timer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `layoutElementId` to the `Timer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Timer_ownerId_key";

-- AlterTable
ALTER TABLE "Timer" ADD COLUMN     "layoutElementId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Timer_layoutElementId_key" ON "Timer"("layoutElementId");

-- AddForeignKey
ALTER TABLE "Timer" ADD CONSTRAINT "Timer_layoutElementId_fkey" FOREIGN KEY ("layoutElementId") REFERENCES "LayoutElement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
