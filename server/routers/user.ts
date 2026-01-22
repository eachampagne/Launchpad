import express from 'express';
import passport from 'passport';

import { prisma } from '../database/prisma.js';

const user = express.Router();



// GET
user.get('/', (req : any, res) => {
  if (req.user) {
    prisma.user.findUnique({where: {id: req.user.id}}).then((user) => {
      res.status(200).send(req.user.name);
    })
  } else {
    res.status(200).send('You are not logged in.');
  }
})

export default user;