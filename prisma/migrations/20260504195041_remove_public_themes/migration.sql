/*
  Warnings:

  - You are about to drop the `PublicThemes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PublicThemes" DROP CONSTRAINT "PublicThemes_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "PublicThemes" DROP CONSTRAINT "PublicThemes_themeId_fkey";

-- DropTable
DROP TABLE "PublicThemes";
