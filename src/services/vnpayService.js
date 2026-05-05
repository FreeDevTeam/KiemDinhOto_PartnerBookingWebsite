import { API_VNPAY_LOGIN_BY_APP_DATA_PATH } from '../constants/APIUrls'
import Request from './request'

export default class VnpayService {
  static async loginByVnpayAppData(data = {}) {
    console.log('[VNPAY][loginByVnpayAppData] Start request', {
      path: API_VNPAY_LOGIN_BY_APP_DATA_PATH,
      stationCode: data?.stationCode,
      hasApiKey: Boolean(data?.apikey),
      vnpayAppDataKeys: Object.keys(data?.vnpayAppData || {}),
      hasEncryptedData: Boolean(data?.vnpayAppData?.data)
    })

    return new Promise((resolve) => {
      Request.send({
        method: 'POST',
        path: API_VNPAY_LOGIN_BY_APP_DATA_PATH,
        data
      }).then((result = {}) => {
        console.log('[VNPAY][loginByVnpayAppData] Raw response', result)
        const { statusCode, data: responseData, message, error } = result

        if (statusCode === 200) {
          console.log('[VNPAY][loginByVnpayAppData] Success response', {
            statusCode,
            responseKeys: Object.keys(responseData || {}),
            hasPhoneNumber: Boolean(responseData?.phoneNumber),
            hasFullName: Boolean(responseData?.fullName),
            hasEmail: Boolean(responseData?.email)
          })
          return resolve({
            isSuccess: true,
            data: responseData || {}
          })
        }

        console.warn('[VNPAY][loginByVnpayAppData] Non-200 response', {
          statusCode,
          message,
          error,
          responseKeys: Object.keys(responseData || {})
        })
        return resolve({
          isSuccess: false,
          data: responseData || {},
          message,
          error
        })
      }).catch((requestError) => {
        console.error('[VNPAY][loginByVnpayAppData] Request failed', requestError)
        resolve({
          isSuccess: false,
          data: {},
          message: requestError?.message || 'VNPAY request failed',
          error: requestError
        })
      })
    })
  }
}
