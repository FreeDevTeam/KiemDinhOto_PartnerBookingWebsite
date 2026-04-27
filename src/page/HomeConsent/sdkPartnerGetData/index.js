import { parseFromLocalStorage } from '../../../helper/localStorage'
import { getDataSDKFromF88 } from './sdkF88'
import { getDataSDKFromVnpay } from './sdkVnpay'

export const getDataUserFromSDK = async () => {
  try {
    const hasVnpayData = Boolean(localStorage.getItem('vnpayWebviewData') || localStorage.getItem('vnpayPhoneNumber'))

    if (hasVnpayData) {
      const { data, error } = await getDataSDKFromVnpay()
      return {
        data,
        error
      }
    }

    if (parseFromLocalStorage(process.env.REACT_APP_MINIAPP_VNPAY) === 1 || parseFromLocalStorage(process.env.REACT_APP_MINIAPP_VNPAY) === true) {
      const { data, error } = await getDataSDKFromVnpay()
      return {
        data,
        error
      }
    }
    if (parseFromLocalStorage(process.env.REACT_APP_MINIAPP_F88) === 1 || parseFromLocalStorage(process.env.REACT_APP_MINIAPP_F88) === true) {
      const { data, error } = await getDataSDKFromF88()
      return {
        data,
        error
      }
    }
    return {
      data: {},
      error: true
    }
  } catch (error) {
    return {
      data: {},
      error: true
    }
  }
}
