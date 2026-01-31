import express from 'express';

import { prisma } from '../database/prisma.js';

const phoneNumbers = express.Router();

phoneNumbers.get('/:ownerId', async (req, res) => {
  // gonna have to use the userId

  try {
    const userNumber = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })
     console.log(Number(req.params.ownerId))
    res.status(200).send(userNumber)
  } catch (error) {
    res.status(500).send({'Could not fetch the phone number': error})
  }
})

export default phoneNumbers;