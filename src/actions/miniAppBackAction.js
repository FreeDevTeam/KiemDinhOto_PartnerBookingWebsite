import { MOBILE_APP_CONTAINER } from '../constants/MobileAppContainer'
import { ENV } from '../constants/EnvironmentVariables'
import { parseFromLocalStorage } from '../helper/localStorage'

const parseBooleanStorageValue = (value) => {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'TRUE'
}

const isVnpayMiniAppEnabled = () => {
  return parseBooleanStorageValue(parseFromLocalStorage(ENV.REACT_APP_MINIAPP_VNPAY))
}

export const getBackToPartnerAppUrl = () => {
  if (isVnpayMiniAppEnabled()) {
    return MOBILE_APP_CONTAINER.VNPAY_INAPP.BackToAppUrl
  }

  return ''
}

export const redirectByMiniAppBackUrl = () => {
  const resolvedBackUrl = getBackToPartnerAppUrl()

  if (!resolvedBackUrl) {
    return false
  }

  window.location.href = resolvedBackUrl
  return true
}
