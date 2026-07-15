import Request from './request'

const API_PARTNER_LOGIN_PATH = '/AppUsers/loginByMyf88AppData'

export default class PartnerLoginService {
  static async loginByPartnerAppData(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: API_PARTNER_LOGIN_PATH,
        data
      })
        .then((result = {}) => {
          const { statusCode, data: responseData, message, error } = result
          if (statusCode === 200) {
            return resolve({ isSuccess: true, data: responseData || {} })
          }
          return resolve({ isSuccess: false, data: {}, message, error })
        })
        .catch((err) => {
          resolve({ isSuccess: false, data: {}, message: err?.message || 'Request failed' })
        })
    })
  }
}
