import express from 'express';

import { prisma } from '../database/prisma.js';

const timer = express.Router();

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
      res.status(200).send(timer)
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

  try {
    // check if user already has a timer
    // a user is only allowed to have one timer at a time
    const existingTimer = await prisma.timer.findFirst({where: {
      ownerId: req.user.id
    }});

    if (existingTimer !== null) {
      res.sendStatus(409);
      return;
    }

    const { duration }: { duration: number } = req.body;
    const expirationTime = Date.now() + duration;

    await prisma.timer.create({
      data: {
        ownerId: req.user.id,
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

  try {
    const timer = await prisma.timer.findFirst({where: {
      ownerId: req.user.id,
      paused: true
    }});

    if (timer === null) {
      res.sendStatus(404); // either timer doesn't exist, or isn't paused
    } else {
      const expiresAt = new Date((timer.remainingMs as number) + Date.now());

      await prisma.timer.update({
        where: {id: timer.id},
        data: {
          paused: false,
          remainingMs: null,
          expiresAt
        }
      })

      res.status(200).send(expiresAt);
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
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Failed to delete timer:', error);
    res.sendStatus(500);
  }
});

export default timer;
