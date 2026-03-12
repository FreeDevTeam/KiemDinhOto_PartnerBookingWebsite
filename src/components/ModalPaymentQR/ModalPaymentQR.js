import { Modal } from 'antd'
import Countdown from './../CountDown'
import DefaultButton from './../elements/button'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as ExpiredWarningIcon } from './../../assets/icons/expired-warning.svg'
import { copyToClipboard } from './../../helper/common'
import { CopyOutlined } from '@ant-design/icons'
import LoadingPopup from './../LoadingPopup'
import './index.scss'
import PaymentService from '../../services/paymentService'
import { HOST } from '../../constants/url'
import { useAppParamsContext } from '../../context/AppParamsContext'
import { PAYMENT_TYPE_CODE } from '../PaymentMethodSelection/PaymentMethodSelection'

const ModalPaymentQR = ({ open, onClose, driver, onRefresh, method, paymentMethodFullData }) => {
  const [base64, setBase64] = useState(null)
  const [loading, setLoading] = useState(false)
  const { t: translation } = useTranslation()
  const { totalPay, formatedTotalPay, expiredInMinutes, runTime } = driver

  const [expiredText, setExpiredText] = useState('Mã QR hết hiệu lực sau')
  const { isEmbeddedView } = useAppParamsContext()

  // Lấy thông tin phương thức thanh toán từ prop paymentMethodFullData
  const isShopeePay = paymentMethodFullData?.paymentTypeCode === PAYMENT_TYPE_CODE.SHOPEEPAY

  const onRf = () => {
    setExpiredText('Mã QR hết hiệu lực sau')
    onRefresh()
  }

  const dataQR = (() => {
    if (loading || !method) return null
    return method === 'momo' ? driver?.qr?.momoQR : driver?.qr?.bankQR
  })()

  const convertToBase64 = async (url) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob() // Lấy blob từ response

      const reader = new FileReader()
      reader.onloadend = () => {
        setBase64(reader.result) // Set kết quả base64 vào state
      }
      reader.readAsDataURL(blob) // Đọc blob dưới dạng base64
    } catch (error) {}
  }

  // Xử lý URL ảnh QR code
  const qrUrl = (() => {
    if (!dataQR) return ''
    
    // Support cả qrData (bank) và qrDataURL (momo)
    const qrField = dataQR?.qrDataURL || dataQR?.qrData
    if (!qrField) return ''
    
    // Nếu là base64 string, return ngay
    if (qrField.includes('base64')) {
      return qrField
    }
    
    // Nếu là URL đầy đủ
    if (qrField.startsWith('http')) {
      return qrField
    }
    
    // Nếu là relative path, convert to base64 và return empty string (sẽ dùng base64 state)
    if (method === 'momo' && dataQR?.qrDataURL) {
      convertToBase64(`${HOST}/${qrField}`)
      return ''
    }
    
    // Nếu là relative path, nối với HOST
    return `${HOST}/${qrField}`
  })()
  return (
    <>
      <Modal title="" open={open} centered footer={null} closable={false} className="modal-payment-qr text-center py-3" onClose={onClose}>
        {loading || (!dataQR && !qrUrl && !base64) ? (
          <LoadingPopup type="content" />
        ) : (
          <div className="d-flex flex-column gap-1">
            <div className="modal-payment-qr-header mb-3">
              <h5 className="font-weight-600">Thanh toán</h5>
              <span>
                {isShopeePay
                  ? 'Quét mã QR bằng ứng dụng ShopeePay để thanh toán'
                  : 'Chuyển khoản hoặc quét mã QR để thanh toán qua tất cả Ví và Ngân hàng'}
              </span>
            </div>

            <div className="modal-payment-qr-content d-flex align-items-center flex-column px-3 py-3 bg-white">
              <div>
                {paymentMethodFullData?.paymentMethodImageUrl && (
                  <img src={paymentMethodFullData.paymentMethodImageUrl} width={186} alt="paymentMethodImageUrl" />
                )}
              </div>
              <div className="w-100 d-flex flex-column gap-3 mt-4">
                {!isShopeePay && (
                  <>
                    <div className="d-flex align-items-start justify-content-between gap-1">
                      <span className="modal-payment-qr-content-title">Tên tài khoản</span>
                      <span className="word-break-all text-left w-100">
                        <b>{paymentMethodFullData?.paymentMethodReceiverName}</b>
                      </span>
                    </div>
                    <div className="d-flex align-items-start justify-content-between gap-1">
                      <span className="modal-payment-qr-content-title">Số tài khoản</span>

                      <div className="d-flex align-items-start gap-2 w-100">
                        <span className="word-break-all text-left">
                          <b>{paymentMethodFullData?.paymentMethodIdentityNumber}</b>
                        </span>
                        <CopyOutlined onClick={() => copyToClipboard(paymentMethodFullData?.paymentMethodIdentityNumber)} />
                      </div>
                    </div>
                  </>
                )}
                <div className="d-flex align-items-start justify-content-between gap-1">
                  <span className="modal-payment-qr-content-title">Số tiền</span>
                  <div className="d-flex align-items-start gap-2 w-100">
                    <span className="word-break-all text-primary text-left">
                      <b>{formatedTotalPay}đ</b>
                    </span>
                    <CopyOutlined onClick={() => copyToClipboard(formatedTotalPay)} />
                  </div>
                </div>
                <div className="d-flex align-items-start justify-content-between gap-1">
                  <span className="modal-payment-qr-content-title">Nội dung</span>

                  <div className="d-flex align-items-start gap-2 w-100">
                    <div className="text-left w-100">
                      <div className="word-break-all text-primary text-left mobile-wrap">
                        <b>{dataQR?.paymentContent}</b>
                      </div>
                      <div className="text-danger">Vui lòng ghi đúng nội dung chuyển khoản</div>
                    </div>
                    <CopyOutlined onClick={() => copyToClipboard(dataQR?.paymentContent)} />
                  </div>
                </div>
              </div>

              <div className="hr"></div>

              <div className="modal-payment-qr-footer d-flex align-items-center gap-1 justify-content-center mb-2">
                <ExpiredWarningIcon />
                &nbsp;
                <span className="">{expiredText}</span>
                <span className={`modal-payment-qr-expired-in-countdown`}>
                  <Countdown
                    formater={(time) => {
                      const minutes = Math.floor(time / 60)
                      const seconds = time % 60
                      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

                      return formattedTime
                    }}
                    seconds={expiredInMinutes * 60}
                    event={() => {}}
                    onEnd={() => {
                      setExpiredText('Mã QR hết hiệu lực.')
                      return (
                        <span onClick={onRf} className="text-primary cursor-pointer font-weight-600">
                          Làm mới
                        </span>
                      )
                    }}
                    key={runTime}
                  />
                </span>
              </div>
              <div className="modal-payment-qr-img">
                <img src={qrUrl || base64} alt="QR code" width={186} height={186} />
              </div>
              {!isEmbeddedView && (qrUrl || base64) && (
                <div className="mt-2">
                  <a download={'qrcode.png'} href={qrUrl || base64} target="_blank" rel="noreferrer" className="download-qr py-1 px-3 text-primary">
                    Tải ảnh QR
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4">
              <DefaultButton className="w-100" colorType="dark" title="Đóng" action={onClose} />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default ModalPaymentQR
