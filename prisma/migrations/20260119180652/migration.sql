/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[primaryDashId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `credentialProvider` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credentialSubject` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryDashId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "credentialProvider" TEXT NOT NULL,
ADD COLUMN     "credentialSubject" INTEGER NOT NULL,
ADD COLUMN     "primaryDashId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Post";

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_primaryDashId_key" ON "User"("primaryDashId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_primaryDashId_fkey" FOREIGN KEY ("primaryDashId") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
