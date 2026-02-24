import { readFile } from 'node:fs/promises';
import express from 'express';
import { google } from 'googleapis';

import { prisma } from '../database/prisma.js';

import { getGoogleOauth } from '../utils/googleapi.js';
import { getDemoCalendarList, getDemoCalendarEvents } from '../data/demoCalendar.js';

import type { Event } from '../../types/Calendar.js';

const router = express.Router();
const demoId = Number(process.env['DEMO_ACCOUNT_ID']) || -2;

async function getDummyData() {
  const dummyJson = await readFile('./data/dummydata.json', "utf8"); // relative to project root, apparently

  return JSON.parse(dummyJson);
}

router.get('/', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const calendarId = req.query.calendarId === undefined ? 'primary' : req.query.calendarId as string;

  const userId = req.user.id;

  // return demo data if logged into demo account
  if (userId === demoId) {
    const events = await getDemoCalendarEvents(calendarId);

    if (events === null) {
      console.error('Invalid demo calendar id:', calendarId);
      return res.sendStatus(404);
    } else {
      return res.status(200).send(events);
    }
  }

  try {
    const oauth2Client = await getGoogleOauth(userId, 'calendar');

    if (oauth2Client === null) { // because no token for this user
      res.sendStatus(403);
      return;
    }

    const calendar = google.calendar({version: 'v3', auth: oauth2Client});

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    });

    // TODO: this guard is probably not great
    if (
      response === null ||
      response === undefined ||
      response.data === undefined ||
      response.data.items === undefined
    ) {
      res.sendStatus(500);
      return;
    }

    const events = response.data.items.map((event) => {
      return {
        summary: event.summary,
        id: event.id,
        start: event.start,
        end: event.end
      }
    });

    res.status(200).send(events);

  } catch (error) {
    if ((error as any).status === 401) { // this should be some kind of Gaxios thing
      // token is invalid somehow (maybe revoked manually in Google settings?)
      // delete and send error to client
      await prisma.googleToken.deleteMany({
        where: {
          accountId: userId
        }
      })
      return res.sendStatus(403);
    }

    console.error('Failed to get calendar data:', error);
    res.sendStatus(500);
  }
});

router.get('/list', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const userId = req.user.id;

  if (userId === demoId) {
    const calendarList = await getDemoCalendarList();
    return res.status(200).send(calendarList);
  }

  try {
    const oauth2Client = await getGoogleOauth(userId, 'calendar');

    if (oauth2Client === null) { // because no token for this user
      res.sendStatus(403);
      return;
    }

    const calendar = google.calendar({version: 'v3', auth: oauth2Client});

    const result = await calendar.calendarList.list();

    const items = result?.data?.items;

    if (items === undefined) {
      res.sendStatus(500);
      return;
    } else {
      res.status(200).send(items.map(({id, summary, description, primary}) => {
        return {
          id,
          summary,
          description,
          primary
        }
      }));
    }
  } catch (error) {
    if ((error as any).status === 401) { // this should be some kind of Gaxios thing
      // token is invalid somehow (maybe revoked manually in Google settings?)
      // delete and send error to client
      await prisma.googleToken.deleteMany({
        where: {
          accountId: userId
        }
      })
      return res.sendStatus(403);
    }

    console.error('Failed to get calendar list:', error);
    res.sendStatus(500);
  }
});

export default router;
