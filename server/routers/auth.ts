import crypto from 'node:crypto';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { google } from 'googleapis';
import GoogleStrategy from 'passport-google-oidc';
import LocalStrategy from 'passport-local';
import { User } from '../../generated/prisma/client.js' // * 'User' Type.
import { prisma } from '../database/prisma.js';

const router = express.Router();
const demoId = Number(process.env['DEMO_ACCOUNT_ID']) || -2; // won't conflict with normal users because Prisma starts at 1, or with client using -1 for logged out, but is truthy so won't mess up existing logic

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: process.env['GOOGLE_LOGIN_REDIRECT_URL'],
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

passport.use(new LocalStrategy.Strategy(function verify(username: string, password: string, cb: Function) {
  // if this were really a username/password login, the password would be checked against the hash, etc
  // but there actually isn't a username or password for the demo account so none of that happens
  prisma.user.findFirst({
    where: {
      id: demoId // the special demo id
    }
  })
    .then((user) => {
      if (!user) {
        return prisma.user.create({
          data: {
            id: demoId,
            name: 'Demo account',
            credentialProvider: '',
            credentialSubject: ''
          }
        }).then((newUser) => {
          return cb(null, newUser);
        })
      } else {
        return cb(null, user);
      }
    })
    .catch((err) => {
      console.error('Failed to find demo account:', err);
      cb(err);
    });
}));

router.post('/login/demo', passport.authenticate('local', {
  successRedirect: '/hub',
  failureRedirect: '/'
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

passport.serializeUser(function(user : Express.User, cb) { // ? Open Request: Replace 'any' with whatever it should be. (User doesn't work, but is what the function should take in.)
  process.nextTick(function() {
    return cb(null, { id: user.id, name: user.name });
  });
});

passport.deserializeUser(function(user : Express.User, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// TODO - make this into a dictionary somehow to make it easier to add scopes
const scopes = {
  calendar: 'https://www.googleapis.com/auth/calendar.readonly',
  gmail: 'https://www.googleapis.com/auth/gmail.readonly'
};

router.get('/auth/:widget', (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

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
    access_type: 'offline', // do I need offline?
    scope: scopes[toAuthenticate],
    include_granted_scopes: true,
    state: state
  });

  res.redirect(authorizationUrl);
});

// TODO: delete superseded tokens?
router.get('/auth/redirect/google', async (req, res) => {
  // check auth
  if (req.user === undefined) {
    res.sendStatus(401);
    return;
  }

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
    let refresh_token = null, refresh_expiry_date = null;

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

    if (tokens.refresh_token) {
      refresh_token = tokens.refresh_token;

      refresh_expiry_date = new Date((tokens as any).refresh_token_expires_in * 1000 + Date.now());

      // if (Object.hasOwn(tokens, 'refresh_token_expires_in')) {
      //   refresh_expiry_date = tokens.refresh_token_expires_in;

      // }
    }

    // this assumes that a given user should only have ONE valid token at a time
    // given that new tokens include previously granted scopes, there should be no reason to retain old tokens
    // but this is an assumption baked in now
    await prisma.googleToken.deleteMany({
      where: {
        accountId: req.user.id
      }
    })

    await prisma.googleToken.create({
      data: {
        accountId: req.user.id,
        access_token: tokens.access_token as string,
        id_token: tokens.id_token as string,
        expiry_date: new Date(tokens.expiry_date as number),
        refresh_token,
        refresh_expiry_date,
        authProfile,
        authCalendar,
        authGmail
      }
    });

    res.redirect('/hub');
  }

});

export default router;