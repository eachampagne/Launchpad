import express from 'express';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oidc';
import { prisma } from '../database/prisma.js';

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'profile' ]
}, function verify (issuer, profile, cb) {
  prisma.user.findOne({
    where: {
      provider: issuer,
      subject: profile.id
    }
  }).then((user) => {
    if (!user) {
      return prisma.user.create({
        data: {
          name: profile.displayName
        }
      }).then(() => {
        // the same as below, just needs to run in order.
      })
    }

    const id = this.lastID;
    return prisma.federated_credentials.create({
      data: {
        user_id: id,
        provider: issuer,
        subject: profile.id
      }
    }).then(() => {
      const user = {
        id: id,
        name: profile.displayName
      }
      return cb(null, user);
    })

  }).catch((err) => {
    cb(err);
  })
}));

const router = express.Router();

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

export default router;