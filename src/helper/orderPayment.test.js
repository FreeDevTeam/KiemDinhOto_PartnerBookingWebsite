import {
  PAYMENT_ACTION,
  buildCreatePaymentPayload,
  buildSchedulePaymentPath,
  getItemLogoLabel,
  getOrderIdFromSearch,
  getQrImageUrl,
  getPrepaidOrderId,
  getPrepaidRedirect,
  getVatPercent,
  isOrderPayable,
  isPaymentCollectionFromSearch,
  isPrepaidBookingResponse,
  normalizePaymentMethodList,
  resolvePaymentAction
} from './orderPayment'

// Response thật của API đặt lịch thu trước (đã gặp trên môi trường dev)
const PREPAID_RESPONSE_DATA = {
  0: 8277,
  isPrepaid: 1,
  paymentMode: 'PREPAY',
  isPaymentCollection: 0,
  customerScheduleId: null,
  scheduleHash: '7906ebec',
  order: { orderId: 8277, orderCode: 'CSP17956006833475232', orderStatus: 0, paymentStatus: 'New', subTotalAmount: 1200000, totalAmount: 1200000 },
  supportedPaymentMethodList: [],
  payment: null
}

describe('nhận diện response đặt lịch thu trước', () => {
  it('isPrepaid = 1 hoặc paymentMode = PREPAY là thu trước', () => {
    expect(isPrepaidBookingResponse(PREPAID_RESPONSE_DATA)).toBe(true)
    expect(isPrepaidBookingResponse({ paymentMode: 'PREPAY' })).toBe(true)
    expect(isPrepaidBookingResponse({ isPrepaid: 1 })).toBe(true)
  })

  it('thu sau, không phí (mảng [id]) và dữ liệu rỗng không phải thu trước', () => {
    expect(isPrepaidBookingResponse({ isPrepaid: 0, paymentMode: 'PAY_LATER', customerScheduleId: 2127, order: { orderId: 1 } })).toBe(false)
    expect(isPrepaidBookingResponse([2127])).toBe(false)
    expect(isPrepaidBookingResponse(null)).toBe(false)
    expect(isPrepaidBookingResponse(undefined)).toBe(false)
  })

  it('orderId lấy từ data.order.orderId, không lấy từ data["0"] hay customerScheduleId', () => {
    expect(getPrepaidOrderId({ ...PREPAID_RESPONSE_DATA, 0: 1, customerScheduleId: 2 })).toBe(8277)
    expect(getPrepaidOrderId({ 0: 8277, isPrepaid: 1 })).toBe(null)
    expect(getPrepaidOrderId({ isPrepaid: 1, order: { orderId: 'abc' } })).toBe(null)
  })

  it('getPrepaidRedirect: thu trước có Order -> đường dẫn màn thanh toán; thiếu Order -> báo lỗi; luồng khác -> bỏ qua', () => {
    expect(getPrepaidRedirect(PREPAID_RESPONSE_DATA)).toEqual({ isPrepaid: true, orderId: 8277, path: '/schedule-payment?orderId=8277' })
    expect(getPrepaidRedirect({ ...PREPAID_RESPONSE_DATA, isPaymentCollection: 1 }).path).toBe('/schedule-payment?orderId=8277&isPaymentCollection=1')
    expect(getPrepaidRedirect({ isPrepaid: 1 })).toEqual({ isPrepaid: true, orderId: null, path: null })
    expect(getPrepaidRedirect([100])).toEqual({ isPrepaid: false })
  })
})

describe('đường dẫn màn thanh toán', () => {
  it('build và đọc lại orderId + cờ thu hộ trên URL', () => {
    expect(buildSchedulePaymentPath(8277, true)).toBe('/schedule-payment?orderId=8277&isPaymentCollection=1')
    expect(getOrderIdFromSearch('?orderId=8277&x=1')).toBe(8277)
    expect(getOrderIdFromSearch('?orderId=abc')).toBe(null)
    expect(getOrderIdFromSearch('')).toBe(null)
    expect(isPaymentCollectionFromSearch('?orderId=1&isPaymentCollection=1')).toBe(true)
    expect(isPaymentCollectionFromSearch('?orderId=1')).toBe(false)
  })
})

describe('danh sách phương thức thanh toán', () => {
  const bidv = { paymentMethodType: 17, paymentMethodId: 3, paymentMethodName: 'BIDV', paymentMethodEnable: 1 }

  it('chỉ giữ phương thức đang bật, bỏ rỗng / thiếu loại / trùng; không thêm phương thức nào', () => {
    expect(normalizePaymentMethodList([bidv, null, undefined, { paymentMethodName: 'thiếu loại', paymentMethodEnable: 1 }, { ...bidv }, { ...bidv, paymentMethodId: 4, paymentMethodEnable: 0 }])).toEqual([bidv])
    expect(normalizePaymentMethodList({ bidv: bidv, momo: undefined, vnpay: null })).toEqual([bidv])
    expect(normalizePaymentMethodList([])).toEqual([])
    expect(normalizePaymentMethodList(undefined)).toEqual([])
  })
})

describe('trạng thái đơn và payload thanh toán', () => {
  it('chỉ đơn chưa thanh toán thành công mới được thanh toán', () => {
    for (const paymentStatus of ['New', 'Pending', 'Processing', 'Failed']) {
      expect(isOrderPayable({ paymentStatus })).toBe(true)
    }
    for (const paymentStatus of ['Success', 'Canceled']) {
      expect(isOrderPayable({ paymentStatus })).toBe(false)
    }
    expect(isOrderPayable(null)).toBe(false)
  })

  it('payload createPayment dùng orderId làm customerScheduleId và đúng phương thức đã chọn', () => {
    const payload = buildCreatePaymentPayload({ orderId: 8277, stationsId: 5232 }, { paymentMethodType: 4, paymentMethodId: 7 }, { returnUrl: 'https://a/b' })
    expect(payload).toEqual({
      customerScheduleId: 8277,
      paymentMethodType: 4,
      paymentMethodId: 7,
      stationsId: 5232,
      paymentMethodOptions: { returnUrl: 'https://a/b', cancelUrl: 'https://a/b' }
    })
    expect(buildCreatePaymentPayload({ orderId: 1, stationsId: null }, { paymentMethodType: 2 })).toEqual({ customerScheduleId: 1, paymentMethodType: 2 })
  })
})

describe('hành động tiếp theo từ response khởi tạo thanh toán', () => {
  it('đã thanh toán / Gtel in-app / link https / QR / chờ', () => {
    expect(resolvePaymentAction({ paymentStatus: 'Success' }).type).toBe(PAYMENT_ACTION.PAID)
    expect(resolvePaymentAction({ inAppGtelOrderId: 'G1' })).toEqual({ type: PAYMENT_ACTION.GTEL_IN_APP, gtelOrderId: 'G1' })
    expect(resolvePaymentAction({ paymentLinkUrl: 'https://pay.example/x' })).toEqual({ type: PAYMENT_ACTION.REDIRECT, url: 'https://pay.example/x' })
    expect(resolvePaymentAction({ paymentDeepLink: 'https://deep/x' }).type).toBe(PAYMENT_ACTION.REDIRECT)
    const bankQR = { qrData: 'data:image/png;base64,xx', paymentContent: 'ND' }
    expect(resolvePaymentAction({ bankQR })).toEqual({ type: PAYMENT_ACTION.SHOW_QR, bankQR, momoQR: null })
    expect(resolvePaymentAction({}).type).toBe(PAYMENT_ACTION.WAIT)
    expect(resolvePaymentAction(null).type).toBe(PAYMENT_ACTION.WAIT)
  })

  it('QR là link ảnh VietQR (chỉ có qrCode, không có qrData) vẫn hiển thị được - response thật của Backend', () => {
    const bankQR = { qrCode: 'https://img.vietqr.io/image/ACB-131321312312-compact.png?amount=5790000', paymentContent: '8288_1795606630026' }
    expect(resolvePaymentAction({ paymentStatus: 'New', bankQR, momoQR: null, paymentLinkUrl: null, paymentDeepLink: null })).toEqual({
      type: PAYMENT_ACTION.SHOW_QR,
      bankQR,
      momoQR: null
    })
    expect(getQrImageUrl(bankQR)).toBe(bankQR.qrCode)
  })

  it('qrCode dạng chuỗi nội dung QR (không phải URL) thì không coi là ảnh; qrData được ưu tiên', () => {
    expect(getQrImageUrl({ qrCode: '00020101021238...' })).toBe(null)
    expect(resolvePaymentAction({ bankQR: { qrCode: '00020101021238...' } }).type).toBe(PAYMENT_ACTION.WAIT)
    expect(getQrImageUrl({ qrData: 'data:image/png;base64,xx', qrCode: 'https://x/y.png' })).toBe('data:image/png;base64,xx')
    expect(getQrImageUrl({ qrDataURL: 'qr/momo.png' })).toBe('qr/momo.png')
    expect(getQrImageUrl(null)).toBe(null)
  })

  it('không redirect tới link không phải https', () => {
    expect(resolvePaymentAction({ paymentLinkUrl: 'http://insecure' }).type).toBe(PAYMENT_ACTION.WAIT)
    expect(resolvePaymentAction({ paymentLinkUrl: 'javascript:alert(1)' }).type).toBe(PAYMENT_ACTION.WAIT)
  })
})

describe('hiển thị đơn hàng', () => {
  it('VAT % suy ra từ số tiền Backend, không có thuế thì không hiện %', () => {
    expect(getVatPercent({ subTotalAmount: 10000, taxAmount: 1000 })).toBe(10)
    expect(getVatPercent({ subTotalAmount: 1200000, taxAmount: 0 })).toBe(null)
    expect(getVatPercent(null)).toBe(null)
  })

  it('nhãn logo bỏ tiền tố "Dịch vụ:" và lấy tối đa 2 từ', () => {
    expect(getItemLogoLabel('Dịch vụ: Combo Rửa Xe C')).toBe('Combo Rửa')
    expect(getItemLogoLabel('ZALO7')).toBe('ZALO7')
    expect(getItemLogoLabel(undefined)).toBe('')
  })
})
