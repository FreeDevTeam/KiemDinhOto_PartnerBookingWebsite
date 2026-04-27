import CryptoJS from 'crypto-js'
import { VNPAY_ENV, VNPAY_STORAGE_KEYS } from '../constants/vnpay'
import { LocalStorageManager, SessionStorageManager, parseFromLocalStorage } from './localStorage'
import { smartParseParam } from './params'

// Sample plain params from VNPAY mobile app:
// /vnpay/login?mobile=0912345678&bankCode=970422&bankName=Agribank&token=demo-token-from-vnpay&fname=Nguyen%20Van%20A&language=VN&appVersion=5.1.0&sdkVersion=1.0.0&rawData=%7B%22source%22%3A%22mobilebanking%22%2C%22campaign%22%3A%22demo%22%7D&logo=VNPAY
// Sample encrypted payload before AES-256-CBC + base64(iv + ciphertext):
// {"mobile":"0912345678","bankCode":"970422","bankName":"Agribank","token":"demo-token-from-vnpay","fname":"Nguyen Van A","language":"VN","appVersion":"5.1.0","sdkVersion":"1.0.0","rawData":{"source":"mobilebanking","campaign":"demo"}}

const VNPAY_REQUIRED_FIELDS = ['mobile', 'bankCode', 'bankName']

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

const getPlainPayloadFromSearchParams = (searchParams) => {
  const payloadParam = searchParams.get('payload')
  if (payloadParam) {
    const parsedPayload = smartParseParam(payloadParam)
    if (parsedPayload && typeof parsedPayload === 'object') {
      return normalizeVnpayPayload(parsedPayload)
    }
  }

  return normalizeVnpayPayload({
    mobile: searchParams.get('mobile'),
    bankCode: searchParams.get('bankCode') || searchParams.get('bankcode'),
    bankName: searchParams.get('bankName') || searchParams.get('bankname'),
    token: searchParams.get('token'),
    fname: searchParams.get('fname') || searchParams.get('fullName'),
    language: searchParams.get('language'),
    appVersion: searchParams.get('appVersion'),
    sdkVersion: searchParams.get('sdkVersion'),
    rawData: searchParams.get('rawData'),
    logo: searchParams.get('logo')
  })
}

const normalizeAesKey = (key) => {
  const resolvedKey = normalizeString(key || VNPAY_ENV.AES_KEY)
  if (!resolvedKey) {
    throw new Error('Missing VNPAY AES key')
  }

  if (resolvedKey.length === 32) {
    return resolvedKey
  }

  if (resolvedKey.length > 32) {
    return resolvedKey.slice(0, 32)
  }

  return resolvedKey.padEnd(32, '0')
}

const decodeBase64ToUint8Array = (value) => {
  const normalized = normalizeString(value).replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const binaryString = window.atob(padded)
  const bytes = new Uint8Array(binaryString.length)

  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index)
  }

  return bytes
}

export const decryptVnpayPayload = (encryptedValue, aesKey = VNPAY_ENV.AES_KEY) => {
  const payloadBytes = decodeBase64ToUint8Array(encryptedValue)
  if (payloadBytes.length <= 16) {
    throw new Error('Invalid encrypted VNPAY payload')
  }

  const iv = CryptoJS.lib.WordArray.create(payloadBytes.slice(0, 16))
  const cipherBytes = CryptoJS.lib.WordArray.create(payloadBytes.slice(16))
  const key = CryptoJS.enc.Utf8.parse(normalizeAesKey(aesKey))
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: cipherBytes }, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  const plaintext = decrypted.toString(CryptoJS.enc.Utf8)

  if (!plaintext) {
    throw new Error('Unable to decrypt VNPAY payload')
  }

  return normalizeVnpayPayload(JSON.parse(plaintext))
}

const pemToArrayBuffer = (pem) => {
  const base64 = normalizeString(pem)
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '')

  return decodeBase64ToUint8Array(base64).buffer
}

export const verifyVnpayToken = async (payload, publicKeyPem = VNPAY_ENV.RSA_PUBLIC_KEY) => {
  if (!normalizeString(publicKeyPem) || !normalizeString(payload?.token)) {
    return {
      isValid: true,
      skipped: true
    }
  }

  if (!window.crypto?.subtle) {
    return {
      isValid: false,
      skipped: false,
      reason: 'Web Crypto API is unavailable'
    }
  }

  try {
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      pemToArrayBuffer(publicKeyPem),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['verify']
    )
    const signedValue = new TextEncoder().encode(`${payload.mobile}${payload.bankCode}${payload.bankName}`)
    const signature = decodeBase64ToUint8Array(payload.token)
    const isValid = await window.crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signature,
      signedValue
    )

    return {
      isValid,
      skipped: false
    }
  } catch (error) {
    console.error('VNPAY token verification failed', error)
    return {
      isValid: false,
      skipped: false,
      reason: error?.message || 'Token verification failed'
    }
  }
}

export const resolveVnpayLogoPath = (logoValue) => {
  const normalizedLogo = normalizeString(logoValue || VNPAY_ENV.DEFAULT_LOGO).toUpperCase()
  return normalizedLogo ? `/${normalizedLogo}.png` : '/logo.png'
}

export const getVnpayPayloadFromSearch = async (search = window.location.search) => {
  const searchParams = new URLSearchParams(search)
  const encryptedValue = normalizeString(searchParams.get('data'))
  const payload = encryptedValue ? decryptVnpayPayload(encryptedValue) : getPlainPayloadFromSearchParams(searchParams)

  VNPAY_REQUIRED_FIELDS.forEach((fieldName) => {
    if (!normalizeString(payload[fieldName])) {
      throw new Error(`Missing VNPAY field: ${fieldName}`)
    }
  })

  const tokenValidation = await verifyVnpayToken(payload)
  if (!tokenValidation.isValid) {
    throw new Error(tokenValidation.reason || 'Invalid VNPAY token')
  }

  return {
    payload,
    logo: resolveVnpayLogoPath(payload.logo || searchParams.get('logo')),
    meta: {
      source: encryptedValue ? 'encrypted' : 'plain',
      tokenValidation
    }
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

export const persistVnpayLoginState = (payload) => {
  const normalizedPayload = normalizeVnpayPayload(payload)
  const consentUserProfile = buildVnpayConsentUserProfile(normalizedPayload)
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
