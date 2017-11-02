import path from 'path'
import fs from 'fs'
import yaml from 'js-yaml'
import assign from 'lodash/assign'
import bug from 'debug'

const debug = bug('SIR:helpers')
const gaToken = process.env.GA_TOKEN

if (!gaToken) {
  exitWithError('Please set GA_TOKEN environment variable.')
}

const MS_ONE_DAY = 1000 * 60 * 60 * 24

function exitWithError (err) {
  debug(err)
  process.exit(1)
}

function getStrings () {
  const strings = yaml.safeLoad(fs.readFileSync(path.resolve('./strings.yml')))
  const extStrings = {
    title: strings.title,
    gaToken: gaToken
  }

  // extend strings
  strings.main = assign({}, strings.main, extStrings)
  strings.signin = assign({}, strings.signin, extStrings)
  strings.apply = assign({}, strings.apply, extStrings)

  return strings
}

function getDifferenceInDays (dateOne, dateTwo) {
  const differenceMs = dateTwo.getTime() - dateOne.getTime()
  return Math.abs(Math.round(differenceMs / MS_ONE_DAY))
}

export { exitWithError, getStrings, getDifferenceInDays }
