import { LocalStorageManager } from '../helper/localStorage'

export const STORAGE_KEY_PARTNER_NAME = 'partnerName'

export const getPartnerName = (customName) => {
  const name = customName !== undefined && customName !== null
    ? customName
    : (LocalStorageManager.getItem(STORAGE_KEY_PARTNER_NAME) || '')
  return typeof name === 'string' ? name.trim().toUpperCase() : String(name || '').trim().toUpperCase()
}

export const PARTNER_CONFIG = {
  BIDV: {
    partnerName: 'BIDV',
    displayName: 'BIDV',
    requireConsent: false,
    consentMode: null,
    logoPath: '/BIDV.png',
    fallbackLogoPath: '/logo.png',
    loadingText: 'Đang tải dữ liệu...',
    errorText: 'Tải dữ liệu thất bại.',
    backToAppUrl: null,
    timeoutMs: 3000,
    minLoadingMs: 2000,
  },
  IHANOI: {
    partnerName: 'IHANOI',
    displayName: 'iHaNoi',
    requireConsent: false,
    consentMode: null,
    logoPath: null,
    fallbackLogoPath: '/logo.png',
    loadingText: 'Đang tải dữ liệu...',
    errorText: 'Tải dữ liệu thất bại.',
    backToAppUrl: null,
    timeoutMs: 3000,
    minLoadingMs: 2000,
  }
}

export const getPartnerConfig = (partnerName) => {
  const normalizedName = getPartnerName(partnerName)
  if (!normalizedName) return null
  return PARTNER_CONFIG[normalizedName] || null
}

