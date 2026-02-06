import express from 'express';
import passport from 'passport';
import { User } from '../../generated/prisma/client.js' // * 'User' Type.

import { prisma } from '../database/prisma.js';

const user = express.Router();

// GET

// This is a temporary example function. It demonstrates how to 
user.get('/', (req, res) => {
  if (req.user) {
    try {
      prisma.user.findUniqueOrThrow({where: {id: req.user.id}}).then((user) => { // ? Open Request: Update 'any' to accurately reflect what it is. It should be a User, but it freaks out when it is.        
        // exposing the user's credential provider and subject seems bad
        res.status(200).send({
          id: user.id,
          primaryDashId: user.primaryDashId,
          name: user.name
        });
      })
    } catch (error) {
      console.error('Failed to find unique user in database despite user object existing on request:', error);
      res.status(500);
    }
  } else {
    res.status(200).send('You are not logged in.');
  }
})

export default user;
