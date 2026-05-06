import { VNPAY_ENV, VNPAY_STORAGE_KEYS } from '../constants/VnpayLoginConstants'
import { LocalStorageManager, SessionStorageManager, parseFromLocalStorage } from './localStorage'
import addKeyLocalStorage from './localStorage'
import { getAllUrlParams, smartParseParam } from './UrlParamsHelper'

const VNPAY_REQUIRED_FIELDS = ['mobile', 'bankCode', 'bankName']
const API_KEY_QUERY_KEYS = ['apikey', 'apiKey']
const STATION_CODE_QUERY_KEYS = ['clientId', 'stationCode']

const getSafeObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value
}

const getFirstNonEmptyObject = (values = []) => {
  for (let index = 0; index < values.length; index += 1) {
    const safeValue = getSafeObject(values[index])
    if (Object.keys(safeValue).length > 0) {
      return safeValue
    }
  }

  return {}
}

const normalizeString = (value) => {
  if (typeof value === 'string') return value.trim()
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const normalizeRawData = (value) => {
  if (value === undefined) return undefined
  if (typeof value === 'string') {
    const parsedValue = smartParseParam(value)
    return parsedValue === null ? value : parsedValue
  }
  return value
}

export const normalizeVnpayPayload = (value = {}) => {
  const safeValue = !value || typeof value !== 'object' || Array.isArray(value) ? {} : value
  const mobile = normalizeString(safeValue.mobile || safeValue.phoneNumber || safeValue.phone)
  const bankCode = normalizeString(safeValue.bankCode || safeValue.bankcode)
  const bankName = normalizeString(safeValue.bankName || safeValue.bankname)
  const fullName = normalizeString(safeValue.fname || safeValue.fullName || safeValue.name)
  const token = normalizeString(safeValue.token)
  const language = normalizeString(safeValue.language)
  const appVersion = normalizeString(safeValue.appVersion)
  const sdkVersion = normalizeString(safeValue.sdkVersion)
  const logo = normalizeString(safeValue.logo || VNPAY_ENV.DEFAULT_LOGO)
  const rawData = normalizeRawData(safeValue.rawData)

  return {
    mobile,
    bankCode,
    bankName,
    token,
    fname: fullName,
    language,
    appVersion,
    sdkVersion,
    rawData,
    logo
  }
}

export const resolveVnpayLogoPath = (logoValue) => {
  const normalizedLogo = normalizeString(logoValue || VNPAY_ENV.DEFAULT_LOGO).toUpperCase()
  return normalizedLogo ? `/${normalizedLogo}.png` : '/logo.png'
}

const getFirstValueFromSearchParams = (searchParams, keys = []) => {
  for (let index = 0; index < keys.length; index += 1) {
    const rawValue = normalizeString(searchParams.get(keys[index]))
    if (rawValue) {
      return rawValue
    }
  }

  return ''
}

const getStationCodeFromThemeStorage = () => {
  const dataTheme = parseFromLocalStorage(localStorage.getItem(addKeyLocalStorage('dataTheme')))
  const safeDataTheme = getSafeObject(dataTheme)

  return normalizeString(
    safeDataTheme.stationCode ||
      safeDataTheme.clientId
  )
}

export const getVnpayLoginRequestFromSearch = (search = window.location.search) => {
  const searchParams = new URLSearchParams(search)
  const allUrlParams = getAllUrlParams(search)
  const vnpayAppData = getSafeObject(allUrlParams)

  // Prioritize clientId over stationCode
  const stationCode =
    normalizeString(vnpayAppData.clientId) ||
    getFirstValueFromSearchParams(searchParams, STATION_CODE_QUERY_KEYS) ||
    getStationCodeFromThemeStorage();

  const apikey =
    getFirstValueFromSearchParams(searchParams, API_KEY_QUERY_KEYS) ||
    normalizeString(localStorage.getItem('apiKey')) ||
    normalizeString(process.env.REACT_APP_APIKEY);

  if (!stationCode) {
    throw new Error('Missing stationCode');
  }

  if (!apikey) {
    throw new Error('Missing apikey');
  }

  return {
    stationCode,
    apikey,
    vnpayAppData,
    logo: resolveVnpayLogoPath(vnpayAppData.logo || searchParams.get('logo')),
  };
}

export const resolveVnpayPayloadFromApiResponse = (apiData = {}, fallbackVnpayAppData = {}) => {
  const safeApiData = getSafeObject(apiData)
  const payloadCandidate = getFirstNonEmptyObject([
    safeApiData.vnpayAppData,
    safeApiData.payload,
    safeApiData.loginData
  ])

  const normalizedFallbackPayload = normalizeVnpayPayload(fallbackVnpayAppData)
  const normalizedPayloadFromApi = normalizeVnpayPayload(Object.keys(payloadCandidate).length ? payloadCandidate : safeApiData)

  const mergedPayload = {
    ...normalizedFallbackPayload,
    ...normalizedPayloadFromApi
  }

  VNPAY_REQUIRED_FIELDS.forEach((fieldName) => {
    if (!normalizeString(mergedPayload[fieldName])) {
      throw new Error(`Missing VNPAY field: ${fieldName}`)
    }
  })

  return mergedPayload
}

export const resolveVnpayConsentUserProfileFromApiResponse = (apiData = {}, fallbackPayload = {}) => {
  const safeApiData = getSafeObject(apiData)
  const responseProfile = getFirstNonEmptyObject([
    safeApiData.consentUserProfile,
    safeApiData.userProfile,
    safeApiData.profile
  ])

  const normalizedProfileFromApi = buildVnpayConsentUserProfile(responseProfile)
  const normalizedFallbackProfile = buildVnpayConsentUserProfile(fallbackPayload)

  return {
    uuid: normalizeString(normalizedProfileFromApi.uuid || normalizedFallbackProfile.uuid),
    phoneNumber: normalizeString(normalizedProfileFromApi.phoneNumber || normalizedFallbackProfile.phoneNumber),
    fullName: normalizeString(normalizedProfileFromApi.fullName || normalizedFallbackProfile.fullName)
  }
}

export const buildVnpayConsentUserProfile = (payload = {}) => {
  const normalizedPayload = normalizeVnpayPayload(payload)

  return {
    uuid: normalizedPayload.token || normalizedPayload.mobile,
    phoneNumber: normalizedPayload.mobile,
    fullName: normalizedPayload.fname
  }
}

export const hasVnpayStoredData = () => {
  return Boolean(
    LocalStorageManager.getItem(VNPAY_STORAGE_KEYS.RAW_PAYLOAD) ||
      LocalStorageManager.getItem(VNPAY_STORAGE_KEYS.CONSENT_USER_PROFILE) ||
      SessionStorageManager.getItem(VNPAY_STORAGE_KEYS.CONSENT_USER_PROFILE)
  )
}

export const readStoredVnpayConsentProfile = () => {
  const storedConsentProfile =
    SessionStorageManager.getItem(VNPAY_STORAGE_KEYS.CONSENT_USER_PROFILE) ||
    LocalStorageManager.getItem(VNPAY_STORAGE_KEYS.CONSENT_USER_PROFILE)

  if (storedConsentProfile?.phoneNumber) {
    return buildVnpayConsentUserProfile(storedConsentProfile)
  }

  const storedPayload = LocalStorageManager.getItem(VNPAY_STORAGE_KEYS.RAW_PAYLOAD)
  if (!storedPayload) {
    return {
      uuid: '',
      phoneNumber: '',
      fullName: ''
    }
  }

  return buildVnpayConsentUserProfile(storedPayload)
}

export const persistVnpayLoginState = (payload, consentUserProfileFromApi) => {
  const normalizedPayload = normalizeVnpayPayload(payload)
  const consentUserProfile = buildVnpayConsentUserProfile({
    ...normalizedPayload,
    ...getSafeObject(consentUserProfileFromApi)
  })
  const consentSessionState = {
    consentMode: VNPAY_ENV.CONSENT_MODE,
    hasAcceptedConsent: false,
    isLoading: false
  }

  LocalStorageManager.setItem(VNPAY_STORAGE_KEYS.RAW_PAYLOAD, normalizedPayload)
  LocalStorageManager.setItem(VNPAY_STORAGE_KEYS.CONSENT_USER_PROFILE, consentUserProfile)
  SessionStorageManager.setItem(VNPAY_STORAGE_KEYS.CONSENT_USER_PROFILE, consentUserProfile)
  SessionStorageManager.setItem(VNPAY_STORAGE_KEYS.CONSENT_SESSION_STATE, consentSessionState)
  SessionStorageManager.setItem(VNPAY_STORAGE_KEYS.CONSENT_MODE, VNPAY_ENV.CONSENT_MODE)

  return {
    payload: normalizedPayload,
    consentUserProfile,
    consentSessionState
  }
}

export const isVnpayEnvEnabled = () => {
  return parseFromLocalStorage(process.env.REACT_APP_MINIAPP_VNPAY) === 1 || parseFromLocalStorage(process.env.REACT_APP_MINIAPP_VNPAY) === true
}
