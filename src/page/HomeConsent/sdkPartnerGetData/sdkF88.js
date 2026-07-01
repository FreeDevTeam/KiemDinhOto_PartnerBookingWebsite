import { hasMyf88StoredData, readStoredMyf88ConsentProfile } from '../../../helper/Myf88LoginHelper'

export const hasF88LoginData = () => {
  const hasData = hasMyf88StoredData()
  console.log('[CONSENT][sdkF88] hasF88LoginData', { hasData })
  return hasData
}

export const getDataSDKFromF88 = async () => {
  console.log('[CONSENT][sdkF88] getDataSDKFromF88 start')
  try {
    const consentUserProfile = readStoredMyf88ConsentProfile()
    console.log('[CONSENT][sdkF88] readStoredMyf88ConsentProfile result', consentUserProfile)

    if (!consentUserProfile?.phoneNumber) {
      console.warn('[CONSENT][sdkF88] Missing phoneNumber in stored profile')
      return {
        data: {},
        error: null
      }
    }

    const mappedData = {
      phoneNumber: consentUserProfile.phoneNumber,
      fullName: consentUserProfile.fullName,
      uuid: consentUserProfile.uuid,
      email: consentUserProfile.email,
      partnerSessionData: consentUserProfile.partnerSessionData
    }
    console.log('[CONSENT][sdkF88] Mapped consent data from storage', mappedData)

    return {
      data: mappedData,
      error: null
    }
  } catch (error) {
    console.error('Failed to get F88 consent data', error)
    return {
      data: {},
      error: error?.message || 'Failed to load F88 data'
    }
  }
}
