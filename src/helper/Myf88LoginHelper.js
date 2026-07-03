import { CheckApiKey } from './CheckApiKey'
import addKeyLocalStorage, { parseFromLocalStorage, LocalStorageManager } from './localStorage'
import { MYF88_ENV, MYF88_STORAGE_KEYS } from '../constants/Myf88LoginConstants'

/**
 * Lấy toàn bộ query params dưới dạng raw string, không smart-parse.
 * Cần thiết cho MYF88 vì backend xác thực HMAC trên chuỗi gốc —
 * ví dụ phoneNumber "0901234567" phải giữ nguyên số 0 đầu, không được convert thành number.
 */
const getAllUrlParamsAsRawStrings = (search = window.location.search) => {
  const params = new URLSearchParams(search)
  const result = {}
  for (const [key, value] of params.entries()) {
    result[key] = value.trim()
  }
  return result
}

const API_KEY_QUERY_KEYS = ['apikey', 'apiKey']
const STATION_CODE_QUERY_KEYS = ['clientId', 'stationCode']

const normalizeString = (value) => {
  if (typeof value === 'string') return value.trim()
  if (value === null || value === undefined) return ''
  return String(value).trim()
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
  const safeDataTheme = !dataTheme || typeof dataTheme !== 'object' || Array.isArray(dataTheme) ? {} : dataTheme

  return normalizeString(
    safeDataTheme.stationCode ||
      safeDataTheme.clientId
  )
}

export const resolveMyf88LogoPath = (logoValue) => {
  const normalizedLogo = normalizeString(logoValue || process.env.REACT_APP_MYF88_DEFAULT_LOGO || 'MYF88').toUpperCase()
  return normalizedLogo ? `/${normalizedLogo}.png` : '/logo.png'
}

export const getMyf88LoginRequestFromSearch = (search = window.location.search) => {
  const searchParams = new URLSearchParams(search)
  // Dùng raw strings để giữ nguyên giá trị gốc (vd: phoneNumber "0901234567" không mất số 0 đầu)
  const myf88AppData = getAllUrlParamsAsRawStrings(search)

  const stationCode =
    normalizeString(myf88AppData.clientId || myf88AppData.stationCode) ||
    getFirstValueFromSearchParams(searchParams, STATION_CODE_QUERY_KEYS) ||
    getStationCodeFromThemeStorage()

  const apikey =
    getFirstValueFromSearchParams(searchParams, API_KEY_QUERY_KEYS) ||
    normalizeString(CheckApiKey())

  // stationCode is optional for MYF88 — F88 identifies the session via HMAC checksum.
  // The backend validates authenticity without requiring a stationCode from the frontend.
  return {
    stationCode: stationCode || undefined,
    apikey,
    myf88AppData,
    logo: resolveMyf88LogoPath(myf88AppData.logo || searchParams.get('logo'))
  }
}

const getSafeObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value
}

export const normalizeMyf88Payload = (value = {}) => {
  const safeValue = getSafeObject(value)
  const mobile = normalizeString(safeValue.mobile || safeValue.phoneNumber || safeValue.phone)
  const fname = normalizeString(safeValue.fname || safeValue.fullName || safeValue.name)
  const email = normalizeString(safeValue.email)
  const username = normalizeString(safeValue.username || safeValue.uuid)
  const partnerSessionData = safeValue.partnerSessionData !== undefined ? safeValue.partnerSessionData : null

  return {
    mobile,
    fname,
    email,
    username,
    partnerSessionData
  }
}

export const buildMyf88ConsentUserProfile = (payload = {}) => {
  const normalizedPayload = normalizeMyf88Payload(payload)

  return {
    username: normalizedPayload.username,
    phoneNumber: normalizedPayload.mobile,
    fullName: normalizedPayload.fname,
    email: normalizedPayload.email,
    partnerSessionData: normalizedPayload.partnerSessionData
  }
}

export const hasMyf88StoredData = () => {
  return Boolean(
    LocalStorageManager.getItem(MYF88_STORAGE_KEYS.RAW_PAYLOAD) ||
      LocalStorageManager.getItem(MYF88_STORAGE_KEYS.CONSENT_USER_PROFILE)
  )
}

export const readStoredMyf88ConsentProfile = () => {
  const storedConsentProfile =
    LocalStorageManager.getItem(MYF88_STORAGE_KEYS.CONSENT_USER_PROFILE)

  if (storedConsentProfile?.phoneNumber) {
    return buildMyf88ConsentUserProfile(storedConsentProfile)
  }

  const storedPayload = LocalStorageManager.getItem(MYF88_STORAGE_KEYS.RAW_PAYLOAD)
  if (!storedPayload) {
    return {
      username: '',
      phoneNumber: '',
      fullName: '',
      email: '',
      partnerSessionData: null
    }
  }

  return buildMyf88ConsentUserProfile(storedPayload)
}

export const persistMyf88LoginState = (payload, consentUserProfileFromApi) => {
  const normalizedPayload = normalizeMyf88Payload(payload)
  const consentUserProfile = buildMyf88ConsentUserProfile({
    ...normalizedPayload,
    ...getSafeObject(consentUserProfileFromApi)
  })
  const consentSessionState = {
    consentMode: MYF88_ENV.CONSENT_MODE,
    hasAcceptedConsent: false,
    isLoading: false
  }

  LocalStorageManager.setItem(MYF88_STORAGE_KEYS.RAW_PAYLOAD, normalizedPayload)
  LocalStorageManager.setItem(MYF88_STORAGE_KEYS.CONSENT_USER_PROFILE, consentUserProfile)
  LocalStorageManager.setItem(MYF88_STORAGE_KEYS.CONSENT_SESSION_STATE, consentSessionState)
  LocalStorageManager.setItem(MYF88_STORAGE_KEYS.CONSENT_MODE, MYF88_ENV.CONSENT_MODE)

  return {
    payload: normalizedPayload,
    consentUserProfile,
    consentSessionState
  }
}
