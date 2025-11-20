import React from 'react'
import { useHistory } from 'react-router-dom'
import { FEATURE_CARDS } from '../../../constants/Layout2Constants'
import { IS_ZALO_MINI_APP } from '../../../constants/global'

const L2MainButton = ({ onButtonClick, setSheetVisible, setDataBtn }) => {
  const history = useHistory()
  const featureCardsArray = Object.values(FEATURE_CARDS)

  const handleClick = (card) => {
    // Sử dụng zmp.navigateTo() cho mini app, history.push() cho web
    if (card.title === 'Đăng kiểm xe') {
      if (IS_ZALO_MINI_APP && window.zmp) {
        window.zmp.navigateTo({
          url: '/booking-service'
        })
      } else {
        // Xử lý cho web hoặc fallback
        history.push('/booking-service')
      }
    } else if (card.title === 'Bảo hiểm xe') {
      // Lấy appUserId từ localStorage
      const appUserId = localStorage.getItem('appUserId') || '1003716'
      const insuranceUrl = `https://affiliate.ttdk.com.vn/AppSharing/BaoHiem?appuserid=${appUserId}`
      
      if (IS_ZALO_MINI_APP && window.zmp) {
        window.zmp.openUrl({
          url: insuranceUrl
        })
      } else {
        window.open(insuranceUrl, '_blank')
      }
    } else if (card.title === 'Phạt nguội') {
      const trafficUrl = `https://ttdk.com.vn/kiemtraphatnguoi?isEmbeddedView=true&isFromPartnerApp=true`
      
      setDataBtn({
        label: "Phạt nguội",
        link: trafficUrl
      })
      setSheetVisible(true)
    } else if (card.title === 'Tư vấn hỗ trợ') {
      const contactHtml = `
        <div class="contact-support-popup">
          <div class="contact-container">
            <div class="contact-title">Liên hệ hỗ trợ</div>
            <div class="contact-info">
              <div>Số điện thoại liên hệ:</div>
              <div class="contact-phone">09xxxxxxxx</div>
            </div>
          </div>
        </div>
      `
      setDataBtn({
        label: 'Tư vấn hỗ trợ',
        link: `data:text/html;charset=utf-8,${encodeURIComponent(contactHtml)}`
      })
      setSheetVisible(true)
    } else {
      if (onButtonClick) {
        onButtonClick(card)
      }
    }
  }

  return (
    <div className="main-button-feature">
      <div className="feature-cards-container">
        {featureCardsArray.map((card) => (
          <div
            key={card.key}
            className="feature-card"
            onClick={() => handleClick(card)}>
            <div className="card-icon">
              {card.icon}
            </div>
            <div className="card-content">
              <div className="card-title">{card.title}</div>
              <div className="card-subtitle">{card.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default L2MainButton