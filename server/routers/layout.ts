import express from 'express';

import { prisma } from '../database/prisma.js';

const layout = express.Router();

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

// TODO: 
// If you aren't the user that created it, or if it isn't public, don't load it.

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

// TODO:
// Layout + Elm

// POST: Allows the user to add a widget.
  // we need... the id of the current layout.
  // the id the the widget they want to add.
  // to create a new layoutElement.
  // we don't need to do this, this is done automatically: // // to add that layout element to the current layout. (push it to the scalar list.)
    

  // we expect the id of the layout to be the parameter, and the widget-id to be in the body. widget settings should be an object with the settings of the widgets position and size.
layout.post('/:layoutId/element', async (req, res) => {
  const layoutId = Number(req.params.layoutId);
  const widgetId = req.body.widgetId;
  const {posX, posY, sizeX, sizeY} = req.body.widgetSettings

    try {
    const layoutElement = await prisma.layoutElement.create({
      data: { layoutId, widgetId, posX, posY, sizeX, sizeY },
    })

    res.status(201).send(layoutElement);
  } catch (error) {
    res.status(500).send({'There was a problem during the creation of a layout element:': error})
  }

});

// PATCH: Allows the user to drag/resize, or change other settings.

layout.patch('/:elementId', async (req, res) => {
  const elementId = Number(req.params.elementId);
  const {posX, posY, sizeX, sizeY} = req.body.widgetSettings

    try {
    const layoutElement = await prisma.layoutElement.update({
      where: {id: elementId},
      data: { posX, posY, sizeX, sizeY },
    })

    res.status(200).send(layoutElement);
  } catch (error) {
    res.status(500).send({'There was a problem during changing the settings of a layout element:': error})
  }

});

// DELETE: Remove an element from a layout.

layout.delete('/:elementId', async (req, res) => {
  const elementId = Number(req.params.elementId);

    try {
      await prisma.layoutElement.delete({
        where: {id: elementId}
      })

      res.sendStatus(201);
  } catch (error) {
      res.status(500).send({'There was a problem during the deletion of a layout element:': error})
  }

});

export default layout;