export const getDataSDKFromVnpay = async () => {
  try {
    const rawData = localStorage.getItem('vnpayWebviewData')
    const fallbackPhone = localStorage.getItem('vnpayPhoneNumber') || ''
    const fallbackName = localStorage.getItem('vnpayFullName') || ''

    let payload = {}
    if (rawData) {
      payload = JSON.parse(rawData)
    }

    const fullName = (payload?.fname || fallbackName || '').trim()
    const phoneNumber = String(payload?.mobile || fallbackPhone || '').replace(/\s+/g, '')
    const uuid = String(payload?.token || phoneNumber || '').trim()

    if (!fullName || !phoneNumber) {
      return {
        data: {},
        error: true
      }
    }

    return {
      data: {
        fullName,
        phoneNumber,
        uuid
      },
      error: false
    }
  } catch (error) {
    return {
      data: {},
      error: true
    }
  }

}
