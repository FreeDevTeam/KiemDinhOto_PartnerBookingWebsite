import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { IS_ZALO_MINI_APP } from '../../../constants/global'
import { ReactComponent as DangKiemXeDinhKyIcon } from '../../../assets/Layout2Icons/L2dkxdk.svg'
import { ReactComponent as DangKiemXeMoiIcon } from '../../../assets/Layout2Icons/L2dkxm.svg'
import { ReactComponent as DangKiemXeCuIcon } from '../../../assets/Layout2Icons/L2dkxc.svg'
import PopupContactInfo from '../../../components/Popup/PopupContactInfo'
import '../index.scss'

const BookingService = () => {
  const history = useHistory()
  const location = useLocation()
  const [showContactPopup, setShowContactPopup] = useState(false)

  const bookingOptions = [
    {
      id: 1,
      label: 'Đăng kiểm xe định kỳ',
      description: 'Dành cho khách hàng đặt lịch để đăng kiểm các xe đã đăng kiểm trước đây',
      link: '/booking?scheduleType=1',
      icon: <DangKiemXeDinhKyIcon />
    },
    {
      id: 2,
      label: 'Thay đổi thông tin xe',
      description: 'Dành cho khách hàng muốn đổi mục đích sử dụng phương tiện, hoặc đổi thông tin chủ sở hữu xe, biển số xe',
      link: '/booking?scheduleType=4',
      icon: <DangKiemXeCuIcon />
    },
    {
      id: 3,
      label: 'Đăng ký hồ sơ xe mới',
      description: 'Dành cho khách hàng đặt lịch nộp hồ sơ xe mới, không mang xe đến đăng kiểm',
      link: '/booking?scheduleType=3',
      icon: <DangKiemXeMoiIcon />
    }
  ]

  const handleBookingClick = (scheduleLink) => {
    if (IS_ZALO_MINI_APP && window.zmp) {
      window.zmp.navigateTo({ url: scheduleLink })
    } else {
      history.push(scheduleLink)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', paddingLeft: 15, paddingRight: 15, paddingBottom: 160 }}>
      <div className="booking-service-page">
        <div className="login__title__text" style={{ margin: '40px auto 12px', textAlign: 'center', fontSize: 22, fontWeight: 300, color: 'var(--primary-color)' }}>
          Đặt lịch hẹn
        </div>
        <div style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: 30, fontSize: 24, fontWeight: 1000 }}>
          VUI LÒNG CHỌN DỊCH VỤ ĐĂNG KIỂM
        </div>

        <div className="booking-service">
          {bookingOptions.map((option) => (
            <div key={option.id} className="booking-service-item" onClick={() => handleBookingClick(option.link)}>
              <div className="content-left">{option.icon}</div>
              <div className="content-right">
                <div className="title">{option.label}</div>
                <div className="subTitle">{option.description}</div>
              </div>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
          
          <div className="booking-service-item" onClick={() => setShowContactPopup(true)}>
            <div className="content-left">
              <svg width="59" height="59" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="29.5" cy="29.5" r="28.5" fill="var(--primary-color)" opacity="0.1"/>
                <path d="M29 18C23.48 18 19 22.48 19 28C19 32.5 21.5 36.3 25.5 38.2V44L29 42L32.5 44V38.2C36.5 36.3 39 32.5 39 28C39 22.48 34.52 18 29 18Z" fill="var(--primary-color)"/>
              </svg>
            </div>
            <div className="content-right">
              <div className="title">Tư vấn hỗ trợ</div>
              <div className="subTitle">Liên hệ trực tiếp với đội hỗ trợ khách hàng</div>
            </div>
            <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <PopupContactInfo visible={showContactPopup} onClose={() => setShowContactPopup(false)} phoneNumber="09xxxxxxxx" />
    </div>
  )
}

export default BookingService
