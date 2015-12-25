import { getStrings } from '../../lib/helpers';
import dotty from 'dotty';
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  const user = dotty.get(req, 'session.user');

  if (user) {
    res.redirect('/apply');
  } else {
    res.render('signin', getStrings().signin);
  }
});

export default router;
