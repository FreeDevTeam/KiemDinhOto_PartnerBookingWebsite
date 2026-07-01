import { hasVnpayStoredData, readStoredVnpayConsentProfile } from '../../../helper/VnpayLoginHelper'

export const hasVnpayLoginData = () => {
  const hasData = hasVnpayStoredData()
  console.log('[CONSENT][sdkVnpay] hasVnpayLoginData', { hasData })
  return hasData
}

export const getDataSDKFromVnpay = async () => {
  console.log('[CONSENT][sdkVnpay] getDataSDKFromVnpay start')
  try {
    const consentUserProfile = readStoredVnpayConsentProfile()
    console.log('[CONSENT][sdkVnpay] readStoredVnpayConsentProfile result', consentUserProfile)

    if (!consentUserProfile?.phoneNumber) {
      console.warn('[CONSENT][sdkVnpay] Missing phoneNumber in stored profile')
      return {
        data: {},
        error: null
      }
    }

    const mappedData = {
      phoneNumber: consentUserProfile.phoneNumber,
      fullName: consentUserProfile.fullName,
      username: consentUserProfile.username
    }
    console.log('[CONSENT][sdkVnpay] Mapped consent data from storage', mappedData)

    return {
      data: mappedData,
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

