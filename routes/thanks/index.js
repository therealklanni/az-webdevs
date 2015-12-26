import validate from '../../lib/validate'
import express from 'express'
const router = express.Router()

router.get('/', validate, (req, res) => {
  res.render('thanks', _.assign({}, getStrings().main, dotty.get(req, 'session.user')))
})

export default router
