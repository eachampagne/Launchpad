import express from 'express';

//import { Prisma } from '../../generated/prisma/client.js'; // not sure about this, although it matches what was in database/prisma

import { prisma } from '../database/prisma.js';

const layout = express.Router();

// GET
layout.get('/', (req, res) => {
  res.status(200).send('LAYOUT GET');
});


// layout.get('/public',() => {

// })





export default layout;