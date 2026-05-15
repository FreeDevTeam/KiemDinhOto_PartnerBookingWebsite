import { PATH } from './router'
import { ENV } from './EnvironmentVariables'

const VNPAY_INAPP_BACK_TO_APP_URL =
  ENV.REACT_APP_RUNTIME_MODE === 'production'
    ? 'https://miniapp-partner-vnpay.tamove.vn?back_app'
    : 'https://miniapp-partner-vnpay.service.makefamousapp.com?back_app'

export const MOBILE_APP_CONTAINER = {
  VNPAY_INAPP: {
    ContainerCode: 'VNPAY_INAPP',
    LoginPath: PATH.VNPAY_LOGIN,
    BackToAppUrl: VNPAY_INAPP_BACK_TO_APP_URL
  }
}
