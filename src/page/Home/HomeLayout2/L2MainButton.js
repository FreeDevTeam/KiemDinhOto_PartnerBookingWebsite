import React from 'react'
import { useHistory } from 'react-router-dom'
import { FEATURE_CARDS } from '../../../constants/Layout2Constants'
import { PATH } from '../../../constants/router'

const L2MainButton = ({ setSheetVisible, setDataBtn }) => {
  const history = useHistory()
  const featureCardsArray = Object.values(FEATURE_CARDS)

  const handleClick = (card) => {
    if (card.key === 'inspection') {
      history.push(PATH.BOOKING);
    } else if (card.link) {
      if (card.link.startsWith('https')) {
        history.push(`${PATH.FUNCTIONAL}?url=${encodeURIComponent(card.link)}&title=${encodeURIComponent(card.title)}`);
      } else {
        history.push(card.link);
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