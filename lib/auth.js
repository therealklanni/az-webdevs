var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var express = require('express');
var router = express.Router();

var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
var nodeEnv = process.env.NODE;
var baseUrl = nodeEnv === 'production' ?
  process.env.BASE_URL : nodeEnv === 'staging' ?
    'http://1cfa4de0.ngrok.com' : 'http://localhost:3000';

console.log('client id', clientId)
console.log('client secret', clientSecret)
console.log(baseUrl + '/auth/github/callback')

passport.serializeUser(function (user, done) {
  console.log('serialize', user)
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  console.log('deserialize', user)
  done(null, user);
});

passport.use(new GitHubStrategy({
  clientID: clientId,
  clientSecret: clientSecret,
  callbackURL: baseUrl + '/auth/github/callback'
}, function(accessToken, refreshToken, profile, done) {
  // console.log('auth', profile)
  return done(null, profile);
}));

router.use('/github', passport.authenticate('github', { scope: ['user'] }))

router.use('/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/signin'
}))

module.exports = router;
