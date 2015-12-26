import path from 'path'
import fs from 'fs'
import yaml from 'js-yaml'
import _ from 'lodash'
import bug from 'debug'

const debug = bug('SIR:helpers')
const gaToken = process.env.GA_TOKEN

function exitWithError(err) {
  debug(err)
  process.exit(1)
}

function getStrings() {
  const strings = yaml.safeLoad(fs.readFileSync(path.resolve('./strings.yml')))

  // extend strings
  strings.main = _.assign({}, {
    title: strings.title,
    gaToken: gaToken
  }, strings.main)

  strings.signin = _.assign({}, {
    title: strings.title,
    gaToken: gaToken,
    // clientId: clientId
  }, strings.signin)

  strings.apply = _.assign({}, {
    title: strings.title,
    gaToken: gaToken
  }, strings.apply)

  return strings
}

export { exitWithError, getStrings }
