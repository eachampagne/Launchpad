-- CreateTable
CREATE TABLE "LinkSettings" (
    "id" SERIAL NOT NULL,
    "widgetSettingsId" INTEGER NOT NULL,
    "url" TEXT,

    CONSTRAINT "LinkSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkSettings_widgetSettingsId_key" ON "LinkSettings"("widgetSettingsId");

-- AddForeignKey
ALTER TABLE "LinkSettings" ADD CONSTRAINT "LinkSettings_widgetSettingsId_fkey" FOREIGN KEY ("widgetSettingsId") REFERENCES "WidgetSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
