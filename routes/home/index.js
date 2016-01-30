import { getStrings } from '../../lib/helpers'
import dotty from 'dotty'
import assign from 'lodash/assign'
import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.render('main', assign({}, getStrings().main, dotty.get(req, 'session.user')))
})

export default router
