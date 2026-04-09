import { Spin } from 'antd'
import { useState } from 'react'
import './index.scss'
import { AutomatedTrafficFineNotificationAuthenticationHideInfo, AutomatedTrafficFineNotificationAuthenticationShowInfo } from '../../../assets/icons'

const getDisplayValue = (value, hideInfo) => {
  if (!value?.trim()) return ''
  return hideInfo ? '*********' : value
}

export default function InfoConsentMode2({ sdkUserProfile, isLoading }) {
  const [hideInfo, setHideInfo] = useState(true)
  const hasSdkFullName = !!sdkUserProfile?.fullName?.trim()
  const hasSdkPhoneNumber = !!sdkUserProfile?.phoneNumber?.trim()

  return (
    <div className="InfoConsentMode2">
      <img className="InfoConsentMode2_img" src={'/logo.png'} alt="" />
      <div className="InfoConsentMode2_attention">Các dữ liệu sau sẽ được chia sẻ, xử lý với hệ thống tra cứu và thông báo phạt nguội:</div>
      <div className="InfoConsentMode2_carInfo">
        {isLoading ? (
          <div className="InfoConsentMode2_carInfo_loading">
            <Spin size="small" />
          </div>
        ) : (
          <>
            {(hasSdkFullName || hasSdkPhoneNumber) && (
              <div className="InfoConsentMode2_carInfo_hideInfo" onClick={() => setHideInfo(!hideInfo)}>
                {hideInfo ? <AutomatedTrafficFineNotificationAuthenticationHideInfo /> : <AutomatedTrafficFineNotificationAuthenticationShowInfo />}
                {hideInfo ? (
                  <div className="InfoConsentMode2_carInfo_hideInfo_text">Ẩn thông tin</div>
                ) : (
                  <div className="InfoConsentMode2_carInfo_hideInfo_text">Hiện thông tin</div>
                )}
              </div>
            )}
            <div className="InfoConsentMode2_carInfo_item">
              <div className="InfoConsentMode2_carInfo_item_label">Họ tên</div>

              <div className="InfoConsentMode2_carInfo_item_value">{getDisplayValue(sdkUserProfile.fullName, hideInfo)}</div>
            </div>
            <div className="InfoConsentMode2_carInfo_item">
              <div className="InfoConsentMode2_carInfo_item_label">Số điện thoại</div>

              <div className="InfoConsentMode2_carInfo_item_value">{getDisplayValue(sdkUserProfile.phoneNumber, hideInfo)}</div>
            </div>
          </>
        )}
      </div>
      <div className="InfoConsentMode2_purpose">
        <p className="InfoConsentMode2_purpose_title">Mục đích chia sẻ, xử lý dữ liệu:</p>
        <p className="InfoConsentMode2_purpose_content">
          Các trường thông tin trên được chia sẻ để phục vụ đánh giá và cung cấp các sản phẩm, dịch vụ cho Quý khách.
        </p>
      </div>
    </div>
  )
}
