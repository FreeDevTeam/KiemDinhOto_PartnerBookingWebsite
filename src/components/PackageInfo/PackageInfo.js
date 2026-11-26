import React from 'react'
import './index.scss'
import { numberWithSeparator } from '../../helper/numberWithSeparator'
import { ORDER_PAYMENT_STATUS, getItemLogoLabel, getPaymentStatusLabel, getVatPercent } from '../../helper/orderPayment'

const formatMoney = (amount) => `${numberWithSeparator(Number(amount) || 0, ',')}đ`

function getStatusClassName(paymentStatus) {
  if (paymentStatus === ORDER_PAYMENT_STATUS.SUCCESS) return 'package-info-prices-paid'
  if (paymentStatus === ORDER_PAYMENT_STATUS.PROCESSING) return 'package-info-prices-processing'
  return 'package-info-prices-unpaid'
}

const getItemName = (orderItem) => orderItem?.productName || orderItem?.orderItemName || '-'

const getItemImage = (orderItem) => {
  const imageList = orderItem?.productImages
  if (Array.isArray(imageList)) return imageList[0]
  return typeof imageList === 'string' && imageList.startsWith('http') ? imageList : null
}

// Toàn bộ số liệu lấy từ Order / OrderItem do Backend trả về, không tự tính lại
const PackageInfo = ({ orderDetail }) => {
  const orderItems = Array.isArray(orderDetail?.orderItems) ? orderDetail.orderItems : []
  const discountAmount = Number(orderDetail?.discountAmount) || 0
  const vatPercent = getVatPercent(orderDetail)
  // Đơn không có thuế (0đ) thì ẩn dòng VAT và lưu ý xuất hoá đơn
  const hasTax = (Number(orderDetail?.taxAmount) || 0) > 0

  return (
    <div className="package-info">
      <div>
        <h6 className="mb-0">Thông tin đơn hàng</h6>

        <div className="package-info-content p-3 mt-2 bg-white">
          <div className="package-info-services pb-3 d-flex flex-column gap-3">
            {orderItems.map((orderItem, index) => (
              <div className="package-info-services-item d-flex justify-content-between w-100" key={orderItem.orderItemId || index}>
                <div className="d-flex align-items-center gap-2 w-100">
                  <div className="d-flex align-items-center justify-content-center package-info-services-icon px-1">
                    {getItemImage(orderItem) ? (
                      <img src={getItemImage(orderItem)} className="h-100 w-100" style={{ objectFit: 'contain' }} alt="" />
                    ) : (
                      <span>
                        <b>
                          <small>{getItemLogoLabel(getItemName(orderItem))}</small>
                        </b>
                      </span>
                    )}
                  </div>
                  <div className="d-flex flex-column gap-2 w-100">
                    <span>
                      <b>{getItemName(orderItem)}</b>
                    </span>
                    <div className="d-flex w-100 justify-content-between">
                      <span>{orderItem.productPrice ? formatMoney(orderItem.productPrice) : 'Miễn phí'}</span>
                      <span>SL: {orderItem.quantity || 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="package-info-prices py-3">
            <div className="d-flex w-100 justify-content-between align-items-center pb-3">
              <span>Tổng tiền hàng</span>
              <span>
                <b>{formatMoney((Number(orderDetail?.subTotalAmount) || 0) + discountAmount)}</b>
              </span>
            </div>
            <div className="d-flex w-100 justify-content-between align-items-center">
              <span>Mã giảm giá</span>
              <span>
                <b>{discountAmount > 0 ? `-${formatMoney(discountAmount)}` : 'Chưa sử dụng'}</b>
              </span>
            </div>
          </div>

          <div className="package-info-prices py-3">
            <div className={`d-flex w-100 justify-content-between align-items-center ${hasTax ? 'pb-3' : ''}`}>
              <span>Tạm tính</span>
              <span>
                <b>{formatMoney(orderDetail?.subTotalAmount)}</b>
              </span>
            </div>
            {hasTax && (
              <>
                <div className="d-flex w-100 justify-content-between align-items-center">
                  <span>Thuế VAT{vatPercent ? ` (${vatPercent}%)` : ''}</span>
                  <span>
                    <b>{formatMoney(orderDetail?.taxAmount)}</b>
                  </span>
                </div>
                <span className="package-info-prices-invoice-tips">
                  <small>
                    <i>Vui lòng liên hệ CSKH nếu cần xuất Hoá đơn GTGT.</i>
                  </small>
                </span>
              </>
            )}
          </div>

          <div className="package-info-prices py-3">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <span>Tổng thanh toán</span>
              <span className="text-blue-ribbon">
                <b>{formatMoney(orderDetail?.totalAmount)}</b>
              </span>
            </div>
          </div>

          <div className="package-info-prices py-3">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <span>Trạng thái</span>
              <span className={getStatusClassName(orderDetail?.paymentStatus)}>{getPaymentStatusLabel(orderDetail?.paymentStatus)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackageInfo
