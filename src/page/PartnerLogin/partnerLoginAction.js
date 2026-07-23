import { LocalStorageManager } from '../../helper/localStorage'
import { handleBidvLogin } from './handlers/bidvHandler'
import { getPartnerConfig } from '../../constants/partnerConfig'

const STORAGE_KEY_CONSENT_USER_PROFILE = 'consentUserProfile'
const STORAGE_KEY_CONSENT_SESSION_STATE = 'consentSessionState'
const STORAGE_KEY_PARTNER_NAME = 'partnerName'

const persistPartnerLoginResult = (partnerName, userProfile, consentMode) => {
  LocalStorageManager.setItem(STORAGE_KEY_CONSENT_USER_PROFILE, {
    username: userProfile.username || '',
    phoneNumber: userProfile.phoneNumber || '',
    fullName: userProfile.fullName || '',
    token: userProfile.token || ''
  })

  LocalStorageManager.setItem(STORAGE_KEY_CONSENT_SESSION_STATE, {
    consentMode: consentMode,
    hasAcceptedConsent: false,
    isLoading: false
  })

  LocalStorageManager.setItem(STORAGE_KEY_PARTNER_NAME, partnerName)
}

export const runPartnerLoginFlow = async (partnerName, search) => {
  const config = getPartnerConfig(partnerName)
  if (!config) {
    return { status: 'error', message: 'Đối tác không được hỗ trợ' }
  }

  let result
  switch (partnerName) {
    case 'bidv':
      result = await handleBidvLogin(search)
      break
    default:
      return { status: 'error', message: 'Đối tác không được hỗ trợ' }
  }

  if (!result.isSuccess) {
    return { status: 'error', message: result.message || 'Lấy thông tin thất bại' }
  }

  const consentMode = config.requireConsent ? config.consentMode : undefined
  persistPartnerLoginResult(partnerName, result.userProfile, consentMode)

  return { status: 'success' }
}
