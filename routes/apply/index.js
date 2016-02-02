import express from 'express'
import _ from 'lodash'
import dotty from 'dotty'
import bug from 'debug'
import multer from 'multer'
import changeCase from 'change-case'
import validate from '../../lib/validate'
import rateLimit from '../../lib/rate-limit'
import slackApi from '../../lib/slack'
import { exitWithError, getStrings } from '../../lib/helpers'
import User from '../../lib/db/models/user'

const debug = bug('SIR:apply')
const router = express.Router()

const channel = process.env.SLACK_CHANNEL
const botName = process.env.SLACK_BOT_NAME || process.env.HEROKU_APP_NAME || 'SIR'
const slackUrl = process.env.SLACK_WEBHOOK_URL
const slack = slackUrl ? slackApi(slackUrl) :
  exitWithError('Please set SLACK_WEBHOOK_URL environment variable.')

const getId = _.partialRight(dotty.get, 'session.passport.user')

router.get('/', validate, (req, res) => {
  const githubId = getId(req)
  const strings = getStrings()

  User.findOne({ githubId }, (err, user) => {
    if (err || !user) {
      debug(`Could not find user ${githubId}`)
      return res.redirect('/')
    }

    strings.apply.form.fullName.value = user.name
    strings.apply.form.email.value = user.email

    res.render('apply', _.assign({}, strings.apply, user))
  })
})

router.post('/', validate, rateLimit(), multer().array(), (req, res) => {
  const githubId = getId(req)

  User.findOne({ githubId }, (err, user) => {
    if (err || !user) {
      debug(`Could not find user ${githubId}`)
      return res.redirect('/')
    }

    debug('Received application from "%s <%s>"', user.name, user.email, user)

    res.redirect('/thanks')

    const fields = _.map(
      // omit comments because it's used for "text" above
      _.toPairs(_.assign(
        {},
        _.omit(req.body, 'comments'),
        // remove extraneous and falsey properties from user
        _.omit(
          _.omitBy(user._doc, x => _.isNil(x) || _.isEqual(false, x)),
          ['__v', '_id', 'githubId', 'avatar_url', 'html_url', 'created_at', 'updated_at']
        )
      )),
      // transform the field data
      _.flow(
        // necessary for unknown reasons
        x => x,
        // convert field names to title case
        _.partialRight(_.map, (str, i) => {
          return i ? str : changeCase.title(str)
        }),
        // convert array values (e.g. checkbox fields) into a string
        x => {
          if (_.isArray(x[1])) {
            x[1] = x[1].join(', ')
          }
          return x
        },
        // combine title and value into an object
        _.partial(_.zipObject, ['title', 'value']),
        // add "short" property to object
        _.partialRight(_.assign, { short: true })
      )
    )

    slack({
      channel: channel,
      username: botName,
      icon_url: req.originUri + 'images/bot.png',
      attachments: [{
        fallback: user.name + ' wants to join Slack',
        author_name: user.name,
        author_link: user.html_url,
        author_icon: user.avatar_url,
        color: '#28f428',
        pretext: 'New invite request:',
        text: req.body.comments ? `${req.body.comments}` : undefined,
        fields
      }]
    })
  })
})

export default router
