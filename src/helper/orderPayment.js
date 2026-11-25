// Cách xử lý thanh toán Backend trả về khi đặt lịch (data.paymentMode)
const SCHEDULE_PAYMENT_MODE_PREPAY = 'PREPAY'

// Trạng thái thanh toán của Order do Backend trả về (Order.paymentStatus)
export const ORDER_PAYMENT_STATUS = {
  NEW: 'New',
  PROCESSING: 'Processing',
  PENDING: 'Pending',
  FAILED: 'Failed',
  SUCCESS: 'Success',
  CANCELED: 'Canceled'
}

// Trạng thái đơn hàng Backend trả về (Order.orderStatus)
export const ORDER_STATUS_CANCELED = 20

const UNPAID_STATUS_LIST = [ORDER_PAYMENT_STATUS.NEW, ORDER_PAYMENT_STATUS.PENDING, ORDER_PAYMENT_STATUS.PROCESSING, ORDER_PAYMENT_STATUS.FAILED]

const PAYMENT_STATUS_LABEL = {
  [ORDER_PAYMENT_STATUS.NEW]: 'Chưa thanh toán',
  [ORDER_PAYMENT_STATUS.PENDING]: 'Chưa thanh toán',
  [ORDER_PAYMENT_STATUS.PROCESSING]: 'Đang xử lý thanh toán',
  [ORDER_PAYMENT_STATUS.FAILED]: 'Thanh toán thất bại',
  [ORDER_PAYMENT_STATUS.SUCCESS]: 'Đã thanh toán',
  [ORDER_PAYMENT_STATUS.CANCELED]: 'Đã hủy'
}

const CREATE_PAYMENT_ERROR_MESSAGE = {
  ORDER_NOT_FOUND: 'Đơn hàng không tồn tại.',
  ORDER_ALREADY_PAID: 'Đơn hàng đã được thanh toán.',
  INVALID_ORDER_AMOUNT: 'Số tiền đơn hàng không hợp lệ.',
  USER_NOT_FOUND: 'Không tìm thấy thông tin người đặt lịch.',
  CREATE_PAYMENT_FAILED: 'Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.',
  PAYMENT_FAILED: 'Thanh toán thất bại.',
  UNAVAILABLE_BALANCE: 'Số dư không đủ.',
  NO_LINK_ACCOUNT_WITH_VTM: 'Tài khoản chưa liên kết Viettel Money.',
  PAYMENT_METHOD_TYPE_INVALID: 'Phương thức thanh toán không hợp lệ.',
  NOT_FOUND_PAYMENT_METHOD_ID: 'Phương thức thanh toán không tồn tại.'
}

/**
 * Response đặt lịch (createSchedule / userCreateConsultant) thuộc luồng thanh toán trước.
 * Chỉ dựa vào các field có tên (isPrepaid / paymentMode / order), KHÔNG dựa vào data["0"] hay customerScheduleId.
 */
export function isPrepaidBookingResponse(data) {
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    return false
  }
  return data.isPrepaid === 1 || data.paymentMode === SCHEDULE_PAYMENT_MODE_PREPAY
}

// Id đơn hàng lấy từ data.order.orderId; trả về null nếu response không có Order hợp lệ
export function getPrepaidOrderId(data) {
  const orderId = Number(data?.order?.orderId)
  return Number.isInteger(orderId) && orderId > 0 ? orderId : null
}

/**
 * Đường dẫn màn chi tiết đơn hàng + thanh toán (cùng source). Cờ thu hộ lấy từ response đặt lịch vì
 * chi tiết đơn của Backend chưa trả cờ này; nó chỉ quyết định nguồn danh sách phương thức hiển thị.
 */
export function buildSchedulePaymentPath(orderId, isPaymentCollection = false) {
  const collectionQuery = isPaymentCollection ? '&isPaymentCollection=1' : ''
  return `/schedule-payment?orderId=${encodeURIComponent(orderId)}${collectionQuery}`
}

/**
 * Response đặt lịch thuộc luồng thanh toán trước thì phải mở màn thanh toán đơn hàng, KHÔNG báo đặt lịch thành công.
 * - isPrepaid = false: không phải luồng thanh toán trước, caller xử lý như cũ.
 * - isPrepaid = true và path = null: thiếu Order, caller báo lỗi thay vì báo thành công.
 */
export function getPrepaidRedirect(data) {
  if (!isPrepaidBookingResponse(data)) {
    return { isPrepaid: false }
  }
  const orderId = getPrepaidOrderId(data)
  return {
    isPrepaid: true,
    orderId: orderId,
    path: orderId ? buildSchedulePaymentPath(orderId, data.isPaymentCollection === 1) : null
  }
}

export function getOrderIdFromSearch(search) {
  const orderId = Number(new URLSearchParams(search || '').get('orderId'))
  return Number.isInteger(orderId) && orderId > 0 ? orderId : null
}

export function isPaymentCollectionFromSearch(search) {
  return new URLSearchParams(search || '').get('isPaymentCollection') === '1'
}

export function isOrderPayable(orderDetail) {
  return !!orderDetail && UNPAID_STATUS_LIST.includes(orderDetail.paymentStatus)
}

export function getPaymentStatusLabel(paymentStatus) {
  return PAYMENT_STATUS_LABEL[paymentStatus] || paymentStatus || '-'
}

export function getCreatePaymentErrorMessage(errorCode) {
  return CREATE_PAYMENT_ERROR_MESSAGE[errorCode] || 'Không thể khởi tạo thanh toán. Vui lòng thử lại.'
}

/**
 * Danh sách phương thức: nhận mảng (availablePaymentMethods của trạm) hoặc object theo loại (getPublicPaymentMethod của hệ thống).
 * Chỉ giữ phương thức đang bật, bỏ phần tử rỗng hoặc trùng; không thêm phương thức nào.
 */
export function normalizePaymentMethodList(rawMethods) {
  const methodList = Array.isArray(rawMethods) ? rawMethods : Object.values(rawMethods || {})
  const seenIdSet = new Set()

  return methodList.filter((method) => {
    if (!method || method.paymentMethodType === undefined || method.paymentMethodType === null || method.paymentMethodEnable !== 1) {
      return false
    }
    if (seenIdSet.has(method.paymentMethodId)) {
      return false
    }
    seenIdSet.add(method.paymentMethodId)
    return true
  })
}

// VAT % suy ra từ số tiền Backend (tiền thuế / tạm tính); không có thuế thì trả về null để không hiện %
export function getVatPercent(orderDetail) {
  const subTotalAmount = Number(orderDetail?.subTotalAmount) || 0
  const taxAmount = Number(orderDetail?.taxAmount) || 0
  if (subTotalAmount <= 0 || taxAmount <= 0) {
    return null
  }
  return Math.round((taxAmount * 100) / subTotalAmount)
}

// Chữ trên ô logo khi dịch vụ không có hình: bỏ tiền tố "Dịch vụ:", lấy tối đa 2 từ đầu
export function getItemLogoLabel(itemName) {
  const nameWithoutPrefix = `${itemName || ''}`.replace(/^Dịch vụ:\s*/i, '').trim()
  return nameWithoutPrefix.split(/\s+/).slice(0, 2).join(' ')
}

/**
 * Ảnh QR từ response thanh toán: qrData / qrDataURL (ảnh base64 hoặc đường dẫn) hoặc qrCode khi Backend trả sẵn link ảnh VietQR.
 * Với VietQR doanh nghiệp, qrCode là nội dung QR dạng chuỗi (không phải ảnh) nên chỉ nhận qrCode khi là URL http(s).
 */
export function getQrImageUrl(qrInfo) {
  if (!qrInfo) {
    return null
  }
  const imageField = qrInfo.qrDataURL || qrInfo.qrData
  if (imageField) {
    return imageField
  }
  return /^https?:\/\//.test(qrInfo.qrCode || '') ? qrInfo.qrCode : null
}

function isHttpsUrl(url) {
  return typeof url === 'string' && url.startsWith('https://')
}

export const PAYMENT_ACTION = {
  PAID: 'PAID',
  GTEL_IN_APP: 'GTEL_IN_APP',
  REDIRECT: 'REDIRECT',
  SHOW_QR: 'SHOW_QR',
  WAIT: 'WAIT'
}

/**
 * Xác định cần làm gì tiếp theo từ response khởi tạo thanh toán của Backend.
 * PAID chỉ là gợi ý để tải lại đơn: trạng thái thanh toán cuối cùng luôn do chi tiết đơn từ Backend quyết định.
 */
export function resolvePaymentAction(paymentData) {
  if (!paymentData) {
    return { type: PAYMENT_ACTION.WAIT }
  }
  if (paymentData.paymentStatus === ORDER_PAYMENT_STATUS.SUCCESS) {
    return { type: PAYMENT_ACTION.PAID }
  }
  if (paymentData.inAppGtelOrderId) {
    return { type: PAYMENT_ACTION.GTEL_IN_APP, gtelOrderId: paymentData.inAppGtelOrderId }
  }
  if (isHttpsUrl(paymentData.paymentLinkUrl)) {
    return { type: PAYMENT_ACTION.REDIRECT, url: paymentData.paymentLinkUrl }
  }
  if (isHttpsUrl(paymentData.paymentDeepLink)) {
    return { type: PAYMENT_ACTION.REDIRECT, url: paymentData.paymentDeepLink }
  }
  if (getQrImageUrl(paymentData.bankQR) || getQrImageUrl(paymentData.momoQR)) {
    return { type: PAYMENT_ACTION.SHOW_QR, bankQR: paymentData.bankQR || null, momoQR: paymentData.momoQR || null }
  }
  return { type: PAYMENT_ACTION.WAIT }
}

// Payload của /PartnerAPI/CustomerSchedule/user/createPayment: customerScheduleId chính là orderId
export function buildCreatePaymentPayload(orderDetail, paymentMethod, options = {}) {
  const payload = {
    customerScheduleId: orderDetail.orderId,
    paymentMethodType: paymentMethod.paymentMethodType
  }
  if (paymentMethod.paymentMethodId !== undefined && paymentMethod.paymentMethodId !== null) {
    payload.paymentMethodId = paymentMethod.paymentMethodId
  }
  if (Number.isInteger(orderDetail.stationsId) && orderDetail.stationsId > 0) {
    payload.stationsId = orderDetail.stationsId
  }
  if (options.paymentMethodSubType) {
    payload.paymentMethodSubType = options.paymentMethodSubType
  }
  if (options.returnUrl) {
    payload.paymentMethodOptions = { returnUrl: options.returnUrl, cancelUrl: options.returnUrl }
  }
  return payload
}
