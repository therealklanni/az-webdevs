import express from 'express'
import _ from 'lodash'
import dotty from 'dotty'
import bug from 'debug'
import changeCase from 'change-case'
import validate from '../../lib/validate'
import rateLimit from '../../lib/rate-limit'
import slackApi from '../../lib/slack'
import { exitWithError, getStrings } from '../../lib/helpers'
import User from '../../lib/db/models/user'

const debug = bug('SIR:apply')
const router = express.Router()

const channel = process.env.SLACK_CHANNEL;
const botName = process.env.SLACK_BOT_NAME || 'SIR';
const slackUrl = process.env.SLACK_WEBHOOK_URL
const slack = slackUrl ? slackApi(slackUrl) : exitWithError('Please set SLACK_WEBHOOK_URL environment variable.')

const getId = _.partialRight(dotty.get, 'session.passport.user')

router.get('/', validate, (req, res) => {
  const githubId = getId(req)
  const strings = getStrings()

  User.findOne({ githubId }, (err, user) => {
    if (err || !user) {
      debug(`Could not find user ${githubId}`)
      return res.redirect('/')
    }

    strings.apply.form.fullName.value = user.displayName
    strings.apply.form.email.value = user.email

    res.render('apply', _.assign({}, strings.apply, user))
  })
})

router.post('/', validate, rateLimit(), (req, res) => {
  const githubId = getId(req)

  User.findOne({ githubId }, (err, user) => {
    if (err || !user) {
      debug(`Could not find user ${githubId}`)
      return res.redirect('/')
    }

    debug('Received application from "%s <%s>"', user.displayName, user.email)

    res.redirect('/thanks')

    slack({
      channel: channel,
      username: botName,
      icon_url: req.originUri + 'images/bot.png',
      attachments: [{
        fallback: user.displayName + ' wants to join Slack',
        author_name: user.displayName,
        author_link: user.url,
        author_icon: dotty.get(user, 'image.url'),
        color: '#28f428',
        pretext: 'New invite request:',
        text: req.body.comments ? `${req.body.comments}` : undefined,
        fields: _.map(
          // omit comments because it's used for "text" above
          _.pairs(_.omit(req.body, 'comments')),
          // transform the field data
          _.flow(
            // necessary for unknown reasons
            x => x,
            // convert field names to title case
            _.partialRight(_.map, (str, i) => {
              return i ? str : changeCase.title(str)
            }),
            // convert array values (e.g. checbox fields) into a string
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
      }]
    })
  })
})

export default router
