/*
  Warnings:

  - You are about to drop the column `layoutElementId` on the `CalendarSetting` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[widgetSettingsId]` on the table `CalendarSetting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `widgetSettingsId` to the `CalendarSetting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CalendarSetting" DROP CONSTRAINT "CalendarSetting_layoutElementId_fkey";

-- DropIndex
DROP INDEX "CalendarSetting_layoutElementId_key";

-- AlterTable
ALTER TABLE "CalendarSetting" DROP COLUMN "layoutElementId",
ADD COLUMN     "widgetSettingsId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "WidgetSettings" (
    "id" SERIAL NOT NULL,
    "layoutElementId" INTEGER NOT NULL,

    CONSTRAINT "WidgetSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WidgetSettings_layoutElementId_key" ON "WidgetSettings"("layoutElementId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSetting_widgetSettingsId_key" ON "CalendarSetting"("widgetSettingsId");

-- AddForeignKey
ALTER TABLE "WidgetSettings" ADD CONSTRAINT "WidgetSettings_layoutElementId_fkey" FOREIGN KEY ("layoutElementId") REFERENCES "LayoutElement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarSetting" ADD CONSTRAINT "CalendarSetting_widgetSettingsId_fkey" FOREIGN KEY ("widgetSettingsId") REFERENCES "WidgetSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
