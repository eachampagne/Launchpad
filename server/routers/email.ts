import express from 'express';
import { google } from 'googleapis';

import { getGoogleOauth } from '../utils/googleapi.js';
import { batchFetchImplementation } from '@jrmdayn/googleapis-batcher';

const email = express.Router();

email.get('/', async (req: any, res) => {
  const userId = req.user?.id;

  if (userId === undefined) {
    res.sendStatus(401);
    return;
  }

  try {
    const oauth2Client = await getGoogleOauth(userId, 'gmail');

    if (oauth2Client === null) { // no token for this user
      res.sendStatus(401);
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
    console.error('Failed to fetch emails:', error);
    res.sendStatus(500);
  }
});

export default email;