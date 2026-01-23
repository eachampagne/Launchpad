import express from 'express';

import { prisma } from '../database/prisma.js';

import dashboardRouter from './dashboard.js';

const router = express.Router();

router.use('/dashboard', dashboardRouter);

router.post('/user', async (req, res) => {
  const { name }: { name: string} = req.body;

  try {
    await prisma.user.create({
      data: {
        name,
        credentialProvider: "",
        credentialSubject: ""
      }
    });

    console.log("Created user... hopefully");
    res.sendStatus(201);
  } catch (error) {
    console.error("Failed to create user:", error);
    res.sendStatus(500);
  }
});

export default router;
