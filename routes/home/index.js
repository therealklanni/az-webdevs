import { getStrings } from '../../lib/helpers'
import assign from 'lodash/assign'
import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  const authenticated = req.isAuthenticated()

  res.render('main', assign({}, getStrings().main, { authenticated }))
})

export default router
