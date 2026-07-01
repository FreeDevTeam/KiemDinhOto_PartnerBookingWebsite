import { parseFromLocalStorage } from '../../../helper/localStorage'
import { getDataSDKFromF88, hasF88LoginData } from './sdkF88'
import { getDataSDKFromVnpay, hasVnpayLoginData } from './sdkVnpay'

export const getDataUserFromSDK = async () => {
  console.log('[CONSENT][getDataUserFromSDK] Start resolve SDK data source')
  try {
    if (hasVnpayLoginData() || parseFromLocalStorage(process.env.REACT_APP_MINIAPP_VNPAY) === 1 || parseFromLocalStorage(process.env.REACT_APP_MINIAPP_VNPAY) === true) {
      console.log('[CONSENT][getDataUserFromSDK] Using VNPAY source')
      const { data, error } = await getDataSDKFromVnpay()
      console.log('[CONSENT][getDataUserFromSDK] VNPAY source result', { data, error })
      return {
        data,
        error
      }
    }
    if (hasF88LoginData() || parseFromLocalStorage(process.env.REACT_APP_MINIAPP_F88) === 1 || parseFromLocalStorage(process.env.REACT_APP_MINIAPP_F88) === true) {
      console.log('[CONSENT][getDataUserFromSDK] Using F88 source')
      const { data, error } = await getDataSDKFromF88()
      console.log('[CONSENT][getDataUserFromSDK] F88 source result', { data, error })
      return {
        data,
        error
      }
    }
    console.log('[CONSENT][getDataUserFromSDK] Using fallback mock source')
    return {
      data: {
        fullName: '',
        phoneNumber: '',
        uuid: ''
      },
      error: true
    }
  } catch (error) {
    console.error('[CONSENT][getDataUserFromSDK] Unexpected error', error)
    return {
      data: {},
      error: true
    }
  }
}
