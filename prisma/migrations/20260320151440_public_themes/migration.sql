-- AlterTable
ALTER TABLE "Theme" ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "PublicThemes" (
    "id" SERIAL NOT NULL,
    "themeId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "PublicThemes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PublicThemes" ADD CONSTRAINT "PublicThemes_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicThemes" ADD CONSTRAINT "PublicThemes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
