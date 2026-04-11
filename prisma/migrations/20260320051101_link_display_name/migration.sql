/*
  Warnings:

  - Made the column `url` on table `LinkSettings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LinkSettings" ADD COLUMN     "displayText" TEXT,
ALTER COLUMN "url" SET NOT NULL;
