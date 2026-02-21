import express from 'express';

import { prisma } from '../database/prisma.js';

const theme = express.Router();

// find one theme
theme.get('/theme/:themeId', async (req, res) => {
  try {
    const currentTheme = await prisma.theme.findUnique({
      where: {
        id: Number(req.params.themeId)
      }
    })
    console.log(currentTheme)
    if(!currentTheme){
      return res.status(404).send('No theme was found')
    }

    res.status(200).send(currentTheme)
  } catch (error) {
    console.error('You have no theme selected', error);
    res.sendStatus(500);
  }
})

// GET
theme.get('/:ownerId', async (req, res) => {
  //const { ownerId } = JSON.parse(req.params);
  try {
    const themes = await prisma.theme.findMany({
      where: {
        ownerId: Number(req.params.ownerId)
      }
    })
    if(themes){
      res.status(200).send(themes);
    } else {
      res.sendStatus(404);
    }
  } catch (error){
    console.error('You already have this theme', error);
    res.sendStatus(500);
  }
})

// POST - This is for the user clicking something like 'Create a new theme'
// change the dashboard color
theme.post('/', async (req, res) => {
  // need to insert information
  // console.log(req)
  const { public: isPublic, navColor, bgColor, font, ownerId} = req.body as {public: boolean, navColor: string, bgColor: string, font: string, ownerId: number}
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
  const { id, public: isPublic, navColor, bgColor, font, ownerId} = req.body as {id: number, public: boolean, navColor: string, bgColor: string, font: string, ownerId: number}
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

// delete
theme.delete('/delete/:ownerId', async (req, res) => {
  const { themeId } = req.body
  try {
    await prisma.theme.delete({
      where: {
        ownerId: Number(req.params.ownerId),
        id: themeId
      }
    })
      res.sendStatus(200);

    
  } catch (error){
    console.error('You already have this theme', error);
    res.sendStatus(500);
  }
})


export default theme;