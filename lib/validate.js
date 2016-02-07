import bug from 'debug'
const debug = bug('SIR:validate')

import get from 'lodash/get'

export default (req, res, next) => {
  if (req.isAuthenticated()) {
    debug('User is authenticated', get(req, 'session.passport.user'))
    return next()
  }

  debug('Not authenticated')
  res.redirect('/signin')
}
