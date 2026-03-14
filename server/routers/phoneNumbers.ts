import express from 'express';
import { prisma } from '../database/prisma.js';
import "dotenv/config";
import twilio, { Twilio } from 'twilio'
import { use } from 'passport';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
let client: Twilio | undefined;

if (process.env.NODE_ENV !== "test") {
  if (!accountSid || !authToken) {
    throw new Error("Missing Twilio environment variables");
  }
  client = twilio(accountSid, authToken);
}

const phoneNumbers = express.Router();

// GET the phone number of the user
phoneNumbers.get('/:ownerId', async (req, res) => {

  try {
    const userNumber = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })

    if(!userNumber){
      return res.status(404).send('Could not find your account')
    }
    const data = {
      contact: userNumber.contactNumber,
      noti: userNumber.notifications,
      verified: userNumber.verified
    }
    // console.log(Number(req.params.ownerId))
    return res.status(200).send({
      data
    })
  } catch (error) {
    return res.status(500).send({'Could not fetch the phone number': error})
  }
})

// POST - INSERT the number provided by the user
phoneNumbers.post('/:ownerId', async (req, res) => {
  const  ownerId  = Number(req.params.ownerId)
  const {contactNumber} = req.body as {contactNumber:string}
  if(!contactNumber){
    return res.status(404).send({error: 'You need to provide a phone number'})
  }
  try {
    const existing = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })

    if(existing){

      return res.status(404).send('You already have a phone number')
      
    }

      await prisma.phoneNumbers.create({
        data: {
          userId: ownerId,
          verified: false,
          notifications: false,
          contactNumber
        }
      })
      return res.status(201).send('Successful')


  } catch (error) {
    return res.status(500).send({'Could not add the phone number': error})
  }

})

// send the verification code
phoneNumbers.post('/verify/send/:ownerId', async (req, res) => {
  try {
    if (!client) {
      return res.status(503).send("Twilio not configured");
    }
    const existing = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })

    if(!existing || !existing.contactNumber){
      return res.status(404).send('Could not find your account')
    }

    const phone = existing?.contactNumber.startsWith('+')
    ? existing?.contactNumber : '+1' + existing?.contactNumber

    const verification = await client.verify.v2.services("VA7937e5f669dd205b29a3a78482ad9b64")
    .verifications
    .create({to: phone, channel: 'sms'})

    return res.status(201).send(verification)
  } catch (error) {
    return res.status(500).send({'something went wrong with sending the verification code' : error})
  }
})

// verify the verification code
phoneNumbers.post('/verify/check/:ownerId', async (req, res) => {
  // gets the verification code they put in the field
  try {
    if (!client) {
      return res.status(503).send("Twilio not configured");
    }
    const { code } = req.body

    if(!code){
      return res.status(404).send('Please enter the Verification code')
    }

    const existing = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })

    if(!existing || !existing?.contactNumber){
      return res.status(404).send('Could not find your account')
    }

    const phone = existing?.contactNumber.startsWith('+')
    ? existing?.contactNumber : '+1' + existing?.contactNumber


    const verificationCheck = await client.verify.v2.services("VA7937e5f669dd205b29a3a78482ad9b64")
    .verificationChecks.create({
      to: phone,
      code: code
    })
    if(verificationCheck.status === 'approved'){
      await prisma.phoneNumbers.update({
        where: {
          userId: Number(req.params.ownerId)
        },
        data: {
          verified: true
        }
      })
      return res.status(201).send({verified: true})
    } else {
      return res.status(404).send({verified: false})
    }
  } catch (error) {
    return res.status(500).send({'something went wrong with verifying the verification code' : error})

  }
})



phoneNumbers.patch('/verify/:ownerId', async (req, res) => {
  try {
    const existing = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })

    if(existing?.verified === true){
      return res.status(404).send('This number is already verified')
    }

    await prisma.phoneNumbers.update({
      where: {
        userId: Number(req.params.ownerId)
      },
      data: {
        verified : true
      }
    })
    return res.status(201).send('Success')
  } catch (error) {
    return res.status(500).send({'Could not verify': error})
    }
  })

  // for changing notification boolean only
  phoneNumbers.patch('/notifications/:ownerId', async (req, res) => {
    const {notifications} = req.body
    try {
      const existing = await prisma.phoneNumbers.findUnique({
        where: {
          userId: Number(req.params.ownerId)
        }
      })
  
      if(!existing){
        return res.status(404).send('Could not find the number')
      }
  
      await prisma.phoneNumbers.update({
        where: {
          userId: Number(req.params.ownerId)
        },
        data: {
          notifications
        }
      })
      return res.status(201).send({notifications})
    } catch (error) {
      return res.status(500).send({'Could not verify': error})
      }
  })

// PATCH - need to make it to where if they want to change the number, they can
// but also if they click a button or verify those fields are changed too
phoneNumbers.patch('/:ownerId', async (req, res) => {
  const { contactNumber} = req.body
  try {
    const existing = await prisma.phoneNumbers.findUnique({
      where: {
        userId: Number(req.params.ownerId)
      }
    })

    if(!existing){
      return res.status(404).send('You have nothing to update')
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


    const status = await prisma.phoneNumbers.update({
      where: {
        userId: Number(req.params.ownerId)
      },
      data
    })
    return res.status(201).send({'Successful': status})
  } catch (error) {
    return res.status(500).send({'You have no number to update': error})
  }
})




phoneNumbers.delete('/:ownerId', async (req, res) => {
  try {
    await prisma.phoneNumbers.delete({
      where: {
        userId: Number(req.params.ownerId)
      }
    })
    return res.status(200).send('Successful')
  } catch (error) {
    return res.status(500).send({'Could not delete': error})
    }
})


export default phoneNumbers;