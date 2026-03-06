/*
  Warnings:

  - You are about to drop the `CalendarSetting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CalendarSetting" DROP CONSTRAINT "CalendarSetting_widgetSettingsId_fkey";

-- DropTable
DROP TABLE "CalendarSetting";

-- CreateTable
CREATE TABLE "CalendarSettings" (
    "id" SERIAL NOT NULL,
    "widgetSettingsId" INTEGER NOT NULL,
    "defaultCalendar" TEXT,

    CONSTRAINT "CalendarSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSettings_widgetSettingsId_key" ON "CalendarSettings"("widgetSettingsId");

-- AddForeignKey
ALTER TABLE "CalendarSettings" ADD CONSTRAINT "CalendarSettings_widgetSettingsId_fkey" FOREIGN KEY ("widgetSettingsId") REFERENCES "WidgetSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
