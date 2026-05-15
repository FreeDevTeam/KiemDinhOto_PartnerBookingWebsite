import { API_MYF88_LOGIN_BY_APP_DATA_PATH } from '../constants/APIUrls'
import Request from './request'

export default class Myf88Service {
  static async loginByMyf88AppData(data = {}) {
    console.log('[MYF88][loginByMyf88AppData] Start request', {
      path: API_MYF88_LOGIN_BY_APP_DATA_PATH,
      stationCode: data?.stationCode,
      hasApiKey: Boolean(data?.apikey),
      myF88AppDataKeys: Object.keys(data?.myF88AppData || {})
    })

    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: API_MYF88_LOGIN_BY_APP_DATA_PATH,
        data
      }).then((result = {}) => {
        console.log('[MYF88][loginByMyf88AppData] Raw response', result)
        const { statusCode, data: responseData, message, error } = result

        if (statusCode === 200) {
          return resolve({
            isSuccess: true,
            data: responseData || {}
          })
        }

        return resolve({
          isSuccess: false,
          data: responseData || {},
          message,
          error
        })
      }).catch((requestError) => {
        console.error('[MYF88][loginByMyf88AppData] Request failed', requestError)
        resolve({
          isSuccess: false,
          data: {},
          message: requestError?.message || 'MYF88 request failed',
          error: requestError
        })
      })
    })
  }
}
