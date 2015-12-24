var debug = require('debug')('SIR:auth');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var express = require('express');
var router = express.Router();

var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var nodeEnv = process.env.NODE;
var baseUrl = nodeEnv === 'production' ?
  process.env.BASE_URL : 'http://localhost:5000';

debug('client id', clientId)
debug('client secret', clientSecret)
debug(baseUrl + '/auth/github/callback')

passport.serializeUser(function (user, done) {
  debug('serialize', user)
  done(null, user.id);
});

passport.deserializeUser(function (user, done) {
  debug('deserialize', user)
  done(null, user);
});

passport.use(new GitHubStrategy({
  clientID: clientId,
  clientSecret: clientSecret,
  callbackURL: baseUrl + '/auth/github/callback'
}, function(accessToken, refreshToken, profile, done) {
  // debug('auth', profile)
  return done(null, profile);
}));

router.use('/github', passport.authenticate('github', { scope: 'user' }))

router.use('/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/signin'
}))

module.exports = router;
