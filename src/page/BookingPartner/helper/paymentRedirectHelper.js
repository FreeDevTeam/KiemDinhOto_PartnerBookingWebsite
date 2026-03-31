import { REACT_APP_URL_WEB_PAYMENT } from '../../../constants/url'

export const resolveOrderPaymentIdentifiers = (orderDetail = {}) => {
  const orderId = Number(orderDetail?.orderId)

  return {
    orderId: Number.isNaN(orderId) || orderId <= 0 ? null : orderId
  }
}

const extractOrderIdFromPaymentUrl = (paymentUrl = '') => {
  const match = String(paymentUrl || '').match(/\/order-payment\/(\d+)/)
  return match ? Number(match[1]) : null
}

const buildOrderPaymentUrl = (orderId) => {
  if (!orderId) return ''
  const base = String(REACT_APP_URL_WEB_PAYMENT || '').replace(/\/$/, '')
  if (!base) return ''
  return `${base}/order-payment/${orderId}`
}

export const resolveExternalPaymentContext = (paymentData = {}) => {
  if (typeof paymentData === 'string') {
    const normalizedValue = paymentData.trim()
    const isHttpUrl = /^https?:\/\//i.test(normalizedValue)
    if (isHttpUrl) {
      return {
        url: normalizedValue,
        orderId: extractOrderIdFromPaymentUrl(normalizedValue),
        isConsultantBooking: false
      }
    }

    const orderId = Number(normalizedValue)
    return {
      url: buildOrderPaymentUrl(Number.isNaN(orderId) ? null : orderId),
      orderId: Number.isNaN(orderId) ? null : orderId,
      isConsultantBooking: false
    }
  }

  const payload = paymentData && typeof paymentData === 'object' ? paymentData : {}
  const orderId = payload?.orderId || extractOrderIdFromPaymentUrl(payload?.paymentUrl) || payload?.customerScheduleId
  const paymentUrl = payload?.paymentUrl || buildOrderPaymentUrl(orderId)
  return {
    url: paymentUrl || '',
    orderId,
    isConsultantBooking: Boolean(payload?.isConsultantBooking)
  }
}

export const buildPaymentBackUrl = ({ orderId = null, bookingDetailPath = '' }) => {
  if (!bookingDetailPath) return ''
  try {
    const backUrl = new URL(`${window.location.origin}${bookingDetailPath}`)
    if (!orderId) return ''
    backUrl.searchParams.set('orderId', String(orderId))
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

    if (backUrl) {
      urlObj.searchParams.delete('backUrl')
      urlObj.searchParams.delete('backurl')
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
