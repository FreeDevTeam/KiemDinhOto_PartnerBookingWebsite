import { parseFromLocalStorage } from '../../../helper/localStorage'
import { getDataSDKFromVnpay } from './sdkVnpay'

export const getDataUserFromSDK = async () => {
  try {
    if (parseFromLocalStorage(process.env.REACT_APP_MINIAPP_VNPAY) === 1 || parseFromLocalStorage(process.env.REACT_APP_MINIAPP_VNPAY) === true) {
      const { data, error } = await getDataSDKFromVnpay()
      return {
        data,
        error
      }
    }
    if (parseFromLocalStorage(process.env.REACT_APP_MINIAPP_F88) === 1 || parseFromLocalStorage(process.env.REACT_APP_MINIAPP_F88) === true) {
      const { data, error } = await getDataSDKFromVnpay()
      return {
        data,
        error
      }
    }
    return{
      data: {
        fullName: 'Nam Nguyễn',
        phoneNumber: '07464648',
        uuid: '12345677'
      },
      error: false
    }
  } catch (error) {
    return {
      data: {},
      error: true
    }
  }
}
