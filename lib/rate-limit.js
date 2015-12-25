import dotty from 'dotty';

function rateLimit() {
  return (req, res, next) => {
    const timestamp = dotty.get(req, 'session.timestamp');

    if (timestamp && Date.now() - timestamp < 3600000) {
      res.status(429)
        .send('Whoa, ' + name + ', got a little over-excited there, did ya?');
      return;
    }

    next();
  };
}

export default rateLimit;
