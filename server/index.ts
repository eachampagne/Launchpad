import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';

import router from './routers/router.js';

// * AUTH
import session from 'express-session';
import passport from 'passport';
import authRouter from './routers/auth.js'
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaSessionStore } from '@quixo3/prisma-session-store';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
import theme from './routers/theme.js'
import user from './routers/user.js'
import test from './database/script.js';

const app = express();
/*
Helpful Vocabulary:

Cloud Run - a deployment service provided by Google Cloud platform that handles automatic scaling without infrastructure management.

Container - a self-contained, executable package of software that bundles your application code, its dependencies, 
system tools, libraries, and configuration, allowing it to run consistently and portably in isolated environments.
_____________________________________________________________________________________________________________________________________

Explaining usage of process.env.PORT:

PORT environment variable allows app to be portable across different hosting environments.
The environment reads PORT from Cloud Run or defaults to 8000 (in our case, not required to be 8000) for local testing.
Cloud Run then injects the PORT environment variable into your container instance (the deployed version of the code) 
Number() converts PORT from a string to number to work with app.listen() port parameter type assertions since app.listen 
expects only a number value as port, and process.env.PORT is a string.
*/ 
const port = Number(process.env.PORT) || 8000;
/* 
The ingress container within an instance must listen for requests on 0.0.0.0

Link to documentation referencing this:
https://docs.cloud.google.com/run/docs/container-contract#:~:text=must%20be%20met:-,Container%20deployed%20to%20services%20must%20listen%20for%20requests%20on%20the,any%20transport%20layer%20security%20directly.
 */
const host = '0.0.0.0';

// thanks to the Socket.IO docs for this
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(__dirname, '..', '..','dist'))); // evidently this is relative to the compiled index.js file

// * AUTH STUFF FROM HERE ON
app.use(session({
  secret: 'temp test', // TODO: Change this later to an env variable.
  resave: true,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, // milliseconds roughly equal to 2 minutes?
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined
  })
}));

app.use(passport.authenticate('session'));

app.use('/', authRouter);

app.use(router);
app.use('/theme', theme);
app.use('/user', user);

app.listen(port, host, () => {
  console.info(`Listening on http://localhost:${port}`);
});
