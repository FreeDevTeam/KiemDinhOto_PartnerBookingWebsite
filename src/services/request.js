import axios from 'axios'
import { HOST } from './../constants/url'
import { IS_ZALO_MINI_APP } from '../constants/global'
import { getQueryString } from '../helper/common'
import addKeyLocalStorage from './../helper/localStorage'
import { CheckApiKey } from '../helper/CheckApiKey'
import { decryptAes256CBC } from './../pageUtililiy/EncryptionFunctions'
import { sendTelegramNotification } from './../hooks/botTelegram'

function cleanUp() {
  window.localStorage.clear()
  if (IS_ZALO_MINI_APP) {
  } else {
    window.location.href = '/login'
  }
}

function send({ method = 'get', path, data = null, query = null, headers = {}, newUrl, }) {
  return new Promise((resolve) => {
    let apiKey = CheckApiKey()
    let _query={
      ...query,
      apiKey : apiKey
    }
    let url = HOST + `${path}${getQueryString(_query)}`
    if (newUrl) {
      url = `${newUrl}${getQueryString(_query)}`
    }
    axios({
      method,
      url,
      data,
      headers
    })
      .then((result) => {
        let data = result.data
        let decryption = data
        if (data.idEn) {
          decryption = JSON.parse(decryptAes256CBC(data)) // mã hoá lấy về
          data=decryption
        }
        return resolve(data)
      })
      .catch((error) => {
        const { response = {} } = error
        const result = response.data ? response.data : null
        if (!result) {
        } else {
          const { statusCode, message: data } = result

          if (statusCode === 401) {
            setTimeout(() => {
              cleanUp()
            }, 1000)
          } else if ((statusCode === 401 && data === 'Unauthorized') || (statusCode === 403 && data === 'InvalidToken')) {
            cleanUp()
          } else if (statusCode === 505) {
            return resolve(result)
          } else if (statusCode === 500) {
            return resolve(result)
          } else {
            return resolve(result)
          }
        }
      })
  })
}

function sendZaloMiniApp({ method = 'get', path, data = null, query = null, headers = {}, newUrl, }) {
  return new Promise((resolve) => {
    let url = 'https://graph.zalo.me/v2.0/me/info'
    axios({
      url,
      headers
    })
      .then((result) => {
        const data = result.data
        return resolve(data)
      })
      .catch((error) => {
        const { response = {} } = error
        const result = response.data ? response.data : null
        if (!result) {
        } else {
          const { statusCode, message: data } = result

          if (statusCode === 401) {
            setTimeout(() => {
              cleanUp()
            }, 1000)
          } else if ((statusCode === 401 && data === 'Unauthorized') || (statusCode === 403 && data === 'InvalidToken')) {
            cleanUp()
          } else if (statusCode === 505) {
            return resolve(result)
          } else if (statusCode === 500) {
            return resolve(result)
          } else {
            return resolve(result)
          }
        }
      })
  })
}


export default {
  send,
  sendZaloMiniApp
}
