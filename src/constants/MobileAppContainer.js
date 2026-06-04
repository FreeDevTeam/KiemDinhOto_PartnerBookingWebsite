import { PATH } from './router'
import { ENV } from './EnvironmentVariables'

export const MOBILE_APP_CONTAINER = {
  VNPAY_INAPP: {
    ContainerCode: 'VNPAY_INAPP',
    LoginPath: PATH.VNPAY_LOGIN,
    BackToAppUrl: 'https://miniapp-partner-vnpay.tamove.vn?back_app',
    LoginFailureMessage: 'Tải dữ liệu thất bại. Vui lòng liên hệ CSKH để được hỗ trợ'
  },
  MYF88_INAPP: {
    ContainerCode: 'MYF88_INAPP',
    LoginPath: PATH.MYF88_LOGIN,
    BackToAppUrl: 'https://miniapp-partner-vnpay.tamove.vn?back_app',
    LoginFailureMessage: 'Tải dữ liệu thất bại. Vui lòng liên hệ CSKH để được hỗ trợ'
  }
}
