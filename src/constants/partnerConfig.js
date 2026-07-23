export const PARTNER_CONFIG = {
  bidv: {
    partnerName: 'bidv',
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
  }
}

export const getPartnerConfig = (partnerName) => {
  if (!partnerName) return null
  return PARTNER_CONFIG[partnerName.toLowerCase()] || null
}
