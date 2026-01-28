import express from 'express';
import passport from 'passport'

//import { Prisma } from '@prisma/client';
import { Prisma } from '../../generated/prisma/client.js'; // not sure about this, although it matches what was in database/prisma
import { prisma } from '../database/prisma.js';
import theme from './theme.js';

const router = express.Router();

// used to grab all of a specific user's dashboards
router.get('/all/:id', async (req, res) => {
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

// router.get('/:id', async (req, res) => {
//   // there should be some sort of auth here to check if the given dashboard
//   // either belongs to the user or is public

//   const { id: idString } = req.params;
//   const id = parseInt(idString);

//   try {
//     const dashboard = await prisma.dashboard.findUnique({
//       where: {
//         id
//       }
//     });

//     // TODO: check whether the given user should have access to this dashboard

//     if (!dashboard) { // dashboard is null if not found
//       res.sendStatus(404);
//     } else {
//       res.status(200).send(dashboard);
//     }
//   } catch (error) {
//     console.error('Failed to find dashboard: ', error);
//     res.sendStatus(500);
//   }
// });

router.post('/', async (req, res) => {
  // TODO: all sorts of auth
  // only authorized users should be allowed to create dashboards
  // the user's identity should be pulled from the session info
  // rather than just being the client saying "trust me bro"

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

router.patch('/:id', async (req, res) => {
  // TODO: auth!!

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



// deletes dashboard based on dashboard id
router.delete('/:id', async (req, res) => {

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


export default router;
