import { MOBILE_APP_CONTAINER } from '../constants/MobileAppContainer'
import { LOCAL_STORAGE_KEYS, LocalStorageManager } from '../helper/localStorage'

export const getBackToPartnerAppUrl = () => {
  const webviewContainerCode = LocalStorageManager.getItem(LOCAL_STORAGE_KEYS.WEBVIEW_CONTAINER_CODE)

  switch (webviewContainerCode) {
    case MOBILE_APP_CONTAINER.VNPAY_INAPP.ContainerCode:
      return MOBILE_APP_CONTAINER.VNPAY_INAPP.BackToAppUrl
    case MOBILE_APP_CONTAINER.MYF88_INAPP.ContainerCode:
      // return MOBILE_APP_CONTAINER.MYF88_INAPP.BackToAppUrl
      return undefined;
    default:
      return undefined;
  }
}

export const redirectByMiniAppBackUrl = (history) => {
  const resolvedBackUrl = getBackToPartnerAppUrl()

  if (resolvedBackUrl) {
    window.location.href = resolvedBackUrl
    return true
  }

  if (!history) {
    return false
  }

  if (window.history.length > 1) {
    history.goBack()
    return true
  }

  history.replace('/')
  return true
}
