import { Modal, Button } from 'antd'
import { ReactComponent as SuccessIcon } from './../../assets/icons/success.svg'
import './index.scss'
import { SCHEDULE_TYPE } from '../../constants/serviceOption'
import { useAppParamsContext } from '../../context/AppParamsContext'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
const BookingSuccess = ({ isModalOpen, onClose, setIsModalOpen, scheduleType, paymentData, isPaymentPage, message, onOpenExternalPayment, isEnablePaymentBookingService }) => {
  const consultantTypes = [
    SCHEDULE_TYPE.CONSULTANT_MAINTENANCE,
    SCHEDULE_TYPE.CONSULTANT_INSURANCE,
    SCHEDULE_TYPE.CONSULTANT_RENOVATION,
    SCHEDULE_TYPE.VEHICLE_INSPECTION_CONSULTATION,
    SCHEDULE_TYPE.TRAFFIC_FINE_CONSULTATION,
    SCHEDULE_TYPE.CONSULTANT_TNDS_INSURANCE,
  ]
  const isConsultantType = consultantTypes.includes(scheduleType)
  const { isWebView, checkUrlParamSaveContext } = useAppParamsContext()
  const location = useLocation()
  useEffect(() => {
    checkUrlParamSaveContext('isWebView')
  }, [checkUrlParamSaveContext, location.search])
  

  // Xử lý nút thanh toán online
  const handleGoToPayment = () => {
    if (!paymentData || typeof onOpenExternalPayment !== 'function') return
    onOpenExternalPayment(paymentData)
    setIsModalOpen(false)
  }

  const isTicketSale = scheduleType === SCHEDULE_TYPE.E_TICKET_SALE
  const isPaymentFlow = (paymentData?.schedulingType === 'ONLINE_PAYMENT' || paymentData?.schedulingType === 'PREPAY') && (isEnablePaymentBookingService || isTicketSale)
  const canOpenPayment = typeof onOpenExternalPayment === 'function' && (isEnablePaymentBookingService || isTicketSale)

  // Nếu là trang thanh toán, khi đóng modal sẽ gọi onClose để về trang đặt lịch
  const handleModalClose = () => {
    if (isPaymentPage && typeof onClose === 'function') {
      onClose()
    } else if (typeof onClose === 'function') {
      onClose()
    }
  }

  return (
    <Modal title="" visible={isModalOpen} footer={null} closable={false} className="text-center" onCancel={handleModalClose}>
      <div className={'register app-container'} style={{ maxWidth: 600, margin: 'auto', padding:15}}>
        <div className="register-success text-center">
          <SuccessIcon className={'text-center'} />
          <div className='mb-4'>
            <div className="mb-2">
              <div className='title-normal text-uppercase m-2'>
                {message ? message : 'Đặt lịch thành công'}
              </div>
            </div>
            <div>Thông tin đã được chuyển đến tư vấn viên của chúng tôi. Nhân viên tư vấn sẽ sớm liên hệ lại để hỗ trợ tư vấn cho bạn.</div>
          </div>
          <div>
            {isConsultantType && !(isWebView) && (
              <>
            <p style={{ margin: '15px 0' }}>
                Bạn có thể tham khảo thông tin tại các nhóm, cộng đồng để có câu trả lời nhanh hơn
                </p>
                <Button 
                    type="primary" 
                    block
                    onClick={() => window.open('https://www.facebook.com/groups/940007330455923', '_blank')}
                    style={{ color:'white' }}
                    className='login__button df'
                >
                  Tham gia cộng đồng đăng kiểm
              </Button>
              </>
            )}
            {isPaymentFlow && canOpenPayment && (
              <Button 
                className="login__button df" 
                onClick={handleGoToPayment} 
                type="primary" 
                htmlType="submit" 
                size="large"
                style={{ marginBottom: '10px' }}
              >
                Thanh toán Online
              </Button>
            )}
            <Button className="login__button df" onClick={handleModalClose} type="primary" htmlType="submit" size="large">
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default BookingSuccess
