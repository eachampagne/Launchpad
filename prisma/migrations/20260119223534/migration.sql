/*
  Warnings:

  - A unique constraint covering the columns `[themeId]` on the table `Dashboard` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `themeId` to the `Dashboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dashboard" ADD COLUMN     "themeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Theme" (
    "id" SERIAL NOT NULL,
    "public" BOOLEAN NOT NULL,
    "navColor" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL,
    "font" TEXT NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dashboard_themeId_key" ON "Dashboard"("themeId");

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
