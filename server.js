import express from 'express';
const app = express();
import logger from 'morgan';
import bug from 'debug'
const debug = bug('SIR');
const error = bug('SIR:error');

import hbs from 'express-handlebars';
import passport from 'passport';
import session from 'express-session';

import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import multer from 'multer';
import validate from './lib/validate';
import rateLimit from './lib/rate-limit';

import _ from 'lodash';
import dotty from 'dotty';
import fs from 'fs';
import mv from 'mv';
import path from 'path';
import yaml from 'js-yaml';
import async from 'async';
import changeCase from 'change-case';

const env = process.env;
const gaToken = env.GA_TOKEN;
const slackUrl = env.SLACK_WEBHOOK_URL;
const channel = env.SLACK_CHANNEL;
const botName = env.SLACK_BOT_NAME || 'SIR';
const nodeEnv = env.NODE;

function exitWithError(err) {
  error(err);
  process.exit(1);
}

if (!gaToken) {
  exitWithError('Please set GA_TOKEN environment variable.')
}

if (!slackUrl) {
  exitWithError('Please set SLACK_WEBHOOK_URL environment variable.')
}

if (!env.CLIENT_ID) {
  exitWithError('Please set CLIENT_ID environment variable.')
}

if (!env.CLIENT_SECRET) {
  exitWithError('Please set CLIENT_SECRET environment variable.')
}

import mod from './lib/slack';
const slack = mod(slackUrl);

function getStrings() {
  const strings = yaml.safeLoad(fs.readFileSync(path.resolve('./strings.yml')));

  // extend strings
  strings.main = _.assign({}, {
    title: strings.title,
    gaToken: gaToken
  }, strings.main);

  strings.signin = _.assign({}, {
    title: strings.title,
    gaToken: gaToken,
    // clientId: clientId
  }, strings.signin);

  strings.apply = _.assign({}, {
    title: strings.title,
    gaToken: gaToken
  }, strings.apply);

  return strings;
}

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
    resave: false,
    saveUninitialized: false,
    secret: env.SESSION_SECRET || '(\/)(;,,;)(\/) wooop woop woop'
  }),
  cookieParser(),
  bodyParser.urlencoded({ extended: true }),
  bodyParser.json(),
  multer(),
  passport.initialize(),
  passport.session(),
  (req, res, next) => {
    req.originUri = req.protocol + '://' + req.get('host');
    next();
  }
);

import auth from './lib/auth';
app.use('/auth', auth);

app.get('/', (req, res) => {
  res.render('main', _.assign({}, getStrings().main, dotty.get(req, 'session.user')));
});

app.get('/signin', (req, res) => {
  const user = dotty.get(req, 'session.user');

  if (user) {
    res.redirect('/apply');
  } else {
    res.render('signin', getStrings().signin);
  }
});

app.get('/thanks', validate(), (req, res) => {
  res.render('thanks', _.assign({}, getStrings().main, dotty.get(req, 'session.user')));
});

app.get('/apply', validate(), (req, res) => {
  const user = dotty.get(req, 'session.user');
  const strings = getStrings();

  strings.apply.form.fullName.value = user.displayName;
  strings.apply.form.email.value = user.emails[0].value;

  res.render('apply', _.assign({}, strings.apply, user));
});

app.post('/apply', validate(), rateLimit(), (req, res) => {
  const user = dotty.get(req, 'session.user');
  const files = req.files;
  const renameJobs = [];

  debug('Received application from "%s <%s>"', user.displayName, user.emails[0].value);

  for (const field in files) {
    const fileObj = files[field];
    const tmpPath = fileObj.path;
    const filename = field + '-' + fileObj.name;
    const dest = __dirname + '/public/images/' + filename;

    _.assign(fileObj, {
      dest: dest,
      uri: req.originUri + '/images/' + filename
    });

    renameJobs.push(async.apply(mv, tmpPath, dest));

    async.parallel(renameJobs, (err) => {
      if (err) {
        error(err);
        return res.sendStatus(500);
      }

      res.redirect('/thanks');

      slack({
      channel: channel,
      username: botName,
      icon_url: req.originUri + 'images/bot.png',
      attachments: [
        {
          fallback: user.displayName + ' wants to join Slack',
          author_name: user.displayName,
          author_link: user.url,
          author_icon: dotty.get(user, 'image.url'),
          color: '#28f428',
          pretext: 'New invite request:',
          text: req.body.comments ? '"' + req.body.comments + '"' : undefined,
          fields: _.map(
            _.pairs(_.omit(req.body, 'comments')),
            _.flow(
              x => x,
              _.partialRight(_.map, (str, i) => {
                return i ? str : changeCase.title(str);
              }),
              _.partial(_.zipObject, ['title', 'value']),
              _.partialRight(_.assign, { short: true })
            )
          )
            .concat(_.map(files, (file) => (
              {
                title: file.fieldname,
                value: '<' + file.uri + '|View>',
                short: true
              }
            )))
        }
      ]
    });
  });
}});

app.use((err, req, res, next) => {
  error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.use(express.static('public', {
  index: false
}));

const server = app.listen(process.env.PORT || 3000, () => {
  const host = server.address().address;
  const port = server.address().port;

  debug('Slack Invite Request listening at http://%s:%s', host, port);
});
