import bug from 'debug';
const debug = bug('SIR:auth');
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import express from 'express';
const router = express.Router();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const nodeEnv = process.env.NODE;
const baseUrl = nodeEnv === 'production' ?
  process.env.BASE_URL : 'http://localhost:5000';

debug('client id', clientId)
debug('client secret', clientSecret)
debug(baseUrl + '/auth/github/callback')

passport.serializeUser((user, done) => {
  debug('serialize', user)
  done(null, user);
});

passport.deserializeUser((user, done) => {
  debug('deserialize', user)
  done(null, user);
});

passport.use(new GitHubStrategy({
  clientID: clientId,
  clientSecret: clientSecret,
  callbackURL: baseUrl + '/auth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  // debug('auth', profile)
  return done(null, profile);
}));

router.get('/github', passport.authenticate('github', { scope: 'user' }))

router.get('/github/callback', passport.authenticate('github', {
  successRedirect: '/',
  failureRedirect: '/signin'
}))

export default router;
