import express from 'express';

import { prisma } from '../database/prisma.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send("working!");
});

router.post('/user', (req, res) => {
  const { name }: { name: string} = req.body;

  prisma.user.create({
    data: {
      name,
      credentialProvider: "",
      credentialSubject: 0
    }
  })
    .then(() => {
      console.log("Created user... hopefully");
      res.sendStatus(201);
    })
    .catch((error) => {
      console.error("Failed to create user:", error);
      res.sendStatus(500);
    })
});

export default router;
