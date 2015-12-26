import { getStrings } from '../../lib/helpers'
import dotty from 'dotty'
import _ from 'lodash'
import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.render('main', _.assign({}, getStrings().main, dotty.get(req, 'session.user')))
})

export default router
