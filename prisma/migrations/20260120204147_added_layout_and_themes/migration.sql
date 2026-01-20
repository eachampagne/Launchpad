/*
  Warnings:

  - Added the required column `layoutId` to the `Dashboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dashboard" ADD COLUMN     "layoutId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Layout" (
    "id" SERIAL NOT NULL,
    "public" BOOLEAN NOT NULL,
    "gridSize" TEXT NOT NULL,

    CONSTRAINT "Layout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayoutElement" (
    "id" SERIAL NOT NULL,
    "layoutId" INTEGER NOT NULL,
    "widgetId" INTEGER NOT NULL,
    "posX" INTEGER NOT NULL,
    "posY" INTEGER NOT NULL,
    "sizeX" INTEGER NOT NULL,
    "sizeY" INTEGER NOT NULL,

    CONSTRAINT "LayoutElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Widget" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutElement" ADD CONSTRAINT "LayoutElement_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "Layout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayoutElement" ADD CONSTRAINT "LayoutElement_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "Widget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
