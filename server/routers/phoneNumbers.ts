import express from 'express';

import { prisma } from '../database/prisma.js';
import { stat } from 'node:fs';

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

// PATCH - need to make it to where if they want to change the number, they can
// but also if they click a button or verify those fields are changed too
phoneNumbers.patch('/:ownerId', async (req, res) => {
  const { notifications, contactNumber} = req.body
  try {
    const existing = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })

    // check if it exist
    if(!existing){
      res.status(404).send('You have nothing to update')
    }

    const data: {
      contactNumber?: string,
      verified?: boolean,
      notifications?: boolean
    } = {}
    // if the contactNumber is provided - update the phone number
    if(contactNumber){
      data.contactNumber = contactNumber
      data.verified = false
      data.notifications = false
    }

    // if something is clicked change the boolean value
    // if(typeof verified === 'boolean'){
    //   data.verified = verified
    // }

    // if(typeof notifications === 'boolean'){
    //   data.notifications = notifications
    // }

    data.notifications = !existing?.notifications

    const status = await prisma.phoneNumbers.update({
      where: {
        userId: Number(req.params.ownerId)
      },
      data
    })
    res.status(201).send({'Successful': status})
  } catch (error) {
    res.status(500).send({'You have no number to update': error})
  }
})

phoneNumbers.patch('/verify/:ownerId', async (req, res) => {
  //const { verified } = req.body;
  
  try {
    const existing = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })

    if(existing?.verified === true){
      res.status(404).send('This number is already verified')
    }

    await prisma.phoneNumbers.update({
      where: {
        userId: Number(req.params.ownerId)
      },
      data: {
        verified : true
      }
    })
    res.status(201).send('Success')
  } catch (error) {
      res.status(500).send({'Could not verify': error})
    }
  })

phoneNumbers.delete('/:ownerId', async (req, res) => {
  try {
    await prisma.phoneNumbers.delete({
      where: {
        userId: Number(req.params.ownerId)
      }
    })
    res.status(200).send('Successful')
  } catch (error) {
      res.status(500).send({'Could not delete': error})
    }
})
export default phoneNumbers;