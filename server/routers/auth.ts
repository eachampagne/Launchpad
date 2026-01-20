import express from 'express';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oidc';
import { User } from '../../generated/prisma/client.js' // * 'User' Type.
import { prisma } from '../database/prisma.js';

const router = express.Router();

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'profile' ]
}, function verify (issuer : string, profile : {id: number, displayName: string}, cb : Function) {
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

router.get('/login', function (req, res, next) {
  // res.render('login'); need a login page to make it work
  // TODO: Get this route to go somewhere, or just remove it altogether and keep the button on the page.
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login' //TODO: Decide what to do here.
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

passport.serializeUser(function(user : User, cb) { //TODO: Fix this TS error.
  process.nextTick(function() {
    return cb(null, { id: user.id, name: user.name });
  });
});

passport.deserializeUser(function(user : User, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

export default router;