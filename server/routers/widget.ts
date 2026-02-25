import express from 'express';
import { prisma } from '../database/prisma.js';

const widget = express.Router();

/**
 * GET all available widgets
 * Used by the WidgetLibrary component
 */
widget.get('/', async (req, res) => {
  try {
    const widgets = await prisma.widget.findMany({
      select: {
        id: true,
        name: true
      }
    });

    res.status(200).send(widgets);
  } catch (error) {
    console.error("Failed to fetch widgets:", error);
    res.status(500).send({ error: "Could not fetch widgets" });
  }
});

export default widget;