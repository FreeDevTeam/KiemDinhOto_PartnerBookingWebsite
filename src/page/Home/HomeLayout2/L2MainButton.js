import React from 'react'
import { useHistory } from 'react-router-dom'
import { FEATURE_CARDS, BOOKING_LIST_BTN } from '../../../constants/Layout2Constants'
import { PATH } from '../../../constants/router'

const L2MainButton = ({ onSupportClick, setSheetVisible, setDataBtn }) => {
  const history = useHistory()
  const featureCardsArray = Object.values(FEATURE_CARDS)

  const handleClick = (card) => {
    if (card.key === 'inspection') {
      history.push(PATH.BOOKING)
    } else if (card.key === 'insurance') {
      const insuranceItem = BOOKING_LIST_BTN.find(item => item.label === 'Bảo hiểm')
      const insuranceUrl = insuranceItem ? `${insuranceItem.link}` : ''
      setSheetVisible(true)
      setDataBtn({ label: 'Bảo hiểm', link: insuranceUrl, token: insuranceItem?.token })
    } else if (card.key === 'traffic_fine') {
      const trafficItem = BOOKING_LIST_BTN.find(item => item.label === 'Tra cứu <br> phạt nguội')
      const trafficUrl = trafficItem ? `${trafficItem.link}` : ''
      setSheetVisible(true)
      setDataBtn({ label: 'Tra cứu phạt nguội', link: trafficUrl, token: trafficItem?.token })
    } else if (card.key === 'support') {
      if (onSupportClick) {
        onSupportClick();
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