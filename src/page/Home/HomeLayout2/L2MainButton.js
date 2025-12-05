import React, { useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { FEATURE_CARDS, FEATURE_CARDS_IHANOI } from '../../../constants/Layout2Constants'
import { PATH } from '../../../constants/router'
import { useGlobalContext } from '../../../context/GlobalContext'
import { buildEmbedUrl } from '../../../components/Popup/EmbedPage'
import { openChatScreen } from '../../../helper/zaloSDK'

const isIhaNoi = process.env.REACT_APP_THEME_NAME === 'IHANOI'

const L2MainButton = ({ setSheetVisible, setDataBtn }) => {
  const history = useHistory()
  const { handleZaloAuthorize, handleGetUserPhone } = useGlobalContext()
  const featureCards = isIhaNoi ? FEATURE_CARDS_IHANOI : FEATURE_CARDS
  const featureCardsArray = Object.values(featureCards)
  const isAuthorizingRef = useRef(false)
  const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1

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
    // Handle inspection service selection
    if (card?.key === 'inspection') {
      history.push(PATH.SELECT_INSPECTION_SERVICE)
      return
    }

    // Handle Zalo OpenChat for support card
    if (card?.isZaloOpenchat) {
      if (isZaloApp) {
        // MiniApp: use native openChatScreen
        try {
          await openChatScreen({
            id: process.env.REACT_APP_ZOA_ID,
            message: '',
            type: 'oa'
          })
        } catch (error) {
          console.error('Error opening chat:', error)
        }
      } else {
        // Web: open Zalo deeplink
        const oaId = process.env.REACT_APP_ZOA_ID
        if (oaId) {
          window.open(`https://zalo.me/${oaId}`, '_blank')
        }
      }
      return
    }

    const link = card?.link
    if (link) {
      const isZaloLink = link.includes('zalo.me')

      if (isZaloLink) {
        window.open(link, '_blank')
      } else {
        // Use EmbedPage to display content
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