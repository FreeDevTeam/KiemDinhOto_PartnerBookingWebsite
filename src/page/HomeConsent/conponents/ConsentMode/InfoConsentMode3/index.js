import { Input, Spin } from 'antd'
import './index.scss'

export default function InfoConsentMode3({ consentUserProfile, isLoading, onChangePhoneNumber, onChangeFullName }) {
  return (
    <div className="AutomatedTrafficFineNotificationAuthenticationInfo">
      <img className="AuthenticationInfo_img" src={'/logoFull.png'} alt="" />
      <div className="AuthenticationInfo_attention">Các dữ liệu sau sẽ được chia sẻ, xử lý với hệ thống tra cứu và thông báo phạt nguội:</div>
      <div className="AuthenticationInfo_carInfo">
        {isLoading ? (
          <div className="AuthenticationInfo_carInfo_loading">
            <Spin size="small" />
          </div>
        ) : (
          <>
            <div className="AuthenticationInfo_carInfo_item">
              <div className="AuthenticationInfo_carInfo_item_label">Họ tên</div>
              <Input
                className="AuthenticationInfo_carInfo_item_input"
                placeholder="Nhập họ tên"
                value={consentUserProfile?.fullName || ''}
                onChange={(event) => onChangeFullName?.(event.target.value)}
              />
            </div>
            <div className="AuthenticationInfo_carInfo_item">
              <div className="AuthenticationInfo_carInfo_item_label">Số điện thoại</div>
              <Input
                className="AuthenticationInfo_carInfo_item_input"
                placeholder="Nhập số điện thoại"
                value={consentUserProfile?.phoneNumber || ''}
                onChange={(event) => onChangePhoneNumber?.(event.target.value)}
              />
            </div>
          </>
        )}
      </div>
      <div className="AuthenticationInfo_purpose">
        <p className="AuthenticationInfo_purpose_title">Mục đích chia sẻ, xử lý dữ liệu:</p>
        <p className="AuthenticationInfo_purpose_content">
          Các trường thông tin trên được chia sẻ để phục vụ đánh giá và cung cấp các sản phẩm, dịch vụ cho Quý khách.
        </p>
      </div>
    </div>
  )
}
