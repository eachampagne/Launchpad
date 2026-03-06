-- CreateTable
CREATE TABLE "CalendarSetting" (
    "id" SERIAL NOT NULL,
    "layoutElementId" INTEGER NOT NULL,
    "defaultCalendar" TEXT NOT NULL,

    CONSTRAINT "CalendarSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSetting_layoutElementId_key" ON "CalendarSetting"("layoutElementId");

-- AddForeignKey
ALTER TABLE "CalendarSetting" ADD CONSTRAINT "CalendarSetting_layoutElementId_fkey" FOREIGN KEY ("layoutElementId") REFERENCES "LayoutElement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
