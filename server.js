import express from 'express';
const app = express();
import logger from 'morgan';
import bug from 'debug'
const debug = bug('SIR');
const error = bug('SIR:error');

import hbs from 'express-handlebars';
import passport from 'passport';
import session from 'express-session';
import mongooseConnection from './lib/db/mongo'
import connectMongo from 'connect-mongo'
const MongoStore = connectMongo(session)

import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

app.use(logger('dev'));

app.engine('.hbs', hbs({
  defaultLayout: 'main',
  extname: '.hbs',
  partialsDir: ['./views/partials/']
}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(
  session({
    name: 'sir.id',
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || '(\/)(;,,;)(\/) wooop woop woop',
    store: new MongoStore({ mongooseConnection })
  }),
  cookieParser(),
  bodyParser.urlencoded({ extended: true }),
  bodyParser.json(),
  passport.initialize(),
  passport.session(),
  (req, res, next) => {
    req.originUri = req.protocol + '://' + req.get('host');
    next();
  }
);

import apply from './routes/apply';
import home from './routes/home';
import signin from './routes/signin';
import thanks from './routes/thanks';
app.use('/apply', apply);
app.use('/', home);
app.use('/signin', signin);
app.use('/thanks', thanks);

import auth from './lib/auth';
app.use('/auth', auth);

app.use((err, req, res, next) => {
  error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.use(sassMiddleware({
    src: 'scss',
    dest: path.join(__dirname, 'public'),
    debug: true,
    outputStyle: 'compressed',
    prefix:  'styles/'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

app.use(express.static('public', {
  index: false
}));

const server = app.listen(process.env.PORT || 3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  debug('Slack Invite Request listening at http://%s:%s', host, port);
});
