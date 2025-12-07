export const HOST = process.env.REACT_APP_API_URL || 'https://cdn-dev.kiemdinhoto.vn'
export const ZALO_HOST = 'http://zalo.ttdkapi.ttdk.com.vn'
export const IMAGE_HOST = HOST + 'upload/'

const REACT_APP_RUNTIME_MODE = process.env.REACT_APP_RUNTIME_MODE
const REACT_APP_THEME_NAME = process.env.REACT_APP_THEME_NAME

const DEVELOP_URL = {
  REACT_APP_INSURANCE_WEB_URL: 'https://ttdk-develop-baohiem.service.makefamousapp.com',
  REACT_APP_PHATNGUOI_WEB_URL: 'https://ttdk-develop-phatnguoi.service.makefamousapp.com',
}
const THEME_URL = {
  TTDK: {
    REACT_APP_INSURANCE_WEB_URL: 'https://baohiem.ttdk.com.vn',
    REACT_APP_PHATNGUOI_WEB_URL: 'https://phatnguoi.ttdk.com.vn',
  },
  TAMOVE: {
    REACT_APP_INSURANCE_WEB_URL: 'https://baohiem.tamove.tajsc.vn',
    REACT_APP_PHATNGUOI_WEB_URL: 'https://phatnguoi.tamove.tajsc.vn',
  },
  IHANOI: {
    REACT_APP_INSURANCE_WEB_URL: 'https://ihanoi-develop-baohiem.service.makefamousapp.com',
    REACT_APP_PHATNGUOI_WEB_URL: 'https://ihanoi-develop-phatnguoi.service.makefamousapp.com',
  }
}

const TRUE_URL = REACT_APP_RUNTIME_MODE === 'developer' ? DEVELOP_URL : THEME_URL[REACT_APP_THEME_NAME] || THEME_URL.TTDK
export const {
  REACT_APP_INSURANCE_WEB_URL,
  REACT_APP_PHATNGUOI_WEB_URL
} = TRUE_URL