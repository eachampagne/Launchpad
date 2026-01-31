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

// POST - user CANNOT have two phone numbers
phoneNumbers.post('/:ownerId', async (req, res) => {
  const  ownerId  = Number(req.params.ownerId)
  const {verified = false, notifications = false, contactNumber} = req.body as {verified:boolean, notifications:boolean, contactNumber:string}

  // if no number is provided
  if(!contactNumber){
    res.status(404).send({error: 'You need to provide a phone number'})
  }
  try {
    const existing = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })

    // check if it exist
    if(existing){
      res.status(404).send('You already have a phone number')
    }

      await prisma.phoneNumbers.create({
        data: {
          userId: ownerId,
          verified,
          notifications,
          contactNumber
        }
      })
      res.status(201).send('Successful')
    
    

  } catch (error) {
    res.status(500).send({'Could not add the phone number': error})
  }

})

export default phoneNumbers;