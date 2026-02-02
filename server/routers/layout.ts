import express from 'express';

import { prisma } from '../database/prisma.js';

const layout = express.Router();

//GET (route mounted)
// layout.get('/', (req, res) => {
//   res.status(200).send('LAYOUT GET');
// });


//READ: This should get all public layouts.
layout.get('/public', async (req, res) => {
  //console.log(' GET /layout/public hit');
  try {
    const layouts = await prisma.layout.findMany({
      where: {
        public: true
      },
      include: {
        layoutElements: {
          include: {
            widget: true
          }
        }
      }
    })
    //console.log('layouts from DB:', layout);
    res.status(200).send(layouts)
  } catch (error) {
    res.status(500).send({'Could not fetch public layouts:': error})
  }

})

//READ: This route will load one layout by id.
layout.get('/:layoutId', async (req, res) => {
  //grab layout id
  //needed to be converted to number
  const layoutId = Number(req.params.layoutId);
  try {
    //query db to find one layout w/ layoutId
    const layout = await prisma.layout.findUnique({
      where: { id: layoutId },
      //include all layout elms
      include: {
        layoutElements: {
          //for layout elms include widget
          include: { widget: true }
        }
      }
    });
    //check if layout exist first
    if(!layout){
      return res.status(404).send('Could find layout');
    }
    //return layout
    res.status(200).send(layout)
  } catch (error) {
    res.status(500).send({'Could not load layout:': error})
  }


//CREATE: This route will copy a public layout
layout.post('/:layoutId/copy', async (req, res) => {
  //needed to be converted to number
  const layoutId = Number(req.params.layoutId);
  const userId = 1; //TODO: add auth
  try {
    //query db to find one layout w/ layoutId
    const sourceLayout = await prisma.layout.findUnique({
      where: { id: layoutId },
      include: {
        layoutElements: {
          include: { widget: true }
        }
      }
    });

    if(!sourceLayout || !sourceLayout.public){
      console.log(sourceLayout)
      return res.status(404).send('Layout is not public or does not exist');
    }
    //create private copy of layout
    const newLayout = await prisma.layout.create({
      data: {
        ownerId: userId,
        public: false,
        gridSize: sourceLayout.gridSize
      }
    });
    //duplicate layout elements
    await prisma.layoutElement.createMany({
      data: sourceLayout.layoutElements.map(el =>({
        layoutId: newLayout.id,
        widgetId: el.widgetId,
        posX: el.posX,
        posY: el.posY,
        sizeX: el.sizeX,
        sizeY: el.sizeY
      }))
    })
    //send new copied layout
    res.status(200).send(newLayout)
  } catch (error) {
    res.status(500).send({'Could not copy layout': error})
  }
})
});



export default layout;