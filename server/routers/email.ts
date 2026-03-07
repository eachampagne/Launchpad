import express from 'express';
import { google } from 'googleapis';
import type { GaxiosResponseWithHTTP2 } from 'googleapis-common';
import type { AxiosError } from 'axios';

import { prisma } from '../database/prisma.js';

import { getGoogleOauth } from '../utils/googleapi.js';
import { batchFetchImplementation } from '@jrmdayn/googleapis-batcher';

import { getDemoEmails } from '../data/demoEmail.js';

const email = express.Router();
const demoId = Number(process.env['DEMO_ACCOUNT_ID']) || -2;

email.get('/', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const userId = req.user.id;

  if (userId === demoId) {
    const emails = await getDemoEmails();
    return res.status(200).send(emails);
  }

  try {
    const oauth2Client = await getGoogleOauth(userId, 'gmail');

    if (oauth2Client === null) { // no token for this user
      res.sendStatus(403);
      return;
    }

    const fetchImpl = batchFetchImplementation();

    const gmail = google.gmail({version: 'v1', auth: oauth2Client, fetchImplementation: fetchImpl});

    const result = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10
    });

    const messageIds = result.data.messages;

    if (messageIds === undefined) {
      res.status(200).send('No messages found.');
      return;
    }

    const emailResponseObjects = await Promise.all(messageIds.map(message => {
      return gmail.users.messages.get({
        id: message.id as string,
        userId: 'me',
      });
    }));

    res.status(200).send(emailResponseObjects.map(response => response.data));

  } catch (error) {
    const status = (error as AxiosError | GaxiosResponseWithHTTP2).status;

    // if the error is a 4xx status code (rather than, for example, a database error) assume the token is bad and delete it
    // I suppose this could give false positives, but it's probably better to delete too many tokens and re-request too often
    // then play status code whack-a-mole and have badly handled errors
    if (status && status >= 400 && status < 500) {
      // token is invalid somehow (maybe revoked manually in Google settings?)
      // delete and send error to client
      await prisma.googleToken.deleteMany({
        where: {
          accountId: userId
        }
      })
      return res.sendStatus(403);
    }

    console.error('Failed to fetch emails:', error);
    res.sendStatus(500);
  }
});

export default email;