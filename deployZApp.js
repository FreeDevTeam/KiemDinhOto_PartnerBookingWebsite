const fs = require('fs')
const axios = require('axios').default
const moment = require('moment')

const loginToZaloFunction = require('./node_modules/zmp-cli/login')
const deployToZaloFunction = require('./node_modules/zmp-cli/deploy')
const zmpCliConstant = require('./node_modules/zmp-cli/utils/constants')
const spinner = require('./node_modules/zmp-cli/utils/spinner')
const log = require('./node_modules/zmp-cli/utils/log')

function configFile() {
  const temp = {
    app: {
      title: 'TTDK',
      headerColor: '#1843EF',
      textColor: 'white',
      statusBarColor: '#1843EF',
      leftButton: 'back'
    },
    debug: false,
    listCSS: [],
    listSyncJS: [],
    listAsyncJS: [],
    pages: ['index.html']
  }

  let listCSSFile = fs.readdirSync(__dirname + '/build/static/css')
  listCSSFile = listCSSFile.filter((file) => file.endsWith('.css'))
  listCSSFile = listCSSFile.map((file) => `static/css/${file}`)

  let listJSFile = fs.readdirSync(__dirname + '/build/static/js')
  listJSFile = listJSFile.filter((file) => file.endsWith('.js'))
  listJSFile = listJSFile.map((file) => `static/js/${file}`)

  temp.listSyncJS = listJSFile
  temp.listCSS = listCSSFile
  fs.writeFileSync('app-config.json', JSON.stringify(temp), { encoding: 'utf-8' })
}

const logger = {
  statusStart: (text) => spinner.start(text),
  statusDone: (text) => spinner.done(text),
  statusText: (text) => spinner.text(text),
  statusError: (text) => spinner.error(text),
  text: (text) => log.text(text),
  error: (text) => log.error(text),
  showOnUI: () => {}
}

async function deployToZalo() {
  let envConfig = {}
  fs.readFileSync(__dirname + '/.env', { encoding: 'utf-8' })
    .split('\n')
    .forEach((envVariable) => {
      let _item = envVariable.trim()
      if (_item && _item.length > 0 && _item.replace(/\r/g, '')) {
        _item = _item.replace(/\r/g, '')
        const keyValue = _item.split('=')
        if (keyValue.length === 2) {
          envConfig[keyValue[0]] = keyValue[1].replace(/\r/g, '')
        }
      }
    })

  if (envConfig['NODE_ENV'].includes('dev')) {
    return
  }

  configFile()

  let accessToken = envConfig['ZALO_USER_TOKEN'] || "";

  if (!accessToken) {
    console.error('Invalid ZALO User token')
    return
  }

  const loginConfigOption = {
    cwd: process.cwd(),
    loginMethod: 'accessToken',
    token: accessToken
  }
  await loginToZaloFunction(loginConfigOption, logger)

  const deployConfigOptions = {
    cwd: process.cwd(),
    dev: undefined,
    mode: undefined,
    quit: false,
    outputDir: 'build',
    versionStatus: zmpCliConstant.versionStatus.TESTING,
    desc: `TTDK v4.1.0.${moment().format('YYYYMMDDHHmm') - 1}`,
    customProject: true
  }
  await deployToZaloFunction(deployConfigOptions, logger)
  return
}

deployToZalo()
