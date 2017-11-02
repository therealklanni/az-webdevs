import assign from 'lodash/assign'
import get from 'lodash/get'
import validate from '../../lib/validate'
import { getStrings } from '../../lib/helpers'
import User from '../../lib/db/models/user'
import express from 'express'
import bug from 'debug'

const debug = bug('SIR:applied')
const router = express.Router()

const MS_ONE_DAY = 1000 * 60 * 60 * 24

function getDifferenceInDays (dateOne, dateTwo) {
  const differenceMs = dateTwo.getTime() - dateOne.getTime()
  return Math.abs(Math.round(differenceMs / MS_ONE_DAY))
}

router.get('/', validate, (req, res) => {
  const githubId = get(req, 'session.passport.user')

  User.findOne({ githubId }, (err, user) => {
    if (err || !user) {
      debug(`Could not find user ${githubId}`)
      return res.redirect('/')
    }

    if (!user.applied_at) {
      return res.redirect('/')
    }

    const daysSinceApplied = getDifferenceInDays(user.applied_at, new Date())
    debug(`It has been ${daysSinceApplied} days since user ${githubId} has applied.`)
    const lessThanTwoDays = daysSinceApplied < 2

    const authenticated = req.isAuthenticated()

    res.render('applied', assign({}, getStrings().main, user._doc, { authenticated, lessThanTwoDays }))
  })
})

export default router
