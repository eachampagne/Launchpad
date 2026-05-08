import express from 'express';

import { prisma } from '../database/prisma.js';

import { timerLookup, timerCallback, clearTimer } from '../database/timer.js';

const timer = express.Router();

// I don't think using layoutElementId as the path param (as opposed to the timer id)
// is proper REST, but the widget has no way to know what the timer id is
// ... this also doesn't actually check that the layoutElement is in fact a timer...

timer.get('/:layoutElementId', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const layoutElementId = parseInt(req.params.layoutElementId);
  if (isNaN(layoutElementId)) {
    return res.sendStatus(400);
  }

  try {
    const timer = await prisma.timer.findFirst({where: {
      ownerId: req.user.id,
      layoutElementId
    }});

    if (timer === null) {
      res.status(200).send(null);
    } else {
      // need to send in terms of remainingMs, regardless of whether timer is paused or not, because there's no guarantee that the client and server clocks are synced
      const timerData = {
        paused: timer.paused,
        remainingMs: timer.paused ? timer.remainingMs : (timer.expiresAt as Date).getTime() - Date.now()
      }

      if (timerData.remainingMs as number < 0) {
        return res.status(200).send(null); // timer has already expired and is about to be deleted - don't send to client to avoid notification loop
      }

      res.status(200).send(timerData)
    }
  } catch (error) {
    console.error('Failed to GET user\'s timer:', error);
    res.sendStatus(500);
  }
});

timer.post('/:layoutElementId', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const { id } = req.user;

  const layoutElementId = parseInt(req.params.layoutElementId);
  if (isNaN(layoutElementId)) {
    return res.sendStatus(400);
  }

  try {
    // check if this widget already has a timer
    // a given widget is only allowed to have one timer at a time
    const existingTimer = await prisma.timer.findFirst({where: {
      ownerId: id,
      layoutElementId
    }});

    // TODO: - check for timers with negative remaining times (could be expired but not yet deleted)
    if (existingTimer !== null) {
      res.sendStatus(409);
      return;
    }

    let { duration }: { duration: number } = req.body;
    if (duration < 0) {
      duration = 0;
    };

    const timeout = setTimeout(() => {
      timerCallback(id, layoutElementId);
    }, duration); // apparently NodeJS's setTimeout is different from the window one
    timerLookup[layoutElementId] = timeout;
    const expirationTime = Date.now() + duration;

    await prisma.timer.create({
      data: {
        ownerId: id,
        expiresAt: new Date(expirationTime),
        paused: false,
        layoutElementId
      }
    });

    res.sendStatus(201);
  } catch (error) {
    console.error('Failed to create new timer:', error);
    res.sendStatus(500);
  }
});

timer.patch('/pause/:layoutElementId', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const layoutElementId = parseInt(req.params.layoutElementId);
  if (isNaN(layoutElementId)) {
    return res.sendStatus(400);
  }

  try {
    const timer = await prisma.timer.findFirst({where: {
      ownerId: req.user.id,
      layoutElementId,
      paused: false
    }});

    if (timer === null) {
      res.sendStatus(404); // either timer doesn't exist, or is already paused
    } else {
      const remainingMs = (timer.expiresAt as Date).getTime() - Date.now();
      clearTimeout(timerLookup[layoutElementId]);
      delete timerLookup[layoutElementId];

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

timer.patch('/resume/:layoutElementId', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const { id } = req.user;
  const layoutElementId = parseInt(req.params.layoutElementId);
  if (isNaN(layoutElementId)) {
    return res.sendStatus(400);
  }

  try {
    const timer = await prisma.timer.findFirst({where: {
      ownerId: id,
      layoutElementId,
      paused: true
    }});

    if (timer === null) {
      res.sendStatus(404); // either timer doesn't exist, or isn't paused
    } else {
      const remainingMs = timer.remainingMs as number;

      const timeout = setTimeout(() => {
        timerCallback(id, layoutElementId);
      }, remainingMs); // apparently NodeJS's setTimeout is different from the window one
      timerLookup[layoutElementId] = timeout;
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

timer.delete('/:layoutElementId', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const layoutElementId = parseInt(req.params.layoutElementId);
  if (isNaN(layoutElementId)) {
    return res.sendStatus(400);
  }

  try {
    const deleteCount = await clearTimer(req.user.id, layoutElementId);

    if (deleteCount > 0) {
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
