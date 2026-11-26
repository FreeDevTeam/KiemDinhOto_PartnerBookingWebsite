import { createMemoryHistory } from 'history'
import { BOOKING_DRAFT_STATE_KEY, buildBookingDraft, getBookingDraftFromLocation, saveBookingDraftToHistory } from './bookingDraft'

const FORM_VALUES = {
  name: 'Nguyen Van A',
  phone: '0912345678',
  email: undefined,
  scheduleType: 1,
  licensePlates: '30A12345',
  licensePlateColor: 1,
  vehicleSubType: 1,
  vehicleSubCategory: 10,
  vntId: 'HN',
  stationType: 0,
  stationsId: 12,
  dateSchedule: '28/11/2026',
  // Giá trị giờ trong form có label là JSX, không được đưa vào history state
  time: { scheduleTime: '08:00-09:00', label: { $$typeof: Symbol.for('react.element') }, disabled: false },
  serviceId: 5
}

describe('bản nháp form đặt lịch', () => {
  it('chỉ giữ giá trị serialize được, tách phần phụ thuộc trạm/ngày/giờ', () => {
    const draft = buildBookingDraft(FORM_VALUES, { isRedirectConsentChecked: true })

    expect(draft.fields).toEqual({
      name: 'Nguyen Van A',
      phone: '0912345678',
      scheduleType: 1,
      licensePlates: '30A12345',
      licensePlateColor: 1,
      vehicleSubType: 1,
      vehicleSubCategory: 10,
      vntId: 'HN',
      stationType: 0
    })
    expect(draft.schedule).toEqual({ stationsId: 12, dateSchedule: '28/11/2026', scheduleTime: '08:00-09:00', serviceId: 5 })
    expect(draft.isRedirectConsentChecked).toBe(true)
    // Chỉ còn dữ liệu thuần: serialize rồi đọc lại không mất gì
    expect(JSON.parse(JSON.stringify(draft))).toEqual(draft)
  })

  it('form trống tạo bản nháp rỗng hợp lệ', () => {
    const draft = buildBookingDraft()
    expect(draft.fields).toEqual({})
    expect(draft.schedule).toEqual({ stationsId: null, dateSchedule: null, scheduleTime: null, serviceId: null })
  })

  it('lưu vào entry hiện tại và đọc lại khi back về', () => {
    const history = createMemoryHistory({ initialEntries: ['/booking?apiKey=abc'] })
    const draft = buildBookingDraft(FORM_VALUES)

    saveBookingDraftToHistory(history, draft)
    history.push('/schedule-payment?orderId=1')
    expect(getBookingDraftFromLocation(history.location)).toBeNull()

    history.goBack()
    expect(history.location.search).toBe('?apiKey=abc')
    expect(getBookingDraftFromLocation(history.location)).toEqual(draft)
  })

  it('bỏ qua state không phải bản nháp hợp lệ', () => {
    expect(getBookingDraftFromLocation(undefined)).toBeNull()
    expect(getBookingDraftFromLocation({ state: null })).toBeNull()
    expect(getBookingDraftFromLocation({ state: { [BOOKING_DRAFT_STATE_KEY]: { version: 999, fields: {} } } })).toBeNull()
  })
})
