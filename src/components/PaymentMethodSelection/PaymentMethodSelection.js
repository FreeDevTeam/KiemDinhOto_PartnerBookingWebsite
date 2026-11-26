import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Spin } from 'antd'
import './index.scss'
import PaymentService from '../../services/paymentService'
import { useAppParamsContext } from '../../context/AppParamsContext'
import { normalizePaymentMethodList } from '../../helper/orderPayment'
import defaultPaymentIcon from '../../assets/icons/payment-default.svg'

export const PAYMENT_TYPE_CODE = {
  ATM_BANK: 'ATM_BANK',
  MOMO: 'MOMO',
  GTELPAY: 'GTELPAY',
  VNPAY: 'VNPAY',
  ZALOPAY: 'ZALOPAY',
  VIETTEL_PAY: 'VIETTEL_PAY',
  TA_MOVE: 'TA_MOVE',
  SEPAY: 'SEPAY',
  SHOPEEPAY: 'SHOPEEPAY',
  BAOKIM: 'BAOKIM'
}

export const PAYMENT_TYPE = {
  ATM_BANK: 1,
  MOMO_BANK: 2,
  GTEL_PAY: 3,
  VNPAY: 4,
  ZALOPAY: 5,
  VIETTEL_PAY: 6,
  TA_MOVE: 7,
  SEPAY: 8,
  VIETTEL_MONEY: 9,
  SHOPEEPAY: 10,
  BAOKIM: 11
}

// Ảnh cổng thanh toán: Backend có thể trả null/rỗng hoặc URL hỏng -> dùng ảnh mặc định
const PaymentMethodImage = ({ src, height, alt }) => {
  const imageUrl = typeof src === 'string' && src.trim() ? src.trim() : defaultPaymentIcon
  const [currentSrc, setCurrentSrc] = useState(imageUrl)

  useEffect(() => {
    setCurrentSrc(imageUrl)
  }, [imageUrl])

  return (
    <img
      height={height}
      src={currentSrc}
      alt={alt || 'payment-method'}
      onError={() => {
        if (currentSrc !== defaultPaymentIcon) {
          setCurrentSrc(defaultPaymentIcon)
        }
      }}
    />
  )
}

const SYSTEM_METHOD_TIMEOUT_MS = 20000
const LOAD_STATE = { LOADING: 'LOADING', READY: 'READY', ERROR: 'ERROR' }

// Request.send không resolve khi mất kết nối nên phải tự giới hạn thời gian chờ
function withTimeout(promise) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), SYSTEM_METHOD_TIMEOUT_MS))])
}

/**
 * Chọn phương thức thanh toán theo cấu hình, không có danh sách mặc định:
 *  - Cho phép thu hộ: danh sách do hệ thống quản lý (API getPublicPaymentMethod không chỉ định trạm)
 *  - Không thu hộ: danh sách trạm đã cấu hình (stationPaymentMethods, lấy từ chi tiết đơn hàng của Backend)
 * Danh sách rỗng thì báo rỗng và không cho thanh toán.
 */
const PaymentMethodSelection = ({ paymentMethod, setPaymentMethod, setListPaymentMethod = () => {}, isPaymentCollection = false, stationPaymentMethods = [] }) => {
  const { paymentMethodType } = useAppParamsContext() || {}
  const [systemMethods, setSystemMethods] = useState([])
  const [loadState, setLoadState] = useState(isPaymentCollection ? LOAD_STATE.LOADING : LOAD_STATE.READY)

  const loadSystemMethods = useCallback(async () => {
    setLoadState(LOAD_STATE.LOADING)
    try {
      setSystemMethods(normalizePaymentMethodList(await withTimeout(PaymentService.getPaymentQRMethod({}))))
      setLoadState(LOAD_STATE.READY)
    } catch (error) {
      // Backend trả NOT_FOUND (reject null) khi hệ thống chưa có phương thức nào: coi như danh sách rỗng; chỉ lỗi mạng mới cho thử lại
      setSystemMethods([])
      setLoadState(error?.message === 'timeout' ? LOAD_STATE.ERROR : LOAD_STATE.READY)
    }
  }, [])

  useEffect(() => {
    if (isPaymentCollection) {
      loadSystemMethods()
    }
  }, [isPaymentCollection, loadSystemMethods])

  const methodList = useMemo(() => {
    const sourceList = isPaymentCollection ? systemMethods : normalizePaymentMethodList(stationPaymentMethods)
    // Đối tác có thể chỉ định 1 loại phương thức qua tham số URL
    return paymentMethodType ? sourceList.filter((item) => item.paymentMethodType == paymentMethodType) : sourceList
  }, [isPaymentCollection, systemMethods, stationPaymentMethods, paymentMethodType])

  // Báo danh sách cho trang cha và chọn sẵn phương thức đầu tiên nếu chưa chọn (hoặc phương thức đang chọn không còn trong danh sách)
  useEffect(() => {
    setListPaymentMethod(Object.fromEntries(methodList.map((item) => [item.paymentMethodId, item])))
    if (!methodList.some((item) => item.paymentMethodId === paymentMethod)) {
      setPaymentMethod(methodList[0]?.paymentMethodId ?? null)
    }
  }, [methodList])

  return (
    <div className="payment-method-selection">
      <h6 className="mb-0">Phương thức thanh toán</h6>
      {methodList.length > 0 && <div className="text-primary">Vui lòng chọn 1 hình thức</div>}

      <div className="mt-3">
        {loadState === LOAD_STATE.LOADING && (
          <div className="text-center py-3">
            <Spin />
          </div>
        )}

        {loadState === LOAD_STATE.ERROR && (
          <div className="text-center py-3">
            <div className="mb-2">Không tải được danh sách phương thức thanh toán.</div>
            <Button onClick={loadSystemMethods}>Thử lại</Button>
          </div>
        )}

        {loadState === LOAD_STATE.READY && methodList.length === 0 && (
          <div className="text-center py-3">Hiện chưa có phương thức thanh toán khả dụng. Vui lòng liên hệ CSKH để được hỗ trợ.</div>
        )}

        {loadState === LOAD_STATE.READY && methodList.length > 0 && (
          <div className="d-flex flex-row gap-3 align-items-center flex-wrap">
            {methodList.map((item) => (
              <div
                key={item.paymentMethodId}
                onClick={() => setPaymentMethod(item.paymentMethodId)}
                className={`payment-method-selection-item py-3 d-flex flex-column align-items-center justify-content-center gap-3 bg-white ${
                  methodList.length === 1 ? 'w-100' : ''
                } ${paymentMethod === item.paymentMethodId ? 'active' : ''}`}>
                <PaymentMethodImage height={item.paymentMethodName === 'ZaloPay' ? 50 : 30} src={item.paymentMethodImageUrl} alt={item.paymentMethodReferName} />
                <div>{item.paymentMethodName?.trim() || item.paymentMethodReferName?.trim() || 'Cổng thanh toán'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentMethodSelection
