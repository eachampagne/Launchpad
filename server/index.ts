import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';

import { loadDashboardSchedules } from './cron/dashboard-scheduler.js';

import router from './routers/router.js';

// * AUTH
import session from 'express-session';
import passport from 'passport';
import authRouter from './routers/auth.js'
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
// * AUTH 

import { prisma } from './database/prisma.js';

const app = express();

const port = Number(process.env.PORT) || 8000;
const host = '0.0.0.0';

// thanks to the Socket.IO docs for this
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(__dirname, '..', '..','dist'))); // evidently this is relative to the compiled index.js file

// * AUTH 

// create demo account if doesn't exist on server start
// (means the database being reset won't remove the account)
await prisma.user.upsert({
  where: { id: 0 },
  update: {},
  create: {
    id: 0, // won't conflict with normal users because Prisma starts at 1
    name: 'Demo account',
    credentialProvider: '',
    credentialSubject: ''
  }
});

app.use(session({
  secret: process.env['secret']!, //  ! [variable]! means that it is not checking for null. Be careful!
  resave: true,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, // milliseconds roughly equal to 2 minutes
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined
  })
}));

app.use(passport.authenticate('session'));

app.use('/', authRouter);
// * AUTH 

app.use(router);

// Catch all for client side routes
app.get('/*any', (req, res) => {
  res.sendFile(join(__dirname, '..', '..', 'dist', 'index.html'));
})

// wait for dashboard scheduler before starting server
async function startServer() {
  await loadDashboardSchedules();

  app.listen(port, host, () => {
    console.info(`Listening on http://localhost:${port}`);
  });
}


startServer();
