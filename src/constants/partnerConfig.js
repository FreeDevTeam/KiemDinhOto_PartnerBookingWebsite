export const PARTNER_CONFIG = {
  myf88: {
    partnerName: 'myf88',
    displayName: 'MyF88',
    requireConsent: true,
    consentMode: 2,
    logoPath: '/MYF88.png',
    fallbackLogoPath: '/logo.png',
    loadingText: 'Đang tải dữ liệu...',
    errorText: 'Tải dữ liệu thất bại. Vui lòng liên hệ CSKH để được hỗ trợ',
    backToAppUrl: 'https://miniapp-partner-f88.tamove.vn?back_app',
    timeoutMs: 3000,
    minLoadingMs: 3000,
  },
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
