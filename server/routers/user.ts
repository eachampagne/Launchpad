import express from 'express';
import passport from 'passport';
import { User } from '../../generated/prisma/client.js' // * 'User' Type.

import { prisma } from '../database/prisma.js';

const user = express.Router();

// GET

// This is a temporary example function. It demonstrates how to 
user.get('/', (req : any, res) => {
  if (req.user) {
    prisma.user.findUnique({where: {id: req.user.id}}).then((user: any) => { // ? Open Request: Update 'any' to accurately reflect what it is. It should be a User, but it freaks out when it is.
      res.status(200).send(user.name);
    })
  } else {
    res.status(200).send('You are not logged in.');
  }
})

export default user;