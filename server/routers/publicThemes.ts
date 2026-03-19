import express from 'express';

import { prisma } from '../database/prisma.js';

const publicThemes = express.Router();

// get the public themes from all the whole database



// add a public theme to the users theme collection but with the user who is saving the theme
// it need to be a COPY



// there is no PATCH, user cannot edit anything here


// also there is no DELETE, this will be in the theme.ts file





export default publicThemes;