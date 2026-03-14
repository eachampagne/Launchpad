/*
  Warnings:

  - You are about to drop the `Widget` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LayoutElement" DROP CONSTRAINT "LayoutElement_widgetId_fkey";

-- DropTable
DROP TABLE "Widget";
