import express from 'express';
import { prisma } from '../database/prisma.js';

const account = express.Router();

const demoId = Number(process.env['DEMO_ACCOUNT_ID']) || -2;

account.get('/', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    return res.sendStatus(401);
  }

  const id = req.user.id;

  // demo account has no linked accounts
  if (id === demoId) {
    return res.status(200).send([]);
  }

  const google = await prisma.googleToken.findFirst({where: {accountId: id}});

  try {
    const accounts = [
      {
        name: 'Google',
        unlinkable: false, // because the whole Launchpad account is attached to your Google account
        unlinkURL: '/unlink/google',
        permissions: [
          {
            name: 'Calendar',
            authorized: (google?.authCalendar ? true : false),
            authURL: '/auth/calendar'
          },
          {
            name: 'Gmail',
            authorized: (google?.authGmail ? true : false),
            authURL: '/auth/gmail'
          }
        ]
      }
    ];

    res.status(200).send(accounts);
  } catch (error) {
    console.error('Failed to find account information:', error);
    res.sendStatus(500);
  }
});

export default account;
