import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useHistory } from 'react-router-dom'
import { useGlobalContext } from '../../context/GlobalContext'
import './index.scss'
import { handleDirect } from '../Slider/SliderHome'
import { useConsentContext } from '../../context/ConsentContext'
import { Spin } from 'antd'

const MainButton = ({ setSheetVisible, setDataBtn, list, title, className }) => {
  const history = useHistory()
  const { handleZaloAuthorize, globalState } = useGlobalContext()
  const { buildConsentHref } = useConsentContext()
  const isAuthorizingRef = useRef(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showNavigating, setShowNavigating] = useState(false)
  const navigatingTimerRef = useRef(null)

  const handleRouter = async (path) => {
    if(isAuthorizingRef.current) return
    isAuthorizingRef.current = true
    try {
      await handleZaloAuthorize()
      history.push(path)
    } finally {
      isAuthorizingRef.current = false
    }
  }

  const handleClick = async (element) => {
    if (isNavigating) return
    if(isAuthorizingRef.current) return
    isAuthorizingRef.current = true
    try {
      await handleZaloAuthorize()
      const link = element?.linkNavigation

      const isZaloLink = link.includes('zalo.me')
      if (link) {
        setIsNavigating(true)
        navigatingTimerRef.current = setTimeout(() => {
          setShowNavigating(true)
        }, 800)
        handleDirect(link, element?.navigationType, history, buildConsentHref)
      }
    } finally {
      isAuthorizingRef.current = false
    }
  }

  const enhancedList = list.map(card => ({
    ...card,
    subtitle: card.description || ''
  }))

  return (
    <>
      <div className="main-button-feature">
        <div className="feature-cards-container">
          {enhancedList.map((card, index) => (
            <div
              key={index}
              className="feature-card"
              onClick={() => card?.disable ? '' : handleClick(card)}>
              <div className="card-icon">
                {card.icon ? card.icon : (
                  <img style={{width:'50px',height:'50px',borderRadius:'4px'}} src={card?.imageUrl} alt="" />
                )}
              </div>
              <div className="card-content">
                <div className="card-title" dangerouslySetInnerHTML={{ __html: card.label || card?.title }}></div>
                <div className="card-subtitle">{card.subtitle || ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showNavigating && ReactDOM.createPortal(
        <div className="loading">
          <div className="text-center">
            <Spin />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default MainButton
