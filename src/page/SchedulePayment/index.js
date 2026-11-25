import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Alert, Button, Checkbox, Result, Spin } from 'antd'
import './index.scss'
import Header from '../../components/Header'
import DefaultButton from '../../components/elements/button'
import ModalPaymentQR from '../../components/ModalPaymentQR/ModalPaymentQR'
import PackageInfo from '../../components/PackageInfo/PackageInfo'
import PaymentMethodSelection, { PAYMENT_TYPE } from '../../components/PaymentMethodSelection/PaymentMethodSelection'
import useOrderPayment, { ORDER_LOAD_STATE } from '../../hooks/useOrderPayment'
import { ORDER_PAYMENT_STATUS, ORDER_STATUS_CANCELED, getOrderIdFromSearch, isPaymentCollectionFromSearch } from '../../helper/orderPayment'
import { numberWithSeparator } from '../../helper/numberWithSeparator'
import { PATH } from '../../constants/router'

const PAGE_TITLE = 'Chi tiết thanh toán đơn hàng'

// Chi tiết đơn hàng của đặt lịch có dịch vụ thu tiền trước. Dùng chung cho mọi dịch vụ: nội dung đơn lấy từ OrderItem của Backend.
const SchedulePayment = () => {
  const history = useHistory()
  const location = useLocation()
  const orderId = getOrderIdFromSearch(location.search)
  const isPaymentCollection = isPaymentCollectionFromSearch(location.search)
  const payment = useOrderPayment(orderId)
  const { orderLoadState, orderDetail } = payment

  const [paymentMethod, setPaymentMethod] = useState(null)
  const [listPaymentMethod, setListPaymentMethod] = useState({})
  const [confirmTerm, setConfirmTerm] = useState(false)

  const selectedMethod = listPaymentMethod?.[paymentMethod] || null
  const totalPay = Number(orderDetail?.totalAmount) || 0
  const isPayDisabled = !selectedMethod || !confirmTerm || payment.isSubmitting || totalPay <= 0
  const handleGoBack = () => (history.length > 1 ? history.goBack() : history.push(PATH.HOME))

  const renderBody = () => {
    if (orderLoadState === ORDER_LOAD_STATE.LOADING) {
      return (
        <div className="text-center py-5">
          <Spin size="large" />
        </div>
      )
    }
    if (orderLoadState === ORDER_LOAD_STATE.INVALID) {
      return <Result status="warning" title="Không tìm thấy đơn hàng" subTitle="Đơn hàng không hợp lệ hoặc đã hết hạn." extra={<Button onClick={handleGoBack}>Quay lại</Button>} />
    }
    if (orderLoadState === ORDER_LOAD_STATE.ERROR) {
      return <Result status="error" title="Không tải được đơn hàng" subTitle="Vui lòng kiểm tra kết nối và thử lại." extra={<Button type="primary" onClick={payment.reloadOrder}>Thử lại</Button>} />
    }

    const paymentStatus = orderDetail.paymentStatus
    const isSuccess = paymentStatus === ORDER_PAYMENT_STATUS.SUCCESS
    const isCanceled = paymentStatus === ORDER_PAYMENT_STATUS.CANCELED || orderDetail.orderStatus === ORDER_STATUS_CANCELED

    return (
      <>
        {isSuccess && (
          <Alert
            type="success"
            showIcon
            message="Thanh toán thành công"
            description={orderDetail.customerScheduleId ? 'Lịch hẹn của quý khách đã được tạo.' : 'Hệ thống đang tạo lịch hẹn cho quý khách. Vui lòng kiểm tra lại sau ít phút.'}
          />
        )}
        {paymentStatus === ORDER_PAYMENT_STATUS.FAILED && <Alert type="error" showIcon message="Thanh toán thất bại" description="Quý khách có thể chọn phương thức thanh toán và thử lại." />}
        {isCanceled && <Alert type="warning" showIcon message="Đơn hàng đã hủy" description="Đơn hàng không còn hiệu lực. Lịch hẹn chưa được tạo." />}
        {payment.paymentError && <Alert type="error" showIcon closable onClose={payment.clearPaymentError} message={payment.paymentError} />}

        <PackageInfo orderDetail={orderDetail} />

        {payment.isPayable && (
          <PaymentMethodSelection
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setListPaymentMethod={setListPaymentMethod}
            isPaymentCollection={isPaymentCollection}
            stationPaymentMethods={orderDetail.availablePaymentMethods}
          />
        )}

        <div className="secure-banner">MỌI THÔNG TIN ĐỀU ĐƯỢC BẢO MẬT THEO QUY ĐỊNH CỦA PHÁP LUẬT</div>
      </>
    )
  }

  const canShowPayFooter = orderLoadState === ORDER_LOAD_STATE.READY && payment.isPayable

  return (
    <div className="schedule-payment-container">
      <div className="schedule-payment-mobile-wrap h-100">
        <Header title={PAGE_TITLE} onBack={handleGoBack} />
        <div className="schedule-payment-body d-flex flex-column gap-4">{renderBody()}</div>

        {canShowPayFooter && (
          <div className="payment-footer bg-white">
            <div className="mb-3">
              <Checkbox checked={confirmTerm} disabled={payment.isSubmitting} onChange={() => setConfirmTerm(!confirmTerm)}>
                <div className="confirm-payment">
                  Tôi đã đọc và đồng ý với <b className="text-primary">Điều khoản thanh toán</b> (Mọi thông tin đều được bảo mật theo pháp luật).
                </div>
              </Checkbox>
            </div>

            <div className="d-flex flex-row align-items-center justify-content-between payment-footer-row">
              <div className="total-price">
                <span>Tổng đơn hàng</span>
                <span className="total-price-number">
                  <b>{numberWithSeparator(totalPay, ',')}đ</b>
                </span>
              </div>

              <div className="footer-actions">
                <DefaultButton
                  width={'65%'}
                  colorType={isPayDisabled ? 'light' : 'dark'}
                  className={`${isPayDisabled ? 'disabled' : ''}`}
                  title="Thanh toán"
                  action={() => payment.handlePay(selectedMethod)}
                  disabled={isPayDisabled}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {payment.qrInfo && (
        <ModalPaymentQR
          open={!!payment.qrInfo}
          onClose={payment.closeQr}
          driver={{
            totalPay: payment.qrInfo.totalAmount,
            formatedTotalPay: numberWithSeparator(payment.qrInfo.totalAmount, ','),
            qr: { bankQR: payment.qrInfo.bankQR, momoQR: payment.qrInfo.momoQR },
            expiredInMinutes: payment.qrInfo.bankQR?.expiredInMinutes || payment.qrInfo.momoQR?.expiredInMinutes || 5,
            runTime: payment.qrInfo.runTime
          }}
          onRefresh={() => payment.handlePay(payment.qrInfo.paymentMethod)}
          method={payment.qrInfo.paymentMethod?.paymentMethodType === PAYMENT_TYPE.MOMO_BANK ? 'momo' : 'bank'}
          paymentMethodFullData={payment.qrInfo.paymentMethod}
        />
      )}
    </div>
  )
}

export default SchedulePayment
