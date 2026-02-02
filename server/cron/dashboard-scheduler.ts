import cron, { ScheduledTask } from 'node-cron';

import { prisma } from '../database/prisma.js';

/**
 * Keep active cron jobs in memory
 * key = DashboardSchedule.id
 */
const cronJobs = new Map<number, ScheduledTask>();


/**
 * 
 * Create a cron job for a single schedule
 */
export function scheduleDashboardJob(schedule: {
    id: number;
    ownerId: number;
    dashboardId: number;
    time: string; // "HH:mm format"
}) {
    // prevent duplicates
    if (cronJobs.has(schedule.id)) return;

    // get hour and minute value and convert them to numbers
    const [ hour, minute ] = schedule.time.split(':').map(Number);

    // Every day at user defined time HH:mm
    const cronExpression = `${minute} ${hour} * * *`;

    const task = cron.schedule(cronExpression, async () => {
        try {
            await prisma.user.update({
                where: {id: schedule.ownerId },
                data: { primaryDashId: schedule.dashboardId }
            });

            console.log(`[CRON] User: ${schedule.ownerId} -> dashboard: ${schedule.dashboardId} @ ${schedule.time}`)
        } catch (error) {
            console.error(`[CRON ERROR] Schedule ID: ${schedule.id} ran into some issues`, error);
        }
    });
    cronJobs.set(schedule.id, task);
}

/**
 * Remove a cron job (used when user deletes a schedule)
 */
export function unscheduleDashboardJob(scheduleId: number) {
    const task = cronJobs.get(scheduleId);
    if (!task) return; // if task doesn't exist stop function

    // otherwise if task exists
    task.stop();
    cronJobs.delete(scheduleId);
}

/**
 * Load all schedules from Database (called on server startup)
 */
export async function loadDashboardSchedules() {
    const schedules = await prisma.dashboardSchedule.findMany();

    // Create jobs for every schedule in our database
    schedules.forEach(schedule => {
        scheduleDashboardJob(schedule);
    });

    console.log(`[CRON] Loaded ${schedules.length} dashboard schedules`)
}