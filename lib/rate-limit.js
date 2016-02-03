import dotty from 'dotty'

function rateLimit () {
  return (req, res, next) => {
    const timestamp = dotty.get(req, 'session.timestamp')

    if (timestamp && Date.now() - timestamp < 3600000) {
      res.status(429)
        .send('Whoa, got a little excited there, did ya?')
      return
    }

    next()
  }
}

export default rateLimit
