import bug from 'debug'
import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import express from 'express'
import assign from 'lodash/assign'
import User from './db/models/user'
import { exitWithError } from './helpers'

const debug = bug('SIR:auth')
const router = express.Router()
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const nodeEnv = process.env.NODE_ENV

var baseUrl

switch (nodeEnv) {
  case 'production':
    baseUrl = process.env.BASE_URL
    break
  case 'staging':
    baseUrl = process.env.HEROKU_APP_NAME
      ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
      : process.env.BASE_URL
    break

  default:
    baseUrl = process.env.BASE_URL || 'http://localhost:5000'
}

debug('client id', clientId)
debug('client secret', clientSecret)
debug(`Base URL ${baseUrl}/auth/github/callback`)

if (!clientId) {
  exitWithError('Please set CLIENT_ID environment variable.')
}

if (!clientSecret) {
  exitWithError('Please set CLIENT_SECRET environment variable.')
}

passport.serializeUser((user, done) => {
  debug('serialize', user)
  done(null, user.githubId)
})

passport.deserializeUser((githubId, done) => {
  debug('deserialize', githubId)

  User.findOne({ githubId }, (err, user) => {
    debug('deserialize:findOne', err, user)
    done(err, user)
  })
})

passport.use(new GitHubStrategy({
  clientID: clientId,
  clientSecret: clientSecret,
  callbackURL: baseUrl + '/auth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  debug('GitHub auth successful', profile)

  const id = profile.id
  const githubProfile = assign({ githubId: id }, profile._json)

  debug('githubProfile object', githubProfile)

  User.findOrCreate({ githubId: id }, githubProfile, (err, user, created) => {
    debug('findOrCreate user', err, user, created)

    if (err) {
      return done(err)
    }

    const githubId = githubProfile.githubId
    const date = {}

    // update user
    if (created) {
      date.createdAt = Date.now()
    } else {
      date.createdAt = user.createdAt || Date.now()
      date.updatedAt = Date.now()
    }

    User.update({ githubId }, assign(githubProfile, date), err => {
      debug('updated user')
      return done(err, user)
    })
  })
}))

router.get('/github', passport.authenticate('github', { scope: 'user:email' }))

router.get('/github/callback', passport.authenticate('github', {
  successRedirect: '/apply',
  failureRedirect: '/signin'
}))

router.get('/github/signout', (req, res) => {
  req.logout()
  res.redirect('/')
})

export default router
