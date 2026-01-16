import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express from 'express';

import test from './router.js';

const app = express();
const port = 8000;

// thanks to the Socket.IO docs for this
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(join(__dirname, '..', 'dist')));

app.listen(port, () => {
  console.info(`Listening on http://localhost:${port}`);
});