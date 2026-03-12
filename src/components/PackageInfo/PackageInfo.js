import React from 'react'
import './index.scss'
import { numberWithSeparator } from '../../helper/numberWithSeparator'

const PackageInfo = ({ services, totalPrice, totalPay, totalTax, tax, isPaymentSuccess }) => {
  return (
    <div className="package-info">
      <div>
        <h6 className="mb-0">Thông tin dịch vụ</h6>

        <div className="package-info-content p-3 mt-2 bg-white">
          <div className="package-info-services pb-3 d-flex flex-column gap-3">
            {services.map((sv) => (
              <div className="package-info-services-item d-flex justify-content-between w-100" key={sv.productId}>
                <div className="d-flex align-items-center gap-2 w-100">
                  {/* logo sản phẩm không hiển thị trên trang thanh toán */}
                  {/* <div className="d-flex align-items-center justify-content-center package-info-services-icon px-1">
                    <span>
                      <b>
                        <small>{sv.orderItemName}</small>
                      </b>
                    </span>
                  </div> */}
                  <div className="d-flex flex-column gap-2 w-100">
                    <span>
                      <b>{sv.orderItemName}</b>
                    </span>
                    <div className="d-flex w-100 justify-content-between">
                      <span>{sv.productPrice ? `${numberWithSeparator(sv.productPrice)}đ` : 'Miễn phí'}</span>
                      <span>SL: {sv.quantity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="package-info-prices py-3">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <span>Tổng đơn hàng</span>
              <span>
                <b>{totalPrice}đ</b>
              </span>
            </div>
            <div className="mt-1">
              <span className="package-info-prices-invoice-tips">
                <small>
                  <i>Vui lòng liên hệ CSKH nếu cần xuất Hoá đơn GTGT.</i>
                </small>
              </span>
            </div>
          </div>

          <div className="package-info-prices py-3">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <span>Tổng thanh toán</span>
              <span className="text-blue-ribbon">
                <b>{totalPay}đ</b>
              </span>
            </div>
          </div>

          <div className="package-info-prices py-3">
            <div className="d-flex w-100 justify-content-between align-items-center">
              <span>Trạng thái</span>
              <span className={`package-info-prices-${isPaymentSuccess ? 'paid' : 'unpaid'}`}>
                {isPaymentSuccess ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackageInfo
