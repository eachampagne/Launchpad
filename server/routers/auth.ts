import crypto from 'node:crypto';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { google } from 'googleapis';
import GoogleStrategy from 'passport-google-oidc';
import { User } from '../../generated/prisma/client.js' // * 'User' Type.
import { prisma } from '../database/prisma.js';

const router = express.Router();

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'profile' ]
}, function verify (issuer : string, profile : {id: string, displayName: string}, cb : Function) {
  prisma.user.findFirst({
    where: {
      credentialProvider: issuer,
      credentialSubject: profile.id
    }
  }).then((user) => {
    if (!user) {
      return prisma.user.create({
        data: {
          name: profile.displayName,
          credentialProvider: issuer,
          credentialSubject: profile.id
        }
      }).then((newUser) => {
        return cb(null, newUser);
      })
    } else {
      return cb(null, user);
    }
  }).catch((err) => {
    cb(err);
  })
}));

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/hub',
  failureRedirect: '/'
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

passport.serializeUser(function(user : any, cb) { // ? Open Request: Replace 'any' with whatever it should be. (User doesn't work, but is what the function should take in.)
  process.nextTick(function() {
    return cb(null, { id: user.id, name: user.name });
  });
});

passport.deserializeUser(function(user : User, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// TODO - make this into a dictionary somehow to make it easier to add scopes
const scopes = {
  calendar: 'https://www.googleapis.com/auth/calendar.readonly',
  gmail: 'https://www.googleapis.com/auth/gmail.readonly'
};

// todo: use path param to check which authentication get
// todo: authenticate app user!
router.get('/auth/:widget', (req, res) => {
  let toAuthenticate: 'calendar' | 'gmail';

  switch (req.params.widget) {
    case "calendar":
      toAuthenticate = 'calendar';
      break;
    case "gmail":
      toAuthenticate = 'gmail';
      break;
    default:
      res.sendStatus(404);
      return;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET'],
    process.env['GOOGLE_AUTH_REDIRECT_URL']
  );

  const state = crypto.randomBytes(32).toString('hex');
  
  // store state in session - presumably this should happen in a specific request
  req.session.state = state;
  
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'online', // do I need offline?
    scope: scopes[toAuthenticate],
    include_granted_scopes: true,
    state: state
  });

  res.redirect(authorizationUrl);
});

// TODO: fix any
// TODO: delete superseded tokens?
router.get('/auth/redirect/google', async (req: any, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET'],
    process.env['GOOGLE_AUTH_REDIRECT_URL']
  );

  const { query } = req;

  if (query.error) {
    console.error('Error:', query.error);
  } else if (query.state !== req.session.state) {
    console.error('State mismatch. Possible CSRF attack');
    res.end('State mismatch. Possible CSRF attack');
  } else {
    const { tokens } = await oauth2Client.getToken(query.code as string);
    oauth2Client.setCredentials(tokens);

    let authCalendar = false, authGmail = false, authProfile = false;

    // TODO: deal with the rest of the scopes
    if (tokens.scope?.includes('profile')) {
      authProfile = true;
    }

    if (tokens.scope?.includes('https://www.googleapis.com/auth/calendar.readonly')) {
      authCalendar = true;
    }

    if (tokens.scope?.includes('https://www.googleapis.com/auth/gmail.readonly')) {
      authGmail = true;
    }

    await prisma.googleToken.create({
      data: {
        accountId: req.user.id,
        access_token: tokens.access_token as string,
        id_token: tokens.id_token as string,
        expiry_date: new Date(tokens.expiry_date as number),
        authProfile,
        authCalendar,
        authGmail
      }
    });

    res.redirect('/');
  }

});

// todo: fix any
// todo: use path param to check which authentication to look for
// https://stackoverflow.com/questions/66312048/cant-override-express-request-user-type-but-i-can-add-new-properties-to-reques
router.get('/checkauth/:widget', async (req: any, res) => {
  let toCheck: 'authCalendar' | 'authGmail' | 'authProfile';

  switch (req.params.widget) {
    case "calendar":
      toCheck = 'authCalendar';
      break;
    case "gmail":
      toCheck = 'authGmail';
      break;
    case "profile":
      toCheck = 'authProfile';
      break;
    default:
      res.sendStatus(404);
      return;
  }

  if (req.user) {
    const validTokens = (await prisma.googleToken.findMany({where: {accountId: req.user.id, [toCheck]: true}}));

    let numValidTokens = 0;
    const now = new Date();

    // delete out of date tokens, count valid ones
    // there may be a better way to do this concurrently
    // TODO: refactor to use refresh tokens. Instead of deleting, refresh and replace the token
    validTokens.forEach(async token => {
      if (token.expiry_date < now) {
        await prisma.googleToken.delete({where: {id: token.id}});
      } else {
        numValidTokens++;
      }
    });

    if (numValidTokens > 0) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } else {
    res.sendStatus(401);
  }
});

export default router;