import express from 'express';

// import dashboardRouter from './dashboard.js';
// import userRouter from './user.js'

import theme from './theme.js';
import layout from './layout.js';
import user from './user.js';
import calendar from './calendar.js';
import email from './email.js';
import timer from './timer.js';
import phoneNumbers from './phoneNumbers.js';
import dashboard from './dashboard.js';
import schedule from './schedule.js';

const router = express.Router();

router.use('/schedule', schedule);
router.use('/dashboard', dashboard);
router.use('/theme', theme);
router.use('/calendar', calendar);
router.use('/layout', layout);
router.use('/user', user);
router.use('/email', email);
router.use('/timer', timer);
router.use('/notifications', phoneNumbers);

// router.post('/create', async (req, res) => {
//   const { name }: { name: string} = req.body;

//   try {
//     await prisma.user.create({
//       data: {
//         name,
//         credentialProvider: "",
//         credentialSubject: ""
//       }
//     });

//     console.log("Created user... hopefully");
//     res.sendStatus(201);
//   } catch (error) {
//     console.error("Failed to create user:", error);
//     res.sendStatus(500);
//   }
// });

export default router;
