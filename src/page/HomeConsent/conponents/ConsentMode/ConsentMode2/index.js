import { useState } from 'react'
import './index.scss'
import { AutomatedTrafficFineNotificationAuthenticationHideInfo, AutomatedTrafficFineNotificationAuthenticationShowInfo } from '../../../assets/icons'
export default function AutomatedTrafficFineNotificationAuthenticationInfo() {
  const [hideInfo, setHideInfo] = useState(true)
  return (
    <div className="AutomatedTrafficFineNotificationAuthenticationInfo">
      <img className="AuthenticationInfo_img" src={'/logoFull.png'} alt="" />
      <div className="AuthenticationInfo_attention">Các dữ liệu sau sẽ được chia sẻ, xử lý với hệ thống tra cứu và thông báo phạt nguội:</div>
      <div className="AuthenticationInfo_carInfo">
        <div className="AuthenticationInfo_carInfo_hideInfo" onClick={() => setHideInfo(!hideInfo)}>
          {hideInfo ? <AutomatedTrafficFineNotificationAuthenticationHideInfo /> : <AutomatedTrafficFineNotificationAuthenticationShowInfo />}
          {hideInfo ? (
            <div className="AuthenticationInfo_carInfo_hideInfo_text">Ẩn thông tin</div>
          ) : (
            <div className="AuthenticationInfo_carInfo_hideInfo_text">Hiện thông tin</div>
          )}
        </div>
        <div className="AuthenticationInfo_carInfo_item">
          <div className="AuthenticationInfo_carInfo_item_label">Họ tên</div>
          <div className="AuthenticationInfo_carInfo_item_value">{hideInfo ? '*********' : 'Nguyễn Văn A'}</div>
        </div>
        <div className="AuthenticationInfo_carInfo_item">
          <div className="AuthenticationInfo_carInfo_item_label">Số điện thoại</div>
          <div className="AuthenticationInfo_carInfo_item_value">{hideInfo ? '*********' : '0123456789'}</div>
        </div>
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
