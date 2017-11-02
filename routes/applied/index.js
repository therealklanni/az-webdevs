import assign from 'lodash/assign'
import get from 'lodash/get'
import validate from '../../lib/validate'
import { getStrings, getDifferenceInDays } from '../../lib/helpers'
import User from '../../lib/db/models/user'
import express from 'express'
import bug from 'debug'

const debug = bug('SIR:applied')
const router = express.Router()

router.get('/', validate, (req, res) => {
  const githubId = get(req, 'session.passport.user')

  User.findOne({ githubId }, (err, user) => {
    if (err || !user) {
      debug(`Could not find user ${githubId}`)
      return res.redirect('/')
    }

    const { assumeApplied } = req.session

    if (!assumeApplied && !user.applied_at) {
      return res.redirect('/')
    }

    let lessThanTwoDays = false
    if (user.applied_at) {
      const daysSinceApplied = getDifferenceInDays(user.applied_at, new Date())
      debug(`It has been ${daysSinceApplied} days since user ${githubId} has applied.`)
      lessThanTwoDays = daysSinceApplied < 2
    }

    const authenticated = req.isAuthenticated()

    res.render('applied', assign({}, getStrings().main, user._doc, { authenticated, lessThanTwoDays, assumeApplied }))
  })
})

export default router
