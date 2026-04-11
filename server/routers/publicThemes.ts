import express from 'express';

import { prisma } from '../database/prisma.js';

const publicThemes = express.Router();

// get the public themes from all the whole database
publicThemes.get('/', async (req, res) => {
  try {
    const themes = await prisma.publicThemes.findMany({
      include: {
        theme: true,
        owner: true
      }
    })
    return res.status(200).send({ themes })
  } catch (error) {
    return res.status(500).send({ 'Could not get public themes': error })
  }
})

// add the theme to the public list

publicThemes.post('/', async (req, res) => {
  const { themeId, ownerId} = req.body
  try {
    await prisma.publicThemes.create({
      data: {
        themeId: themeId,
        ownerId: ownerId
      }
    })
    return res.status(201).send('added theme to the list of public themes')
  } catch (error) {
    return res.status(500).send({ 'Could not save theme': error })
  }
})
// add a public theme to the users theme collection but with the user who is saving the theme
// it need to be a COPY
publicThemes.post('/:themeId/:userId', async (req, res) => {
  const themeId = Number(req.params.themeId)
  const userId = Number(req.params.userId)

  try {
    // find the original theme
    const original = await prisma.theme.findUnique({
      where: { id: themeId }
    })

    if (!original) {
      return res.status(404).send('Could not find the theme')
    }

    // create a COPY of the theme - so it does NOT affect the original
    await prisma.theme.create({
      data: {
        navColor: original.navColor,
        bgColor: original.bgColor,
        font: original.font,
        name: original.name,
        public: false,
        ownerId: userId
      }
    })

    
    // const publicTheme = await prisma.publicThemes.create({
    //   data: {
    //     themeId: themeCopy.id,
    //     ownerId: userId
    //   }
    // })

    return res.status(201).send('it was added to the users profile')
  } catch (error) {
    return res.status(500).send({ 'Could not save theme': error })
  }
})


// DELETE for removing the theme from  publicThemes, but not the database
publicThemes.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  try {
    const existing = await prisma.publicThemes.findFirst({
      where: {
        themeId: id
      }
    })

    if (!existing) {
      return res.status(404).send('Could not find the public theme')
    }

    await prisma.publicThemes.delete({
      where: {
        id: existing.id
      }
    })

    return res.status(200).send('Theme removed from public themes')
  } catch (error) {
    return res.status(500).send({ 'Could not delete theme': error })
  }
})




export default publicThemes;