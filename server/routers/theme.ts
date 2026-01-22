import express from 'express';

import { prisma } from '../database/prisma.js';

const theme = express.Router();

// GET
theme.get('/', (req, res) => {
  res.status(200).send('GET is working');
})


// POST - This is for the user clicking something like 'Create a new theme'
// change the dashboard color
theme.post('/', async (req, res) => {
  // need to insert information
  // console.log(req)
  const { public: isPublic, navColor, bgColor, font, ownerId} = req.body as {public: boolean, navColor: string, bgColor: string, font: string, ownerId: number}
  console.log(ownerId, 'HELLLOOOOOO');
  try {
    await prisma.theme.create({
      data: {
      public: isPublic,
      navColor,
      bgColor,
      font,
      ownerId: ownerId
      }
    })
    res.sendStatus(201);
  } catch (error) {
    console.error('You already have this theme', error);
    res.sendStatus(500);
  }
})


// POST - This is for the user clicking something like 'Create a new theme' and they have to enter a title
// maybe if no name is given, default will be the name but with the number
// change the dashboard name



// PUT/PATCH - This will be if a user clicks on a dashboard and starts the change the colors - name
// update the dashboard colors
// have to get the id of the theme
theme.patch('/', async (req, res) => {
  // need to insert information
  // console.log(req)
  const { public: isPublic, navColor, bgColor, font, ownerId} = req.body as {public: boolean, navColor: string, bgColor: string, font: string, ownerId: number}
  const {id} = req.body;
  console.log(ownerId, 'HELLLOOOOOO');
  try {
    await prisma.theme.update({
      where: {
        id: id
      },
      data: {
      public: isPublic,
      navColor,
      bgColor,
      font,
      ownerId: ownerId
      }
    })
    res.sendStatus(201);
  } catch (error) {
    console.error('You already updated this theme', error);
    res.sendStatus(500);
  }

})



export default theme;