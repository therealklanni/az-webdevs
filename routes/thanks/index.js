import _ from 'lodash'
import dotty from 'dotty'
import validate from '../../lib/validate'
import { getStrings } from '../../lib/helpers'
import express from 'express'
const router = express.Router()

router.get('/', validate, (req, res) => {
  res.render('thanks', _.assign({}, getStrings().main, dotty.get(req, 'session.passport.user')))
})

export default router
