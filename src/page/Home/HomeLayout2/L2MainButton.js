import React, { useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { FEATURE_CARDS } from '../../../constants/Layout2Constants'
import { PATH } from '../../../constants/router'
import { useGlobalContext } from '../../../context/GlobalContext'
import { buildEmbedUrl } from '../../../components/Popup/EmbedPage'

const L2MainButton = ({ setSheetVisible, setDataBtn }) => {
  const history = useHistory()
  const { handleZaloAuthorize, handleGetUserPhone } = useGlobalContext()
  const featureCardsArray = Object.values(FEATURE_CARDS)
  const isAuthorizingRef = useRef(false)

  const handleRouter = async (path) => {
    // Prevent multiple rapid calls
    if (isAuthorizingRef.current) return
    
    isAuthorizingRef.current = true
    try {
      await handleZaloAuthorize()
      await handleGetUserPhone().then((data) => {
        history.push(path)
      })
    } finally {
      isAuthorizingRef.current = false
    }
  }

  const handleClick = async (card) => {
    const link = card?.link
    if (link) {
      const isZaloLink = link.includes('zalo.me')

      if (isZaloLink) {
        window.open(link, '_blank')
      } else {
        const functionalUrl = buildEmbedUrl(link, card.title)
        history.push(functionalUrl)
      }
    } else {
      await handleRouter(card?.link || card?.linkNavigation)
    }
  }

  return (
    <div className="main-button-feature">
      <div className="feature-cards-container">
        {featureCardsArray.map((card) => (
          <div
            key={card.key}
            className="feature-card"
            onClick={async () => await handleClick(card)}>
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