import { hasVnpayStoredData, readStoredVnpayConsentProfile } from '../../../helper/vnpay'

export const hasVnpayLoginData = () => {
  return hasVnpayStoredData()
}

export const getDataSDKFromVnpay = async () => {
  try {
    const consentUserProfile = readStoredVnpayConsentProfile()
    if (!consentUserProfile?.phoneNumber) {
      return {
        data: {},
        error: null
      }
    }

    return {
      data: {
        phoneNumber: consentUserProfile.phoneNumber,
        fullName: consentUserProfile.fullName,
        uuid: consentUserProfile.uuid
      },
      error: null
    }
  } catch (error) {
    console.error('Failed to get VNPAY consent data', error)
    return {
      data: {},
      error: error?.message || 'Failed to load VNPAY data'
    }
  }
}

