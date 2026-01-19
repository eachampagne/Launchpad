import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';
import session from 'express-session'; //we'll see
import passport from 'passport';
import router from './auth.js' //we'll see

import {test} from './database/script.js'
// import something for connection?

const app = express();
const port = 8000;

// thanks to the Socket.IO docs for this
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(__dirname, '..', 'dist')));
app.use('/', router);

app.use(session({
  secret: 'temp test',
  resave: false,
  saveUninitialized: false,
  // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
app.use(passport.authenticate('session'));

app.listen(port, () => {
  console.info(`Listening on http://localhost:${port}`);
});

console.log(test);