import express from 'express';
import { prisma } from '../database/prisma.js';

const link = express.Router();

link.get('/:layoutElementId', async (req, res) => {
  // check auth
  const userId = req.user?.id;

  if (userId === undefined) {
    res.sendStatus(401);
    return;
  }

  const layoutElementId = parseInt(req.params.layoutElementId);

  if (isNaN(layoutElementId)) {
    // bad request
    return res.sendStatus(400);
  }

  try {
    const widgetSettings = await prisma.widgetSettings.findUnique({
      where: {
        layoutElementId
      }
    });

    if (widgetSettings === null) {
      return res.sendStatus(404);
    }

    const linkSettings = await prisma.linkSettings.findUnique({
      where: {
        widgetSettingsId: widgetSettings.id
      }
    });

    if (linkSettings === null) {
      return res.sendStatus(404);
    } else {
      res.status(200).send(linkSettings.url);
    }
  } catch (error) {
    console.error('Failed to GET link url:', error);
    res.sendStatus(500);
  }
});

link.patch('/:layoutElementId', async (req, res) => {
  // check auth
  const userId = req.user?.id;

  if (userId === undefined) {
    res.sendStatus(401);
    return;
  }

  const layoutElementId = parseInt(req.params.layoutElementId);
  const { url }: { url: string | undefined }  = req.body;

  if (isNaN(layoutElementId) || url === undefined) {
    // bad request
    return res.sendStatus(400);
  }

  try {
    // check that the layout element exists
    const layoutElement = await prisma.layoutElement.findUnique({
      where: {
        id: layoutElementId
      },
      include: {
        layout: true
      }
    });

    if (!layoutElement) {
      return res.sendStatus(404);
    }

    // check that layout element belongs to a layout owned by the requesting user
    const ownerId = layoutElement.layout.ownerId;
    if (ownerId !== userId) {
      return res.status(403);
    }

    const widgetSettings = await prisma.widgetSettings.upsert({
      where: {
        layoutElementId
      },
      update: {},
      create: {
        layoutElementId
      }
    });

    await prisma.linkSettings.upsert({
      where: {
        widgetSettingsId: widgetSettings.id
      },
      update: {
        url
      },
      create: {
        widgetSettingsId: widgetSettings.id,
        url
      }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('Failed to update link url:', error);
    res.sendStatus(500);
  }
});

export default link;
