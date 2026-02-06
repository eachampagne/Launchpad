/*
  Warnings:

  - Added the required column `paused` to the `Timer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Timer" ADD COLUMN     "paused" BOOLEAN NOT NULL,
ADD COLUMN     "remainingMs" INTEGER,
ALTER COLUMN "expiresAt" DROP NOT NULL;
