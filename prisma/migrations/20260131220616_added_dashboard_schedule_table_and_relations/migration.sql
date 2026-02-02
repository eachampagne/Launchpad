-- CreateTable
CREATE TABLE "DashboardSchedule" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "dashboardId" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DashboardSchedule" ADD CONSTRAINT "DashboardSchedule_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardSchedule" ADD CONSTRAINT "DashboardSchedule_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
