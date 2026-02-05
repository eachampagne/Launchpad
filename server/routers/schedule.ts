import express from "express";
import passport from "passport";

import { prisma } from "../database/prisma.js";
import { scheduleDashboardJob, unscheduleDashboardJob, unscheduleAllDashboardJobs } from "../cron/dashboard-scheduler.js";


const schedule = express.Router();

/**
 * Route used to retrieve scheduled dashboard data for a specific user
 */
schedule.get('/:ownerId', async (req, res) => {
    const { ownerId: idString } = req.params;
    const ownerId = parseInt(idString)
    try {
        const schedules = await prisma.dashboardSchedule.findMany({
            where: { ownerId }
        })

        res.status(200).send(schedules)
    } catch (error) {
        console.error("Failed to GET user's scheduled dashboards", error);
        res.sendStatus(500);
    }
})

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

/**
 * Handles deleting a single scheduled dashboard change
 */
schedule.delete("/:id", async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const { id: idString } = req.params;
  const scheduleId = parseInt(idString);

  try {
    const deletedSchedule = await prisma.dashboardSchedule.delete({
      where: { id: scheduleId },
    });

    unscheduleDashboardJob(scheduleId);

    res
      .status(200)
      .send({ message: "Schedule deleted", schedule: deletedSchedule });
  } catch (error) {
    console.error(error);
    res.status(404).send({ message: "Schedule not found" });
  }
});

/**
 * Handles deleting all scheduled dashboard changes
 */
schedule.delete("/all/:ownerId", async (req, res) => {

    // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const { ownerId: idString } = req.params;
  const ownerId = parseInt(idString);

    

  try {
    // find schedules before deleting them
    const schedules = await prisma.dashboardSchedule.findMany({
        where: { ownerId }
    })
    // make array of schedule ids
    const scheduleIds = schedules.map(schedule => schedule.id)

    // delete schedules in database
    await prisma.dashboardSchedule.deleteMany({
        where: { ownerId }
    });
    
    // delete cron jobs associated with those schedule ids
    unscheduleAllDashboardJobs(scheduleIds);

    res.status(200).send({ message: "Schedules deleted", schedules})
  } catch (error) {
    console.error(error);
    res.status(404).send({ message: "Schedule not found"})
  }
});

export default schedule;
