import express from 'express';

import { prisma } from '../database/prisma.js';

const theme = express.Router();


// all themes of user
theme.get('/owner/:ownerId', async (req, res) => {
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

// for getting public themes
theme.get('/public', async (req, res) => {
  try {
    const themes = await prisma.theme.findMany({
      where: {
        public: true
      }
    })
    if (themes) {
      res.status(200).send(themes)
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    console.error('Could not get public themes', error)
    res.sendStatus(500)
  }
})

// find one theme
theme.get('/:themeId', async (req, res) => {
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


// POST - Creating a new theme
theme.post('/', async (req, res) => {
  const { public: isPublic, navColor, bgColor, font, ownerId, name} = req.body as {public: boolean, navColor: string, bgColor: string, font: string, ownerId: number, name?: string}
  try {
    await prisma.theme.create({
      data: {
      public: isPublic,
      navColor,
      bgColor,
      font,
      ownerId: ownerId,
      name: name ?? 'default'
      }
    })
    res.sendStatus(201);
  } catch (error) {
    console.error('You already have this theme', error);
    res.sendStatus(500);
  }
})


// PUT/PATCH - Updates the theme that is current selected
theme.patch('/', async (req, res) => {
  console.log('PATCH / hit, body:', req.body)
  const { id, public: isPublic, navColor, bgColor, font, ownerId, name} = req.body
  try {
    await prisma.theme.update({
      where: {
        id: Number(id)
      },
      data: {
      public: isPublic ?? false,
      navColor,
      bgColor,
      font,
      ownerId: Number(ownerId),
      name: name ?? 'default'
      }
    })
    res.sendStatus(201);
  } catch (error) {
    console.error('You already updated this theme', error);
    res.sendStatus(500);
  }

})

// PATCH for public themes

theme.patch('/:themeId', async (req, res) => {
  const themeId = Number(req.params.themeId)
  

  try {
    // find the theme by the id
    const existing = await prisma.theme.findFirst({
      where: {
        id: themeId
      }
    })
  
    if(!existing){
      return res.status(404).send('Could not find the number')
    }
    

    // if(existing.ownerId !== ownerId){
    //   return res.status(403).send('You do not own this theme');
    // }

    const publicTheme = await prisma.theme.update({
      where: {
        id: existing.id
      },
      data: {
        public: !existing.public
      }
    })
    // if we find it, change the public status to its opposite
    
    return res.status(201).send({theme : publicTheme})
  } catch (error) {
    return res.status(500).send({'Could not verify': error})
    }
})






// DELETE a theme
theme.delete('/delete/:ownerId', async (req, res) => {
  const { themeId } = req.body
  try {
    await prisma.theme.delete({
      where: {
        
        id: themeId
      }
    })
      res.sendStatus(200);
  } catch (error){
    console.error('You already have this theme', error);
    res.sendStatus(500);
  }
})


// for now there is no duplicate name restraint
// GET the name - it can go with the theme anyway




// POST the name



// PATCH the name


export default theme;