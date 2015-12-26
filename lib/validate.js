import bug from 'debug'
const debug = bug('SIR:validate')

export default (req, res, next) => {
  if (req.isAuthenticated()) {
    debug('User is authenticated', req.session.user)
    return next()
  }

  debug('Not authenticated')
  res.redirect('/signin')
}
