import express from 'express';
//import { Prisma } from '@prisma/client';
import { Prisma } from '../../generated/prisma/client.js'; // not sure about this, although it matches what was in database/prisma

import { prisma } from '../database/prisma.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send("dashboard!");
});

router.get('/:id', async (req, res) => {
  // there should be some sort of auth here to check if the given dashboard
  // either belongs to the user or is public

  const { id: idString } = req.params;
  const id = parseInt(idString);

  try {
    const dashboard = await prisma.dashboard.findUnique({
      where: {
        id
      }
    });

    // TODO: check whether the given user should have access to this dashboard

    if (!dashboard) { // dashboard is null if not found
      res.sendStatus(404);
    } else {
      res.status(200).send(dashboard);
    }
  } catch (error) {
    console.error('Failed to find dashboard: ', error);
    res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  // TODO: all sorts of auth
  // only authorized users should be allowed to create dashboards
  // the user's identity should be pulled from the session info
  // rather than just being the client saying "trust me bro"

  const { userId: ownerId, name, themeId, layoutId } = req.body;

  try {
    await prisma.dashboard.create({
      data: {
        name,
        ownerId,
        themeId,
        layoutId
      }
    });

    res.sendStatus(201);
  } catch (error) {
    console.error('Failed to create dashboard', error);
    res.sendStatus(500);
  }
});

router.patch('/:id', async (req, res) => {
  // TODO: auth!!

  const { name } = req.body;
  const { id: idString } = req.params;
  const id = parseInt(idString);

  try {
    await prisma.dashboard.update({
      where: {
        id
      },
      data: {
        name
      }
    });

    res.sendStatus(200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.sendStatus(404);
        return;
      }
    }
    console.error('Failed to PATCH dashboard:', error);
    res.sendStatus(500);
  }
});


export default router;
