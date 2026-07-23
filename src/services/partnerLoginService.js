import Request from './request'

const API_BIDV_LOGIN_PATH = '/ThirdParty/BIDVAppMobile/loginByBIDVAppData'
export default class PartnerLoginService {

  static async loginByBIDVAppData(data = {}) {
    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: API_BIDV_LOGIN_PATH,
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
