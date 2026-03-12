import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useLocation, Link } from 'react-router-dom'
import { Checkbox, Modal } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, RightOutlined } from '@ant-design/icons'
import BookingSuccessModal from '../BookingPartner/BookingSuccessModal'
import './index.scss'
import ModalPaymentQR from '../../components/ModalPaymentQR/ModalPaymentQR'
import DefaultButton from '../../components/elements/button'
import PackageInfo from '../../components/PackageInfo/PackageInfo'
import PaymentMethodSelection from '../../components/PaymentMethodSelection/PaymentMethodSelection'
import PaymentService from '../../services/paymentService'
import BookingService from '../../services/addBookingService'
import { HOST } from '../../constants/url'
import { numberWithSeparator } from '../../helper/numberWithSeparator'

const SchedulePayment = () => {
  // 🔷 CASE B: Có customerScheduleId nhưng chưa có orderId
  //    → Auto-create order từ scheduleData
  // 🔷 CASE C: Có orderId rồi
  //    → Skip auto-create, user chọn payment method & thanh toán
  
  const history = useHistory()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [paymentQRData, setPaymentQRData] = useState(null)
  const [confirmTerm, setConfirmTerm] = useState(false)
  const [listPaymentMethod, setListPaymentMethod] = useState({})
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const pollingIntervalRef = useRef(null)
  const pollingCountRef = useRef(0)
  const caseBProcessedRef = useRef(false)

  const locationState = location.state || {}
  const { customerScheduleId, orderId, schedulingType, scheduleData = {}, serviceData = {} } = locationState

  const enabledPaymentMethods = Object.values(listPaymentMethod || {}).filter((item) => item?.paymentMethodEnable === 1)
  const paymentMethodsLoaded = enabledPaymentMethods.length > 0

  useEffect(() => {
    if (!orderId && !customerScheduleId) {
      history.goBack()
    }
  }, [orderId, customerScheduleId, history])

  useEffect(() => {
    if (showPaymentModal && paymentQRData?.orderId) {
      startPolling(paymentQRData.orderId)
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [showPaymentModal, paymentQRData?.orderId])

    const startPolling = (orderIdValue) => {
      const maxAttempts = 100;
      pollingCountRef.current = 0;

      const pollPaymentStatus = async () => {
        try {
          pollingCountRef.current += 1;
          const result = await PaymentService.checkOrderStatus(orderIdValue);

          if (result?.paymentStatus === 'Success') {
            stopPolling();
            setShowPaymentModal(false);
            setTimeout(() => {
              const caseType = schedulingType === 'PREPAY' ? 'CASE_C' : 'CASE_B';
              setSuccessMessage(caseType === 'CASE_C' ? 'Dat lich thanh toan thanh cong' : 'Thanh toan thanh cong');
              setShowSuccessModal(true);
            }, 500);
            return;
          }

          if (pollingCountRef.current >= maxAttempts) {
            stopPolling();
          }
        } catch (error) {
          // Polling error
        }
      };

      pollPaymentStatus();
      pollingIntervalRef.current = setInterval(() => {
        if (showPaymentModal) {
          pollPaymentStatus();
        }
      }, 5000);
    };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    pollingCountRef.current = 0
  }


  const handleContinuePayment = async () => {
    if (!paymentMethod) {
      return
    }

    if (!confirmTerm) {
      return
    }

    const finalOrderId = currentOrderId || orderId
    if (!finalOrderId) {
      return
    }

    await handleGenerateQRCode(finalOrderId)
  }

  const handleGenerateQRCode = async (useOrderId) => {
    setIsLoading(true)
    try {
      const finalOrderId = useOrderId || currentOrderId || orderId

      const selectedMethod = listPaymentMethod?.[paymentMethod]

      if (!finalOrderId) {
        setIsLoading(false)
        return
      }

      const paymentPayload = {
        customerScheduleId: finalOrderId,
        paymentMethodType: selectedMethod?.paymentMethodType,
        paymentMethodId: selectedMethod?.paymentMethodId
      }

      const paymentResult = await PaymentService.createPayment(paymentPayload)

      if (!paymentResult?.isSuccess) {
        setIsLoading(false)
        return
      }

      // API response structure: { customerScheduleId, isSuccess, bankQR, momoQR, paymentLinkUrl, ... }
      const responseData = paymentResult || {}

      // Nếu có paymentLinkUrl (Zalopay, ShopeePay, v.v.), mở link trực tiếp
      if (responseData.paymentLinkUrl) {
        window.open(responseData.paymentLinkUrl, '_blank')
        setIsLoading(false)
        // Bắt đầu polling để kiểm tra trạng thái thanh toán
        startPolling(finalOrderId)
        return
      }

      // Map lại object phương thức thanh toán theo paymentMethodId từ response
      let paymentMethodFullData = selectedMethod
      if (responseData?.paymentMethodId) {
        paymentMethodFullData = Object.values(listPaymentMethod).find(
          (item) => item.paymentMethodId === responseData.paymentMethodId
        ) || selectedMethod
      }

      // Nếu không có paymentLinkUrl, mới show QR modal
      const response = {
        totalPay: serviceData.servicePrice || 0,
        formatedTotalPay: (serviceData.servicePrice || 0).toLocaleString('vi-VN'),
        qr: {
          bankQR: responseData.bankQR || null,
          momoQR: responseData.momoQR || null
        },
        expiredInMinutes: (responseData.bankQR?.expiredInMinutes || responseData.momoQR?.expiredInMinutes || 5),
        runTime: Date.now(),
        paymentMethod: selectedMethod,
        paymentMethodFullData,
        orderId: finalOrderId
      }

      setPaymentQRData(response)
      setShowPaymentModal(true)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const handleRefreshQR = () => {
    const useOrderId = paymentQRData?.orderId || currentOrderId || orderId
    if (useOrderId) {
      handleGenerateQRCode(useOrderId)
    }
  }

  const handlePaymentModalClose = () => {
    // Không show message khi đóng modal
  }

  const handleBackToBooking = () => {
    setShowSuccessModal(false)
    setTimeout(() => {
      history.replace('/')
    }, 300)
  }

  const handleGoBack = () => {
    history.goBack()
  }

  // --- HELPER: Lấy giá và tên mục đích đặt lịch từ metadata ---
  const getScheduleTypeInfo = () => {
    try {
      const cachedMetaDataStr = localStorage.getItem('PARTNER_DEB_V5_api_cache_meta_data')
      if (!cachedMetaDataStr) return { price: 0, name: '' }
      
      const cacheData = JSON.parse(cachedMetaDataStr)
      const scheduleTypes = cacheData?.data?.data?.SCHEDULE_TYPE || {}
      
      // Tìm scheduleType object dựa trên scheduleData.scheduleType
      const currentScheduleTypeId = scheduleData?.scheduleType
      for (const key in scheduleTypes) {
        const scheduleTypeObj = scheduleTypes[key]
        if (scheduleTypeObj?.scheduleType === currentScheduleTypeId) {
          return {
            price: scheduleTypeObj?.price || 0,
            name: scheduleTypeObj?.scheduleTypeName || ''
          }
        }
      }
      return { price: 0, name: '' }
    } catch (error) {
      return { price: 0, name: '' }
    }
  }

  const mainServicePrice = serviceData.servicePrice || 0
  const scheduleTypeInfo = getScheduleTypeInfo()
  const bookingPurposePrice = (scheduleData?.price && scheduleData.price > 0) ? scheduleData.price : scheduleTypeInfo.price

  const packageServices = [
    {
      productId: serviceData.stationServicesList?.[0] || 'service-1',
      orderItemName: serviceData.serviceName || 'Kiem dinh xe',
      productPrice: mainServicePrice,
      quantity: 1
    },
    ...(bookingPurposePrice > 0
      ? [{
          productId: 'booking-purpose',
          orderItemName: scheduleTypeInfo.name,
          productPrice: bookingPurposePrice,
          quantity: 1
        }]
      : [])
  ]

  const totalServicePrice = mainServicePrice + bookingPurposePrice
  const totalPay = totalServicePrice

  const formatedTotalPrice = numberWithSeparator(totalServicePrice)
  const formatedTotalPay = numberWithSeparator(totalPay)
  const isPayDisabled = !paymentMethod || !confirmTerm || isLoading

  return (
    <div className="schedule-payment-container">
      <div className="schedule-payment-mobile-wrap h-100">
        <div className="schedule-payment-header">
          <button type="button" className="header-back-btn" onClick={handleGoBack}>
            <ArrowLeftOutlined />
          </button>
          <h1>Thanh toán lịch hẹn</h1>
        </div>

        <div className="schedule-payment-body d-flex flex-column gap-4">
          <PackageInfo
            services={packageServices}
            totalPrice={formatedTotalPrice}
            totalPay={formatedTotalPay}
            isPaymentSuccess={false}
          />

          <PaymentMethodSelection
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setListPaymentMethod={setListPaymentMethod}
          />

          <div className="secure-banner">MỌI THÔNG TIN ĐỀU ĐƯỢC BẢO MẬT THEO QUY ĐỊNH CỦA PHÁP LUẬT</div>
        </div>

        <div className="payment-footer bg-white">
          <div className="mb-3">
            <Checkbox checked={confirmTerm} onChange={() => setConfirmTerm(!confirmTerm)}>
              <div className="confirm-payment">
                Tôi xác nhận đã đọc và đồng ý với <Link to="/payment-policy">điều khoản thanh toán</Link>.
              </div>
            </Checkbox>
          </div>

          <div className="d-flex flex-row align-items-center justify-content-between payment-footer-row">
            <div className="total-price">
              <span>Tổng thanh toán</span>
              <span className="total-price-number">
                <b>{numberWithSeparator(totalPay)}đ</b>
              </span>
            </div>

            <div className="footer-actions">
              <DefaultButton
                width={'65%'}
                colorType={isPayDisabled ? 'light' : 'dark'}
                className={`${isPayDisabled ? 'disabled' : ''}`}
                title="Thanh toán"
                action={handleContinuePayment}
                disabled={isPayDisabled}
              />
            </div>
          </div>
        </div>
      </div>


      {showPaymentModal && paymentQRData && (
        <ModalPaymentQR
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          driver={paymentQRData}
          onRefresh={handleRefreshQR}
          method={paymentMethod}
          paymentMethodFullData={paymentQRData?.paymentMethodFullData}
        />
      )}
      

      <BookingSuccessModal
        isModalOpen={showSuccessModal}
        onClose={handleBackToBooking}
        isPaymentPage={true}
      />
    </div>
  )
}

export default SchedulePayment
