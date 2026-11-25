import React from 'react'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import SchedulePayment from './index'
import PaymentService from '../../services/paymentService'
import BookingService from '../../services/addBookingService'

jest.mock('../../services/paymentService', () => ({ __esModule: true, default: { getOrderDetail: jest.fn(), getPaymentQRMethod: jest.fn() } }))
jest.mock('../../services/addBookingService', () => ({ __esModule: true, default: { createPayment: jest.fn() } }))
jest.mock('../../context/AppParamsContext', () => ({ useAppParamsContext: () => ({ isHeaderMiniApp: false, isHeaderMiniAppExpand: false, isEmbeddedView: false }) }))
jest.mock('../../components/ModalPaymentQR/ModalPaymentQR', () => ({ driver, onClose }) => (
  <div data-testid="qr-modal">
    {driver.qr.bankQR?.paymentContent}
    <button onClick={onClose}>Đóng QR</button>
  </div>
))

const STATION_METHOD = { paymentMethodId: 3, paymentMethodType: 17, paymentMethodName: 'Ngân hàng của trạm', paymentMethodEnable: 1 }
const SYSTEM_METHOD = { paymentMethodId: 9, paymentMethodType: 12, paymentMethodName: 'Cổng của hệ thống', paymentMethodEnable: 1 }

function buildOrder(overrides = {}) {
  return {
    orderId: 8277,
    orderCode: 'CSP8277',
    orderStatus: 0,
    paymentStatus: 'New',
    stationsId: 5232,
    subTotalAmount: 1200000,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 1200000,
    customerScheduleId: null,
    orderItems: [{ orderItemId: 1, orderItemName: 'Dịch vụ: Thay dầu', productPrice: 1200000, quantity: 1 }],
    availablePaymentMethods: [STATION_METHOD],
    ...overrides
  }
}

const mockOrder = (order) => PaymentService.getOrderDetail.mockResolvedValue({ statusCode: 200, data: order })
const acceptTerm = () => fireEvent.click(screen.getByRole('checkbox'))
const payButton = () => screen.getByRole('button', { name: /^Thanh toán/ })

function renderPage(search = '?orderId=8277') {
  return render(
    <MemoryRouter initialEntries={[`/schedule-payment${search}`]}>
      <Route path="/schedule-payment" component={SchedulePayment} />
    </MemoryRouter>,
  )
}

describe('SchedulePayment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()
  })

  it('hiển thị tiêu đề, thông tin đơn từ Backend, điều khoản, tổng đơn hàng; chưa báo đặt lịch thành công', async () => {
    mockOrder(buildOrder({ taxAmount: 120000, totalAmount: 1320000 }))
    renderPage()

    expect(await screen.findByText('Chi tiết thanh toán đơn hàng')).toBeTruthy()
    expect(await screen.findByText('Dịch vụ: Thay dầu')).toBeTruthy()
    expect(screen.getAllByText('1,320,000đ').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('120,000đ')).toBeTruthy()
    expect(screen.getByText('Thuế VAT (10%)')).toBeTruthy()
    expect(screen.getByText('Chưa thanh toán')).toBeTruthy()
    expect(screen.getByText('Điều khoản thanh toán')).toBeTruthy()
    expect(screen.getByText('Tổng đơn hàng')).toBeTruthy()
    expect(screen.getByText(/BẢO MẬT THEO QUY ĐỊNH/)).toBeTruthy()
    expect(screen.queryByText(/Thanh toán thành công/)).toBeNull()
    expect(PaymentService.getOrderDetail).toHaveBeenCalledWith(8277)
  })

  it('không thu hộ: chỉ hiện phương thức của trạm (chọn sẵn cái đầu), không gọi danh sách hệ thống', async () => {
    mockOrder(buildOrder())
    renderPage()

    expect(await screen.findByText('Ngân hàng của trạm')).toBeTruthy()
    expect(PaymentService.getPaymentQRMethod).not.toHaveBeenCalled()
  })

  it('thu hộ: lấy danh sách do hệ thống quản lý, không dùng danh sách của trạm', async () => {
    mockOrder(buildOrder())
    PaymentService.getPaymentQRMethod.mockResolvedValue({ bank: SYSTEM_METHOD, momo: undefined })
    renderPage('?orderId=8277&isPaymentCollection=1')

    expect(await screen.findByText('Cổng của hệ thống')).toBeTruthy()
    expect(PaymentService.getPaymentQRMethod).toHaveBeenCalledWith({})
    expect(screen.queryByText('Ngân hàng của trạm')).toBeNull()
  })

  it('danh sách rỗng: báo không có phương thức, không hiện cổng mặc định, không cho thanh toán', async () => {
    mockOrder(buildOrder({ availablePaymentMethods: [] }))
    renderPage()

    expect(await screen.findByText(/chưa có phương thức thanh toán khả dụng/)).toBeTruthy()
    expect(screen.queryByText('BIDV')).toBeNull()
    acceptTerm()
    expect(payButton().disabled).toBe(true)
  })

  it('phương thức không bật (paymentMethodEnable != 1) không được hiển thị', async () => {
    mockOrder(buildOrder({ availablePaymentMethods: [{ ...STATION_METHOD, paymentMethodEnable: 0 }] }))
    renderPage()
    expect(await screen.findByText(/chưa có phương thức thanh toán khả dụng/)).toBeTruthy()
  })

  it('chưa tích điều khoản thì không thanh toán được; tích rồi bấm nhanh nhiều lần chỉ tạo 1 giao dịch', async () => {
    mockOrder(buildOrder())
    let resolvePayment
    BookingService.createPayment.mockReturnValue(new Promise((resolve) => (resolvePayment = resolve)))
    renderPage()

    await screen.findByText('Ngân hàng của trạm')
    expect(payButton().disabled).toBe(true)
    acceptTerm()
    fireEvent.click(payButton())
    fireEvent.click(payButton())
    fireEvent.click(payButton())

    expect(BookingService.createPayment).toHaveBeenCalledTimes(1)
    expect(BookingService.createPayment.mock.calls[0][0]).toMatchObject({ customerScheduleId: 8277, paymentMethodType: 17, paymentMethodId: 3, stationsId: 5232 })
    await act(async () => resolvePayment({ isSuccess: true, data: {} }))
  })

  it('response có QR: mở QR và chờ Backend xác nhận, chưa tự báo thành công', async () => {
    mockOrder(buildOrder())
    BookingService.createPayment.mockResolvedValue({ isSuccess: true, data: { paymentStatus: 'New', bankQR: { qrData: 'data:image/png;base64,xx', paymentContent: 'ND123' } } })
    renderPage()

    await screen.findByText('Ngân hàng của trạm')
    acceptTerm()
    fireEvent.click(payButton())

    expect(await screen.findByText('ND123')).toBeTruthy()
    expect(screen.queryByText('Đang chờ xác nhận thanh toán')).toBeNull() // không có popup chờ
    expect(screen.queryByText('Thanh toán thành công')).toBeNull()
  })

  it('khởi tạo thanh toán lỗi: báo lỗi, giữ đơn, cho thử lại', async () => {
    mockOrder(buildOrder())
    BookingService.createPayment.mockResolvedValue({ isSuccess: false, error: 'CREATE_PAYMENT_FAILED' })
    renderPage()

    await screen.findByText('Ngân hàng của trạm')
    acceptTerm()
    fireEvent.click(payButton())

    expect(await screen.findByText('Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.')).toBeTruthy()
    await waitFor(() => expect(payButton().disabled).toBe(false))
  })

  it('Backend xác nhận đã thanh toán: hiện thành công, ẩn phần chọn phương thức và nút thanh toán', async () => {
    mockOrder(buildOrder({ paymentStatus: 'Success', customerScheduleId: 2127, availablePaymentMethods: [] }))
    renderPage()

    expect(await screen.findByText('Thanh toán thành công')).toBeTruthy()
    expect(screen.getByText('Lịch hẹn của quý khách đã được tạo.')).toBeTruthy()
    expect(screen.queryByText('Phương thức thanh toán')).toBeNull()
    expect(screen.queryByRole('button', { name: /^Thanh toán/ })).toBeNull()
  })

  it('đã thanh toán nhưng lịch chưa tạo xong: báo đang tạo lịch', async () => {
    mockOrder(buildOrder({ paymentStatus: 'Success', customerScheduleId: null }))
    renderPage()
    expect(await screen.findByText(/Hệ thống đang tạo lịch hẹn/)).toBeTruthy()
  })

  it('thanh toán thất bại: báo lỗi và vẫn cho thử lại', async () => {
    mockOrder(buildOrder({ paymentStatus: 'Failed' }))
    renderPage()

    expect(await screen.findByText('Thanh toán thất bại', { selector: '.ant-alert-message' })).toBeTruthy()
    expect(await screen.findByText('Ngân hàng của trạm')).toBeTruthy()
  })

  it('đơn đã hủy: không cho thanh toán', async () => {
    mockOrder(buildOrder({ paymentStatus: 'Canceled', orderStatus: 20 }))
    renderPage()

    expect(await screen.findByText('Đơn hàng đã hủy')).toBeTruthy()
    expect(screen.queryByText('Phương thức thanh toán')).toBeNull()
  })

  it('đơn không tồn tại hoặc thiếu orderId trên URL: báo đơn không hợp lệ và không tạo giao dịch', async () => {
    PaymentService.getOrderDetail.mockResolvedValue({ statusCode: 400, error: 'RECORD_NOT_FOUND' })
    renderPage()
    expect(await screen.findByText('Không tìm thấy đơn hàng')).toBeTruthy()
    expect(BookingService.createPayment).not.toHaveBeenCalled()
  })

  it('URL không có orderId: không gọi API, báo đơn không hợp lệ', async () => {
    renderPage('')
    expect(await screen.findByText('Không tìm thấy đơn hàng')).toBeTruthy()
    expect(PaymentService.getOrderDetail).not.toHaveBeenCalled()
  })

  it('lỗi kết nối: báo lỗi và cho tải lại', async () => {
    PaymentService.getOrderDetail.mockResolvedValueOnce({ isNetworkError: true })
    renderPage()
    expect(await screen.findByText('Không tải được đơn hàng')).toBeTruthy()

    mockOrder(buildOrder())
    fireEvent.click(screen.getByRole('button', { name: /Thử lại/ }))
    expect(await screen.findByText('Dịch vụ: Thay dầu')).toBeTruthy()
  })

  it('response có link https: chuyển sang cổng thanh toán, không tự đánh dấu đã thanh toán', async () => {
    mockOrder(buildOrder())
    BookingService.createPayment.mockResolvedValue({ isSuccess: true, data: { paymentLinkUrl: 'https://pay.example/x' } })
    const originalLocation = window.location
    delete window.location
    window.location = { ...originalLocation, origin: 'http://localhost', href: 'http://localhost/schedule-payment?orderId=8277' }
    try {
      renderPage()
      await screen.findByText('Ngân hàng của trạm')
      acceptTerm()
      fireEvent.click(payButton())

      await waitFor(() => expect(window.location.href).toBe('https://pay.example/x'))
      expect(screen.queryByText('Thanh toán thành công')).toBeNull()
    } finally {
      window.location = originalLocation
    }
  })

  it('đang chờ thanh toán: hỏi lại Backend định kỳ và chỉ báo thành công khi Backend xác nhận Success', async () => {
    jest.useFakeTimers()
    try {
      mockOrder(buildOrder())
      BookingService.createPayment.mockResolvedValue({ isSuccess: true, data: { paymentStatus: 'New', bankQR: { qrData: 'data:image/png;base64,xx' } } })
      renderPage()

      await act(async () => {
        await Promise.resolve()
      })
      await screen.findByText('Ngân hàng của trạm')
      acceptTerm()
      fireEvent.click(payButton())
      await screen.findByTestId('qr-modal')
      expect(screen.queryByText('Thanh toán thành công')).toBeNull()

      // Backend xác nhận ở lần hỏi kế tiếp
      mockOrder(buildOrder({ paymentStatus: 'Success', availablePaymentMethods: [] }))
      await act(async () => {
        jest.advanceTimersByTime(5100)
      })
      expect(await screen.findByText('Thanh toán thành công')).toBeTruthy()
      expect(screen.queryByTestId('qr-modal')).toBeNull()
    } finally {
      jest.useRealTimers()
    }
  })

  describe('đóng QR / đổi phương thức', () => {
    const OTHER_METHOD = { paymentMethodId: 4, paymentMethodType: 4, paymentMethodName: 'VNPAY', paymentMethodEnable: 1 }
    const QR_RESPONSE = { isSuccess: true, data: { paymentStatus: 'New', bankQR: { qrData: 'data:image/png;base64,xx', paymentContent: 'ND123' } } }

    it('đóng QR: ngừng hỏi Backend, và chọn phương thức khác thanh toán lại được; không có popup chờ nào', async () => {
      jest.useFakeTimers()
      try {
        mockOrder(buildOrder({ availablePaymentMethods: [STATION_METHOD, OTHER_METHOD] }))
        BookingService.createPayment.mockResolvedValue(QR_RESPONSE)
        renderPage()

        await act(async () => {
          await Promise.resolve()
        })
        await screen.findByText('Ngân hàng của trạm')
        acceptTerm()
        fireEvent.click(payButton())
        await screen.findByTestId('qr-modal')
        expect(screen.queryByText('Đang chờ xác nhận thanh toán')).toBeNull()

        // Khách hủy phương thức vừa chọn bằng cách đóng QR
        fireEvent.click(screen.getByText('Đóng QR'))
        expect(screen.queryByTestId('qr-modal')).toBeNull()

        // Không còn hỏi Backend định kỳ
        PaymentService.getOrderDetail.mockClear()
        await act(async () => {
          jest.advanceTimersByTime(20000)
        })
        expect(PaymentService.getOrderDetail).not.toHaveBeenCalled()

        // Chọn phương thức khác và thanh toán lại
        fireEvent.click(screen.getByText('VNPAY'))
        fireEvent.click(payButton())
        expect(BookingService.createPayment).toHaveBeenCalledTimes(2)
        expect(BookingService.createPayment.mock.calls[1][0]).toMatchObject({ paymentMethodType: 4, paymentMethodId: 4 })
      } finally {
        jest.useRealTimers()
      }
    })

    it('chờ quá lâu mà Backend chưa xác nhận: tự dừng và báo cho khách', async () => {
      jest.useFakeTimers()
      try {
        mockOrder(buildOrder())
        BookingService.createPayment.mockResolvedValue(QR_RESPONSE)
        renderPage()

        await act(async () => {
          await Promise.resolve()
        })
        await screen.findByText('Ngân hàng của trạm')
        acceptTerm()
        fireEvent.click(payButton())
        await screen.findByTestId('qr-modal')

        await act(async () => {
          jest.advanceTimersByTime(5000 * 125)
        })
        expect(await screen.findByText(/Chưa nhận được xác nhận thanh toán/)).toBeTruthy()
        expect(screen.queryByTestId('qr-modal')).toBeNull()
      } finally {
        jest.useRealTimers()
      }
    })
  })
})
