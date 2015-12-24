'use strict';

var express = require('express');
var app = express();
var logger = require('morgan');
var debug = require('debug')('SIR');
var error = require('debug')('SIR:error');

var hbs = require('express-handlebars');
var passport = require('passport');
var session = require('express-session');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var validate = require('./lib/validate');
var rateLimit = require('./lib/rate-limit');

var _ = require('lodash');
var dotty = require('dotty');
var fs = require('fs');
var mv = require('mv');
var path = require('path');
var yaml = require('js-yaml');
var async = require('async');
var changeCase = require('change-case');

var env = process.env;
var gaToken = env.GA_TOKEN;
var slackUrl = env.SLACK_WEBHOOK_URL;
var channel = env.SLACK_CHANNEL;
var botName = env.SLACK_BOT_NAME || 'SIR';
var nodeEnv = env.NODE;

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

var slack = require('./lib/slack')(slackUrl);

function getStrings() {
  var strings = yaml.safeLoad(fs.readFileSync(path.resolve('./strings.yml')));

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
  function (req, res, next) {
    req.originUri = req.protocol + '://' + req.get('host');
    next();
  }
);

var auth = require('./lib/auth');
app.use('/auth', auth);

app.get('/', function (req, res) {
  res.render('main', _.assign({}, getStrings().main, dotty.get(req, 'session.user')));
});

app.get('/signin', function (req, res) {
  var user = dotty.get(req, 'session.user');

  if (user) {
    res.redirect('/apply');
  } else {
    res.render('signin', getStrings().signin);
  }
});


app.get('/thanks', validate(), function (req, res) {
  res.render('thanks', _.assign({}, getStrings().main, dotty.get(req, 'session.user')));
});

app.get('/apply', validate(), function (req, res) {
  var user = dotty.get(req, 'session.user');
  var strings = getStrings();

  strings.apply.form.fullName.value = user.displayName;
  strings.apply.form.email.value = user.emails[0].value;

  res.render('apply', _.assign({}, strings.apply, user));
});

app.post('/apply', validate(), rateLimit(), function (req, res) {
  var user = dotty.get(req, 'session.user');
  var files = req.files;
  var renameJobs = [];

  debug('Received application from "%s <%s>"', user.displayName, user.emails[0].value);

  for (var field in files) {
    var fileObj = files[field];
    var tmpPath = fileObj.path;
    var filename = field + '-' + fileObj.name;
    var dest = __dirname + '/public/images/' + filename;

    _.assign(fileObj, {
      dest: dest,
      uri: req.originUri + '/images/' + filename
    });

    renameJobs.push(async.apply(mv, tmpPath, dest));
  }

  async.parallel(renameJobs, function (err) {
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
              function (x) { return x; },
              _.partialRight(_.map, function (str, i) {
                return i ? str : changeCase.title(str);
              }),
              _.partial(_.zipObject, ['title', 'value']),
              _.partialRight(_.assign, { short: true })
            )
          )
            .concat(_.map(files, function (file) {
              return {
                title: file.fieldname,
                value: '<' + file.uri + '|View>',
                short: true
              }
            }))
        }
      ]
    });
  });
});

app.use(function(err, req, res, next) {
  error(err.stack);
  res.status(500).send('Internal Server Error');
});

app.use(express.static('public', {
  index: false
}));

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  debug('Slack Invite Request listening at http://%s:%s', host, port);
});
