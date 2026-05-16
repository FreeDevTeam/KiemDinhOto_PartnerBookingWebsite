import { MOBILE_APP_CONTAINER } from '../constants/MobileAppContainer'
import { LOCAL_STORAGE_KEYS, LocalStorageManager } from '../helper/localStorage'

export const getBackToPartnerAppUrl = () => {
  const webviewContainerCode = LocalStorageManager.getItem(LOCAL_STORAGE_KEYS.WEBVIEW_CONTAINER_CODE)

  switch (webviewContainerCode) {
    case MOBILE_APP_CONTAINER.VNPAY_INAPP.ContainerCode:
      return MOBILE_APP_CONTAINER.VNPAY_INAPP.BackToAppUrl
    case MOBILE_APP_CONTAINER.MYF88_INAPP.ContainerCode:
      return MOBILE_APP_CONTAINER.MYF88_INAPP.BackToAppUrl
    default:
      return undefined;
  }
}

export const redirectByMiniAppBackUrl = () => {
  const resolvedBackUrl = getBackToPartnerAppUrl()

  if (!resolvedBackUrl) {
    return false
  }

  window.location.href = resolvedBackUrl
  return true
}
