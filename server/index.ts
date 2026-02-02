import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';

import { loadDashboardSchedules } from './cron/dashboard-scheduler.js';

import router from './routers/router.js';

// * AUTH
import session from 'express-session';
import passport from 'passport';
import authRouter from './routers/auth.js'
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
// * AUTH 

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const app = express();

const port = Number(process.env.PORT) || 8000;
const host = '0.0.0.0';

// thanks to the Socket.IO docs for this
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(__dirname, '..', '..','dist'))); // evidently this is relative to the compiled index.js file

// * AUTH 
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
