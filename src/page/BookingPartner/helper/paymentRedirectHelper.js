export const getScheduleHashFromPayload = (payload = {}) => payload?.scheduleHash || payload?.schedulehash || ''

const extractOrderIdFromPaymentUrl = (paymentUrl = '') => {
  const match = String(paymentUrl || '').match(/\/order-payment\/(\d+)/)
  return match ? Number(match[1]) : null
}

export const resolveExternalPaymentContext = (paymentData = {}) => {
  if (typeof paymentData === 'string') {
    return {
      url: paymentData,
      orderId: extractOrderIdFromPaymentUrl(paymentData),
      scheduleHash: '',
      isConsultantBooking: false
    }
  }

  const payload = paymentData && typeof paymentData === 'object' ? paymentData : {}
  return {
    url: payload?.paymentUrl || '',
    orderId: payload?.orderId || extractOrderIdFromPaymentUrl(payload?.paymentUrl),
    scheduleHash: getScheduleHashFromPayload(payload),
    isConsultantBooking: Boolean(payload?.isConsultantBooking)
  }
}

export const buildPaymentBackUrl = ({ isConsultantBooking = false, orderId = null, scheduleHash = '', bookingDetailPath = '' }) => {
  if (!bookingDetailPath) return ''
  try {
    const backUrl = new URL(`${window.location.origin}${bookingDetailPath}`)
    if (isConsultantBooking) {
      if (!orderId) return ''
      backUrl.searchParams.set('orderId', String(orderId))
      return backUrl.toString()
    }
    if (!scheduleHash) return ''
    backUrl.searchParams.set('schedulehash', scheduleHash)
    return backUrl.toString()
  } catch (error) {
    return ''
  }
}

export const buildExternalPaymentUrl = ({ rawUrl = '', backUrl = '', themeName = '' }) => {
  if (!rawUrl) return ''
  try {
    const urlObj = new URL(rawUrl, window.location.origin)
    urlObj.searchParams.delete('isBackToHomeMiniApp')
    urlObj.searchParams.delete('isEmbeddedView')
    urlObj.searchParams.delete('isembbedview')
    urlObj.searchParams.delete('isEmbedded')
    urlObj.searchParams.delete('backUrl')
    urlObj.searchParams.delete('backurl')

    if (backUrl) {
      urlObj.searchParams.set('backUrl', backUrl)
    }

    if (themeName && !urlObj.searchParams.has('themeName')) {
      urlObj.searchParams.set('themeName', themeName)
    }

    return urlObj.toString()
  } catch (error) {
    return rawUrl
  }
}
