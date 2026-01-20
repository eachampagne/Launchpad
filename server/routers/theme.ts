import express from 'express';

import { prisma } from '../database/prisma.js';

const theme = express.Router();

// GET
theme.get('/', (req, res) => {
  res.status(200).send('GET is working');
})


// POST - This is for the user clicking something like 'Create a new theme'
// change the dashboard color



// POST - This is for the user clicking something like 'Create a new theme' and they have to enter a title
// maybe if no name is given, default will be the name but with the number
// change the dashboard name



// PUT/PATCH - This will be if a user clicks on a dashboard and starts the change the colors - name
// update the dashboard colors
// update the dashboard name

export default theme;