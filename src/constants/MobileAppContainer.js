import { PATH } from './router'
import { ENV } from './EnvironmentVariables'

export const MOBILE_APP_CONTAINER = {
  VNPAY_INAPP: {
    ContainerCode: 'VNPAY_INAPP',
    LoginPath: PATH.VNPAY_LOGIN,
    BackToAppUrl: ENV.REACT_APP_RUNTIME_MODE === 'production'
      ? 'https://miniapp-partner-vnpay.tamove.vn?back_app'
      : 'https://miniapp-partner-vnpay.service.makefamousapp.com?back_app',
    LoginFailureMessage: 'Tải dữ liệu thất bại. Vui lòng liên hệ CSKH để được hỗ trợ'
  },
  MYF88_INAPP: {
    ContainerCode: 'MYF88_INAPP',
    LoginPath: PATH.MYF88_LOGIN,
    BackToAppUrl: ENV.REACT_APP_RUNTIME_MODE === 'production'
      ? 'https://miniapp-partner-f88.tamove.vn?back_app'
      : 'https://miniapp-partner-f88.service.makefamousapp.com?back_app',
    LoginFailureMessage: 'Tải dữ liệu thất bại. Vui lòng liên hệ CSKH để được hỗ trợ'
  }
}
