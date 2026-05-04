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

// POST - copy an existing theme - either public or owned by the current user
theme.post('/:themeId/copy', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    return res.sendStatus(401);
  }

  const userId = req.user.id;
  const themeId = parseInt(req.params.themeId);

  if (isNaN(themeId)) {
    return res.sendStatus(400); // bad request
  }

  try {
    const original = await prisma.theme.findUnique({where: {id: themeId}});

    // make sure theme exists
    if (!original) {
      return res.sendStatus(404);
    }

    // can only copy a theme that is either public or owned by the current user
    if (!(original.public || original.ownerId === userId)) {
      return res.sendStatus(403);
    }

    const copy = await prisma.theme.create({data: {
      navColor: original.navColor,
      bgColor: original.bgColor,
      font: original.font,
      name: original.name,
      public: false,
      ownerId: userId
    }});

    res.status(201).send(copy);
  } catch (error) {
    console.error('Failed to copy theme:', error);
    res.sendStatus(500);
  }
});


// PUT/PATCH - Updates the theme that is current selected
theme.patch('/', async (req, res) => {
  console.log('PATCH / hit, body:', req.body)

  // check auth
  if (req.user === undefined) {
    return res.sendStatus(401);
  }

  const userId = req.user.id;

  // I *guess* an owner could in theory transfer ownership to someone else, so (new) ownerId might not === userId? There's nowhere in the front end that allows this though
  const { id, public: isPublic, navColor, bgColor, font, ownerId, name} = req.body
  try {
    const existing = await prisma.theme.findUnique({where: {id}});

    // make sure theme exists
    if (!existing) {
      return res.sendStatus(404);
    }

    // make sure theme is owned by the user trying to update it
    if (existing.ownerId !== userId) {
      return res.sendStatus(403);
    }

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
  // check auth
  if (req.user === undefined) {
    return res.sendStatus(401);
  }

  const userId = req.user.id;
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
    

    if(existing.ownerId !== userId){
      return res.status(403).send('You do not own this theme');
    }

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