import { useCallback, useEffect, useRef, useState } from 'react'
import BookingService from '../services/addBookingService'
import PaymentService from '../services/paymentService'
import { PAYMENT_SUB_TYPE, PAYMENT_TYPE } from '../constants/global'
import {
  ORDER_PAYMENT_STATUS,
  PAYMENT_ACTION,
  buildCreatePaymentPayload,
  getCreatePaymentErrorMessage,
  isOrderPayable,
  resolvePaymentAction
} from '../helper/orderPayment'

const REQUEST_TIMEOUT_MS = 20000
const POLL_INTERVAL_MS = 5000
const MAX_POLL_COUNT = 120 // 120 lần x 5s = 10 phút, sau đó dừng và để khách bấm kiểm tra lại
const INITIATED_KEY_PREFIX = 'schedulePayment.initiated.'
const RECORD_NOT_FOUND_ERROR = 'RECORD_NOT_FOUND'
const FINAL_PAYMENT_STATUS_LIST = [ORDER_PAYMENT_STATUS.SUCCESS, ORDER_PAYMENT_STATUS.CANCELED, ORDER_PAYMENT_STATUS.FAILED]

export const ORDER_LOAD_STATE = {
  LOADING: 'LOADING',
  READY: 'READY',
  INVALID: 'INVALID',
  ERROR: 'ERROR'
}

// Request.send không resolve khi mất kết nối nên phải tự giới hạn thời gian chờ
function withTimeout(promise) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve({ isNetworkError: true }), REQUEST_TIMEOUT_MS))])
}

function readInitiated(orderId) {
  try {
    return window.sessionStorage.getItem(`${INITIATED_KEY_PREFIX}${orderId}`) === '1'
  } catch {
    return false
  }
}

function writeInitiated(orderId, isInitiated) {
  try {
    if (isInitiated) {
      window.sessionStorage.setItem(`${INITIATED_KEY_PREFIX}${orderId}`, '1')
    } else {
      window.sessionStorage.removeItem(`${INITIATED_KEY_PREFIX}${orderId}`)
    }
  } catch {}
}

export default function useOrderPayment(orderId) {
  const [orderLoadState, setOrderLoadState] = useState(orderId ? ORDER_LOAD_STATE.LOADING : ORDER_LOAD_STATE.INVALID)
  const [orderDetail, setOrderDetail] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWaitingPayment, setIsWaitingPayment] = useState(() => (orderId ? readInitiated(orderId) : false))
  const [paymentError, setPaymentError] = useState(null)
  const [qrInfo, setQrInfo] = useState(null)
  const isSubmittingRef = useRef(false)
  const pollCountRef = useRef(0)

  // Luôn lấy lại đơn từ Backend: trạng thái và số tiền không bao giờ do Frontend tự quyết định
  const loadOrder = useCallback(
    async ({ isSilent = false } = {}) => {
      if (!orderId) {
        return null
      }
      if (!isSilent) {
        setOrderLoadState(ORDER_LOAD_STATE.LOADING)
      }

      const result = await withTimeout(PaymentService.getOrderDetail(orderId))
      if (result?.statusCode === 200 && result?.data?.orderId === orderId) {
        setOrderDetail(result.data)
        setOrderLoadState(ORDER_LOAD_STATE.READY)
        return result.data
      }

      // Lỗi mạng khi đang polling thì giữ nguyên màn hình hiện tại và thử lại ở lần sau
      if (isSilent) {
        return null
      }
      const isNotFound = result?.error === RECORD_NOT_FOUND_ERROR || (result?.statusCode === 200 && !result?.data?.orderId)
      setOrderLoadState(isNotFound ? ORDER_LOAD_STATE.INVALID : ORDER_LOAD_STATE.ERROR)
      return null
    },
    [orderId],
  )

  useEffect(() => {
    loadOrder()
  }, [loadOrder])

  const isPayable = isOrderPayable(orderDetail)
  const orderPaymentStatus = orderDetail?.paymentStatus

  // Dừng chờ thanh toán: tắt thông báo chờ, đóng QR và ngừng hỏi Backend. Khách có thể chọn phương thức khác rồi thanh toán lại.
  const stopWaitingPayment = useCallback(() => {
    writeInitiated(orderId, false)
    setIsWaitingPayment(false)
    setQrInfo(null)
  }, [orderId])

  // Backend đã chốt trạng thái (thành công / thất bại / hủy) thì dừng chờ
  useEffect(() => {
    if (orderPaymentStatus && FINAL_PAYMENT_STATUS_LIST.includes(orderPaymentStatus)) {
      stopWaitingPayment()
    }
  }, [orderPaymentStatus, stopWaitingPayment])

  // Hỏi lại Backend định kỳ trong lúc chờ khách thanh toán (QR đang mở hoặc vừa quay lại từ cổng thanh toán)
  useEffect(() => {
    if (!isWaitingPayment || !isPayable || orderPaymentStatus === ORDER_PAYMENT_STATUS.FAILED) {
      return undefined
    }

    pollCountRef.current = 0
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'hidden') {
        return
      }
      pollCountRef.current += 1
      if (pollCountRef.current > MAX_POLL_COUNT) {
        // Chờ quá lâu mà Backend chưa xác nhận: không treo thông báo chờ mãi, để khách kiểm tra lại hoặc chọn phương thức khác
        clearInterval(intervalId)
        stopWaitingPayment()
        setPaymentError('Chưa nhận được xác nhận thanh toán. Nếu đã thanh toán, vui lòng tải lại trang sau ít phút; hoặc chọn phương thức khác để thanh toán lại.')
        return
      }
      loadOrder({ isSilent: true })
    }, POLL_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [isWaitingPayment, isPayable, orderPaymentStatus, loadOrder, stopWaitingPayment])

  // Quay lại tab / quay lại từ cổng thanh toán (bfcache): bỏ khóa nút và kiểm tra lại trạng thái từ Backend
  useEffect(() => {
    const handleReturn = () => {
      if (document.visibilityState === 'hidden') {
        return
      }
      isSubmittingRef.current = false
      setIsSubmitting(false)
      if (orderId && readInitiated(orderId)) {
        loadOrder({ isSilent: true })
      }
    }
    window.addEventListener('pageshow', handleReturn)
    document.addEventListener('visibilitychange', handleReturn)
    return () => {
      window.removeEventListener('pageshow', handleReturn)
      document.removeEventListener('visibilitychange', handleReturn)
    }
  }, [orderId, loadOrder])

  const handlePay = useCallback(
    async (selectedMethod) => {
      // Khóa ngay bằng ref để bấm nhanh nhiều lần không tạo nhiều giao dịch
      if (isSubmittingRef.current) {
        return
      }
      if (!isOrderPayable(orderDetail) || !selectedMethod || !(orderDetail.totalAmount > 0)) {
        return
      }

      isSubmittingRef.current = true
      setIsSubmitting(true)
      setPaymentError(null)

      const isGtelMiniApp = window?._env_?.REACT_APP_MINIAPP_GTELPAY == '1' && selectedMethod.paymentMethodType === PAYMENT_TYPE.GTEL_PAY
      const payload = buildCreatePaymentPayload(orderDetail, selectedMethod, {
        paymentMethodSubType: isGtelMiniApp ? PAYMENT_SUB_TYPE.GTEL_WEBINAPP : undefined,
        returnUrl: `${window.location.origin}/schedule-payment?orderId=${orderId}`
      })
      const result = await withTimeout(BookingService.createPayment(payload))

      if (!result?.isSuccess) {
        setPaymentError(result?.isNetworkError ? 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.' : getCreatePaymentErrorMessage(result?.error))
        isSubmittingRef.current = false
        setIsSubmitting(false)
        // Đơn có thể đã được thanh toán ở lần trước (ORDER_ALREADY_PAID): lấy lại trạng thái thật từ Backend
        loadOrder({ isSilent: true })
        return
      }

      const action = resolvePaymentAction(result.data)
      if (action.type === PAYMENT_ACTION.PAID) {
        isSubmittingRef.current = false
        setIsSubmitting(false)
        await loadOrder({ isSilent: true })
        return
      }

      writeInitiated(orderId, true)
      setIsWaitingPayment(true)

      if (action.type === PAYMENT_ACTION.REDIRECT) {
        // Giữ trạng thái đang chuyển cổng; được mở khóa lại khi khách quay về trang này
        window.location.href = action.url
        return
      }

      if (action.type === PAYMENT_ACTION.GTEL_IN_APP) {
        const gtelBridge = window.GtelPayJSBridge
        if (gtelBridge?.payOrder) {
          gtelBridge.payOrder({ order_id: action.gtelOrderId })
        } else {
          setPaymentError('Không thể mở ví GtelPay trên thiết bị này.')
        }
      } else if (action.type === PAYMENT_ACTION.SHOW_QR) {
        setQrInfo({ bankQR: action.bankQR, momoQR: action.momoQR, paymentMethod: selectedMethod, totalAmount: orderDetail.totalAmount, runTime: Date.now() })
      }

      isSubmittingRef.current = false
      setIsSubmitting(false)
    },
    [loadOrder, orderDetail, orderId],
  )

  return {
    orderLoadState,
    orderDetail,
    isPayable,
    isSubmitting,
    isWaitingPayment,
    paymentError,
    clearPaymentError: () => setPaymentError(null),
    qrInfo,
    // Đóng QR = khách bỏ phương thức vừa chọn: không còn chờ, được chọn phương thức khác
    closeQr: stopWaitingPayment,
    stopWaitingPayment,
    reloadOrder: () => loadOrder(),
    checkPaymentNow: () => loadOrder({ isSilent: true }),
    handlePay
  }
}
