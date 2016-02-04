import { getStrings } from '../../lib/helpers'
import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/apply')
  } else {
    const strings = getStrings().signin
    strings.hideSignIn = true

    res.render('signin', strings)
  }
})

export default router
