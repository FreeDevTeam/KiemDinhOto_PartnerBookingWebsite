import './index.scss'
export default function InfoConsentMode1() {

  return (
    <div className="AutomatedTrafficFineNotificationAuthenticationInfo">
      <img className="AuthenticationInfo_img" src={'/logo.png'} alt="" />
      <div className="AuthenticationInfo_attention">Các dữ liệu sau sẽ được chia sẻ, xử lý với hệ thống tra cứu và thông báo phạt nguội:</div>
      <div className="AuthenticationInfo_carInfo">
      
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
