import assign from 'lodash/assign'
import get from 'lodash/get'
import validate from '../../lib/validate'
import { getStrings } from '../../lib/helpers'
import User from '../../lib/db/models/user'
import express from 'express'
import bug from 'debug'

const debug = bug('SIR:thanks')
const router = express.Router()

router.get('/', validate, (req, res) => {
  const githubId = get(req, 'session.passport.user')

  User.findOne({ githubId }, (err, user) => {
    if (err || !user) {
      debug(`Could not find user ${githubId}`)
      return res.redirect('/')
    }

    const authenticated = req.isAuthenticated()

    res.render('thanks', assign({}, getStrings().main, user._doc, { authenticated }))
  })
})

export default router
