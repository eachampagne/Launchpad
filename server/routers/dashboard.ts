import express from 'express';
import passport from 'passport'

//import { Prisma } from '@prisma/client';
import { Prisma } from '../../generated/prisma/client.js'; // not sure about this, although it matches what was in database/prisma
import { prisma } from '../database/prisma.js';
import theme from './theme.js';

const dashboard = express.Router();

// used to grab all of a specific user's dashboards
dashboard.get('/all/:id', async (req, res) => {
// TODO AUTH
  const { id: idString } = req.params;
  const id = parseInt(idString);
  
  try {
    const user = await prisma.user.findUnique({
      include: {
        dashboards: true
      },
      where: {
        id
      }
    })

    if (user === null) {
      res.sendStatus(404);
      return;
    }
     
    const dashboards = user.dashboards
    res.status(200).send(dashboards)
  } catch (error) {
    console.error(error)
  }
});

dashboard.get('/:id', async (req, res) => {
  // there should be some sort of auth here to check if the given dashboard
  // either belongs to the user or is public

  const { id: idString } = req.params;
  const id = parseInt(idString);

  try {
    const dashboard = await prisma.dashboard.findUnique({
      where: {
        id
      },
      include : {
        layout: {
          include : {
            layoutElements : {
              include : { widget: true }

            }
          }
        }
      }
    });

    // TODO: check whether the given user should have access to this dashboard

    if (!dashboard) { // dashboard is null if not found
      res.sendStatus(404);
    } else {
      res.status(200).send(dashboard);
    }
  } catch (error) {
    console.error('Failed to find dashboard: ', error);
    res.sendStatus(500);
  }
});

dashboard.post('/', async (req, res) => {
  // TODO: all sorts of auth
  // only authorized users should be allowed to create dashboards
  // the user's identity should be pulled from the session info
  // rather than just being the client saying "trust me bro"

  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const { ownerId, name } = req.body;

  try {
    // auth would go here

    if (!ownerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        name,

        owner: {
          connect: { id: ownerId },
        },

        theme: {
          create: {
            owner: {
              connect: { id: ownerId },
            },
            navColor: "#111827",
            bgColor: "#ffffff",
            font: "Inter",
          },
        },

        layout: {
          create: {
            owner: {
              connect: { id: ownerId },
            },
            gridSize: "12x12",
          },
        },
      },
      include: {
        theme: true,
        layout: true,
      },
    });

    return res.status(201).json(dashboard);
  } catch (err) {
    console.error("Create dashboard error:", err);
    return res.status(500).json({ error: "Failed to create dashboard" });
  }
});

dashboard.patch('/:id', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

  const { name, themeId } = req.body;
  const { id: idString } = req.params;
  const id = parseInt(idString);

  try {
    await prisma.dashboard.update({
      where: {
        id
      },
      data: {
        name,
        themeId
      }
    });

    res.sendStatus(200);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.sendStatus(404);
        return;
      }
    }
    console.error('Failed to PATCH dashboard:', error);
    res.sendStatus(500);
  }
});

//This route should update layout used by a dashboard
dashboard.post('/:dashboardId/layout/:layoutId', async (req, res) => {
  const dashboardId = Number(req.params.dashboardId)
  const layoutId = Number(req.params.layoutId);
  const userId = 1; //TODO: add auth
  try {
    //Fetch public layout
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
    //Create private copy of layout
    const newLayout = await prisma.layout.create({
      data: {
        ownerId: userId,
        public: false,
        gridSize: sourceLayout.gridSize
      }
    });
    //Duplicate layout elements
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
    //Attach to dash
    const dashboard = await prisma.dashboard.update({
      where: {id: dashboardId},
      data: { layoutId: newLayout.id},
      include : {
        layout: {
          include : {
            layoutElements : {
              include : { widget: true }

            }
          }
        }
      }

    })
    //Return updated dash
    res.status(200).send(dashboard)
  } catch (error) {
    res.status(500).send({'Could not apply layout': error})
  }
})



// deletes dashboard based on dashboard id
dashboard.delete('/:id', async (req, res) => {

  // TODO AUTH

  const { id: idString } = req.params;
  const id = parseInt(idString);

  try {
    await prisma.dashboard.delete({
      where: {
        id
      }
    });

    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.sendStatus(404);
        return;
      }
    }
    console.error('Failed to DELETE dashboard:', error);
    res.sendStatus(500);
  }
})

// delete


export default dashboard;
