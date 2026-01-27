import { readFile } from 'node:fs/promises';
import express from 'express';
import { google } from 'googleapis';

import { prisma } from '../database/prisma.js';

import type { Event } from '../../types/Event.ts';

const router = express.Router();

async function getDummyData() {
  const dummyJson = await readFile('./data/dummydata.json', "utf8"); // relative to project root, apparently

  return JSON.parse(dummyJson);
}

async function getGoogleOauth(userId: number) {
  const oauth2Client = new google.auth.OAuth2(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET'],
    process.env['CALENDAR_REDIRECT_URL']
  );

  const token = await prisma.googleToken.findFirst({
    where: {
      accountId: userId,
      authCalendar: true
    }
  });

  if (!token) {return null};

  oauth2Client.setCredentials({
    access_token: token.access_token,
    id_token: token.id_token
  });

  // return null;

  return oauth2Client;

  //return google.calendar({version: 'v3', auth: oauth2Client});

  // return await calendar.events.list({
  //   calendarId: 'primary',
  //   timeMin: new Date().toISOString(),
  //   maxResults: 10,
  //   singleEvents: true,
  //   orderBy: 'startTime'
  // });
}

// TODO: figure out the request.User type
router.get('/', async (req: any, res) => {
  const userId = req.user?.id;

  try {
    // const response = await getDummyData();
    // const response = await getLiveData(userId);

    const oauth2Client = await getGoogleOauth(userId);

    if (oauth2Client === null) { // because no token for this user
      res.sendStatus(401);
      return;
    }

    const calendar = google.calendar({version: 'v3', auth: oauth2Client});

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    });

    // res.sendStatus(500);
    // return;

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
    console.error('Failed to get calendar data:', error);
    res.sendStatus(500);
  }
});

router.get('/listcalendars', (req, res) => {
  res.sendStatus(501);
});

router.get('/next', (req, res) => {
  res.sendStatus(501);
});

// todo: fix any
// https://stackoverflow.com/questions/66312048/cant-override-express-request-user-type-but-i-can-add-new-properties-to-reques
router.get('/checkauth', async (req: any, res) => {
  if (req.user) {
    const numValidTokens = (await prisma.googleToken.findMany({where: {accountId: req.user.id, authCalendar: true}})).length;
    if (numValidTokens > 0) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } else {
    res.sendStatus(401);
  }
});

export default router;
