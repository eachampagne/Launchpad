import express from 'express';

import { prisma } from '../database/prisma.js';

const timerLookup: {[key: string]: NodeJS.Timeout} = {};

const timer = express.Router();

const timerCallback = async (userId: number) => {
  console.info(`User ${userId}'s timer is up.`);

  await prisma.timer.deleteMany({where: {
    ownerId: userId
  }});
};

timer.get('/', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  try {
    const timer = await prisma.timer.findFirst({where: {
      ownerId: req.user.id
    }});

    if (timer === null) {
      res.status(200).send(null);
    } else {
      // need to send in terms of remainingMs, regardless of whether timer is paused or not, because there's no guarantee that the client and server clocks are synced
      const timerData = {
        paused: timer.paused,
        remainingMs: timer.paused ? timer.remainingMs : (timer.expiresAt as Date).getTime() - Date.now()
      }

      res.status(200).send(timerData)
    }
  } catch (error) {
    console.error('Failed to GET user\'s timer:', error);
    res.sendStatus(500);
  }
});

timer.post('/', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const { id } = req.user;

  try {
    // check if user already has a timer
    // a user is only allowed to have one timer at a time
    const existingTimer = await prisma.timer.findFirst({where: {
      ownerId: id
    }});

    if (existingTimer !== null) {
      res.sendStatus(409);
      return;
    }

    let { duration }: { duration: number } = req.body;
    if (duration < 0) {
      duration = 0;
    };

    const timeout = setTimeout(() => {
      timerCallback(id);
    }, duration); // apparently NodeJS's setTimeout is different from the window one
    timerLookup[id] = timeout;
    const expirationTime = Date.now() + duration;

    await prisma.timer.create({
      data: {
        ownerId: id,
        expiresAt: new Date(expirationTime),
        paused: false
      }
    });

    res.sendStatus(201);
  } catch (error) {
    console.error('Failed to create new timer:', error);
    res.sendStatus(500);
  }
});

timer.patch('/pause', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  try {
    const timer = await prisma.timer.findFirst({where: {
      ownerId: req.user.id,
      paused: false
    }});

    if (timer === null) {
      res.sendStatus(404); // either timer doesn't exist, or is already paused
    } else {
      const remainingMs = (timer.expiresAt as Date).getTime() - Date.now();
      clearTimeout(timerLookup[req.user.id]);
      delete timerLookup[req.user.id];

      await prisma.timer.update({
        where: {id: timer.id},
        data: {
          paused: true,
          remainingMs,
          expiresAt: null
        }
      })

      res.status(200).send(remainingMs);
    }
  } catch (error) {
    console.error('Failed to pause user\'s timer:', error);
    res.sendStatus(500);
  }
});

timer.patch('/resume', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const { id } = req.user;

  try {
    const timer = await prisma.timer.findFirst({where: {
      ownerId: id,
      paused: true
    }});

    if (timer === null) {
      res.sendStatus(404); // either timer doesn't exist, or isn't paused
    } else {
      const remainingMs = timer.remainingMs as number;

      const timeout = setTimeout(() => {
        timerCallback(id);
      }, remainingMs); // apparently NodeJS's setTimeout is different from the window one
      timerLookup[id] = timeout;
      const expiresAt = new Date((remainingMs) + Date.now());

      await prisma.timer.update({
        where: {id: timer.id},
        data: {
          paused: false,
          remainingMs: null,
          expiresAt
        }
      });

      res.status(200).send((expiresAt as Date).getTime() - Date.now());
    }
  } catch (error) {
    console.error('Failed to resume user\'s timer:', error);
    res.sendStatus(500);
  }
});

timer.delete('/', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  try {
    const batchPayload = await prisma.timer.deleteMany({where: {
      ownerId: req.user.id
    }});

    if (batchPayload.count > 0) {
      clearTimeout(timerLookup[req.user.id]);
      delete timerLookup[req.user.id];
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Failed to delete timer:', error);
    res.sendStatus(500);
  }
});

// initialize timeouts for any running timers
(async function () {
  console.info('Initializing timers:');
  let timerCount = 0;

  const timers = await prisma.timer.findMany({where: {paused: false}});

  timers.forEach((timer) => {
    const userId = timer.ownerId;

    let remainingMs = (timer.expiresAt as Date).getTime() - Date.now();
    if (remainingMs < 0) {
      remainingMs = 0; // stop the negative timeout warning
    }

    const timeout = setTimeout(() => {
      timerCallback(userId);
    }, remainingMs); // apparently NodeJS's setTimeout is different from the window one
    timerLookup[userId] = timeout;

    timerCount++;
  });

  console.info(`Successfully initialized ${timerCount} timers.`);
})();

export default timer;
