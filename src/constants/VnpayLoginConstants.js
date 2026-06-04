export const VNPAY_STORAGE_KEYS = {
  RAW_PAYLOAD: 'vnpayLoginPayload',
  CONSENT_USER_PROFILE: 'consentUserProfile',
  CONSENT_SESSION_STATE: 'consentSessionState',
  CONSENT_MODE: 'homeMiniappConsentMode'
}

export const VNPAY_ENV = {
  DEFAULT_LOGO: process.env.REACT_APP_VNPAY_DEFAULT_LOGO || 'VNPAY',
  MIN_LOADING_MS: Number(process.env.REACT_APP_VNPAY_LOGIN_MIN_LOADING_MS || 3000),
  TIMEOUT_MS: Number(process.env.REACT_APP_VNPAY_LOGIN_TIMEOUT_MS || 3000),
  CONSENT_MODE: Number(process.env.REACT_APP_VNPAY_CONSENT_MODE || process.env.REACT_APP_HOME_MINIAPP_CONSENT_MODE || 2) || 2
}
