import _ from 'lodash'
import dotty from 'dotty'
import validate from '../../lib/validate'
import { getStrings } from '../../lib/helpers'
import User from '../../lib/db/models/user'
import express from 'express'
import bug from 'debug'

const debug = bug('SIR:thanks')
const router = express.Router()

router.get('/', validate, (req, res) => {
  const githubId = dotty.get(req, 'session.passport.user')

  User.findOne({ githubId }, (err, user) => {
    if (err || !user) {
      debug(`Could not find user ${githubId}`)
      return res.redirect('/')
    }

    res.render('thanks', _.assign({}, getStrings().main, user._doc))
  })

})

export default router
