import express from "express";


import { prisma } from "../database/prisma.js";
import { scheduleDashboardJob, unscheduleDashboardJob } from "../cron/dashboard-scheduler.js";


const schedule = express.Router();

// route to add a default dashboard schedule
schedule.post("/", async (req, res) => {
    const { ownerId, dashboardId, time } = req.body;

    // TODO AUTH AUTH AUTH 

    try {
        const schedule = await prisma.dashboardSchedule.create({
            data: { ownerId, dashboardId, time}
        });

        scheduleDashboardJob(schedule);
        res.status(201).send({ message: `Successfully created scheduled for Dashboard ID: ${dashboardId}`})
    } catch (error) {
        console.error(`Couldn't create schedule for Dashboard ID: ${dashboardId}`, error)
        res.status(500).send({ message: `Couldn't create schedule for Dashboard ID: ${dashboardId}`, error});
    }


});

// route to delete a default dashboard schedule
schedule.delete("/:id", async (req, res) => {
  const { id: idString } = req.params;
  const scheduleId = parseInt(idString);

  // TODO AUTH AUTH AUTH

  try {
    const deletedSchedule = await prisma.dashboardSchedule.delete({
        where: { id: scheduleId }
    });

    unscheduleDashboardJob(scheduleId);

    res.status(200).send({ message: "Schedule deleted", schedule: deletedSchedule})
  } catch (error) {
    console.error(error);
    res.status(404).send({ message: "Schedule not found"})
  }
});

export default schedule;
