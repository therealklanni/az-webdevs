import dotty from 'dotty';

function validateLogin() {
  return (req, res, next) => {
    const user = dotty.get(req, 'session.user');

    if (!user) {
      req.session.error = 'Not Authenticated';
      res.redirect('/signin');
      // return void next('Not Authorized');
    } else {
      next();
    }
  };
}

export default validateLogin;
