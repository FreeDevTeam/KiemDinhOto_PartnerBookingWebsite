export const HOST = process.env.REACT_APP_API_URL || 'https://cdn-dev.kiemdinhoto.vn'
export const ZALO_HOST = 'http://zalo.ttdkapi.ttdk.com.vn'
export const IMAGE_HOST = HOST + 'upload/'

const DEVELOP_URL = {
  REACT_APP_URL_WEB_BAOHIEM: 'https://ttdk-develop-baohiem.service.makefamousapp.com',
  REACT_APP_URL_WEB_PHATNGUOI: 'https://ttdk-develop-phatnguoi.service.makefamousapp.com',
  REACT_APP_URL_WEB_PAYMENT: 'https://ttdk-develop-payment.service.makefamousapp.com'
}

const PRODUCTION_URL = {
  REACT_APP_URL_WEB_BAOHIEM: 'https://baohiem.ttdk.com.vn',
  REACT_APP_URL_WEB_PHATNGUOI: 'https://phatnguoi.ttdk.com.vn'
}

const REACT_APP_RUNTIME_MODE = process.env.REACT_APP_RUNTIME_MODE
const DEFAULT_URLS = REACT_APP_RUNTIME_MODE === 'developer' ? DEVELOP_URL : PRODUCTION_URL

export const REACT_APP_URL_WEB_BAOHIEM = process.env.REACT_APP_URL_WEB_BAOHIEM || DEFAULT_URLS.REACT_APP_URL_WEB_BAOHIEM
export const REACT_APP_URL_WEB_PHATNGUOI = process.env.REACT_APP_URL_WEB_PHATNGUOI || DEFAULT_URLS.REACT_APP_URL_WEB_PHATNGUOI
export const REACT_APP_URL_WEB_PAYMENT = process.env.REACT_APP_URL_WEB_PAYMENT || DEFAULT_URLS.REACT_APP_URL_WEB_PAYMENT
