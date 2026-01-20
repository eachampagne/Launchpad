import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';

import router from './routers/router.js';
// import test from './database/script.js';

// AUTH
import session from 'express-session';
import passport from 'passport';
import authRouter from './routers/auth.js'
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const app = express();
const port = 8000;

// thanks to the Socket.IO docs for this
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(__dirname, '..', 'dist')));

// AUTH
app.use(session({
  secret: 'temp test',
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, { //WIP
    checkPeriod: 2 * 60 * 1000, // milliseconds roughly equal to 2 minutes?
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined
  })
}));

app.use(passport.authenticate('session'));

app.use('/', authRouter);

app.listen(port, () => {
  console.info(`Listening on http://localhost:${port}`);
});
