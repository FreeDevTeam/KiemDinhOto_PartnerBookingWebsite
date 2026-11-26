/**
 * Bản nháp form đặt lịch, dùng để khôi phục dữ liệu khi người dùng sang màn thanh toán rồi quay lại.
 *
 * Bản nháp được gắn vào history state của chính entry trang đặt lịch (history.replace trước khi push sang trang khác):
 *  - Back/forward về đúng entry đó thì có dữ liệu, mở trang đặt lịch mới (link, menu) thì form trống như bình thường.
 *  - Trình duyệt tự giữ/xoá theo lịch sử điều hướng, không cần tự dọn như localStorage/sessionStorage.
 * History state phải serialize được (structured clone) nên chỉ lưu giá trị nguyên thuỷ, không lưu object có JSX/moment.
 */
export const BOOKING_DRAFT_STATE_KEY = 'bookingDraft'
const BOOKING_DRAFT_VERSION = 1

// Các field nhập trực tiếp, khôi phục ngay khi form sẵn sàng
export const BOOKING_DRAFT_BASE_FIELDS = [
  'name',
  'phone',
  'email',
  'scheduleType',
  'licensePlates',
  'licensePlateColor',
  'vehicleSubType',
  'vehicleSubCategory',
  'certificateSeries',
  'vntId',
  'stationType'
]

const isPrimitive = (value) => value === null || ['string', 'number', 'boolean'].includes(typeof value)

/**
 * Tạo bản nháp từ giá trị form.
 * stationsId, dateSchedule, time, serviceId phụ thuộc dữ liệu tải từ API (trạm → ngày → giờ, trạm → dịch vụ)
 * nên được khôi phục theo chuỗi khi danh sách tương ứng tải xong.
 */
export function buildBookingDraft(formValues = {}, { isRedirectConsentChecked = false } = {}) {
  const fields = {}
  BOOKING_DRAFT_BASE_FIELDS.forEach((key) => {
    if (formValues[key] !== undefined && isPrimitive(formValues[key])) {
      fields[key] = formValues[key]
    }
  })

  const schedule = {
    stationsId: isPrimitive(formValues.stationsId) ? formValues.stationsId ?? null : null,
    dateSchedule: typeof formValues.dateSchedule === 'string' ? formValues.dateSchedule : null,
    scheduleTime: isPrimitive(formValues.time?.scheduleTime) ? formValues.time.scheduleTime ?? null : null,
    serviceId: isPrimitive(formValues.serviceId) ? formValues.serviceId ?? null : null
  }

  return { version: BOOKING_DRAFT_VERSION, fields, schedule, isRedirectConsentChecked: !!isRedirectConsentChecked }
}

export function getBookingDraftFromLocation(location) {
  const draft = location?.state?.[BOOKING_DRAFT_STATE_KEY]
  if (!draft || draft.version !== BOOKING_DRAFT_VERSION || typeof draft.fields !== 'object') {
    return null
  }
  return draft
}

// Ghi bản nháp vào entry hiện tại (không tạo entry mới), gọi ngay trước khi điều hướng sang trang khác
export function saveBookingDraftToHistory(history, draft) {
  const { location } = history
  history.replace({ ...location, state: { ...(location.state || {}), [BOOKING_DRAFT_STATE_KEY]: draft } })
}
