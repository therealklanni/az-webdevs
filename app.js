import express from 'express'
const app = express()
import logger from 'morgan'
import bug from 'debug'
const debug = bug('SIR')
const error = bug('SIR:error')

import hbs from 'express-handlebars'
import sassMiddleware from 'node-sass-middleware'

import csurf from 'csurf'
import multer from 'multer'
import passport from 'passport'
import session from 'express-session'
import mongooseConnection from './lib/db/mongo'
import connectMongo from 'connect-mongo'
const MongoStore = connectMongo(session)

import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

app.use(logger('dev'))

app.engine('.hbs', hbs({
  defaultLayout: 'main',
  extname: '.hbs',
  partialsDir: ['./views/partials/'],
  helpers: {
    formatDate: function (date) {
      if (!date instanceof Date) {
        return ''
      }
      const day = date.getDate()
      const month = date.getMonth()
      const year = date.getFullYear()
      return `${month + 1}-${day}-${year}`
    }
  }
}))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(
  session({
    name: 'sir.id',
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || '(\/)(,,)(\/) wooop woop woop',
    store: new MongoStore({ mongooseConnection })
  }),
  cookieParser(),
  bodyParser.urlencoded({ extended: true }),
  bodyParser.json(),
  multer().array(),
  csurf(),
  passport.initialize(),
  passport.session(),
  (req, res, next) => {
    req.originUri = req.protocol + '://' + req.get('host')
    next()
  }
)

import apply from './routes/apply'
import home from './routes/home'
import signin from './routes/signin'
import thanks from './routes/thanks'
import applied from './routes/applied'
app.use('/apply', apply)
app.use('/', home)
app.use('/signin', signin)
app.use('/thanks', thanks)
app.use('/applied', applied)

import auth from './lib/auth'
app.use('/auth', auth)

import { getStrings } from './lib/helpers'

app.use((err, req, res, next) => {
  error(err.stack)

  if (process.env.NODE_ENV === 'production') {
    err.stack = ''
  }

  const errContent = {
    subtext: err.name === 'ValidationError'
      ? 'Try again after you have updated your GitHub profile.'
      : 'Please file a bug report with the error shown above.',
    message: err.name === 'ValidationError'
      ? `
Please make sure you set your <b>Name</b> and make your <b>Email</b> public in your <a target="_blank" href="https://github.com/settings/profile">GitHub profile</a>.
<p><img class="profile-sample" src="/images/profile.png" alt="GitHub Profile sample">
<p>This helps us know who you are and where to send your invite.</p>`
// <a class="btn" href="/auth/github/signout">Sign out to start over</a>`
      : `Looks like VelociRyan is on the loose again!
<p><img class="oops-image" src="/images/oops.png" alt="Oops">
<blockquote><pre>${err.stack}</pre></blockquote>`
  }

  errContent.title = getStrings().title
  errContent.authenticated = req.isAuthenticated()

  res.status(500).render('error', errContent)
})

app.use(sassMiddleware({
  src: __dirname + '/scss',
  dest: __dirname + '/public/styles',
  debug: true,
  outputStyle: 'compressed',
  prefix: '/styles'
}))

app.use(express.static('public', {
  index: false
}))

const server = app.listen(process.env.PORT || 3000, () => {
  const host = server.address().address
  const port = server.address().port

  debug('Slack Invite Request listening at http://%s:%s', host === '::' ? 'localhost' : host, port)
})
