import React, { useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { useGlobalContext } from '../../../context/GlobalContext'
import { PATH } from '../../../constants/router'
import { PARAM_URL_IFRAME } from '../../../constants/params'
import { encodeLink } from '../../../helper/common'
import { MAIN_BUTTON_TITLES } from '../../../constants/serviceOption'

const L2MainButton = ({ setSheetVisible, setDataBtn, list, title, className }) => {
  const history = useHistory()
  const { handleZaloAuthorize, globalState } = useGlobalContext()
  const { handleGetUserPhone } = useGlobalContext()

  const handleRouter = async (path) => {
    if (!globalState?.isAuthorize) {
      await handleZaloAuthorize()
    }
    await handleGetUserPhone().then(data => {
      history.push(path)
    })
  }

  const handleClick = async (element) => {
    if (!globalState?.isAuthorize) {
      await handleZaloAuthorize()
    }
    const link = element?.linkNavigation

    const isZaloLink = link.includes('zalo.me')
    if (link) {
      if (!(link?.startsWith("https://") || link?.startsWith("http://"))) {
        history.push(link)
      } else {
        history.push(`${PATH.IFRAME_VIEW}?${PARAM_URL_IFRAME}=${encodeLink(link)}`)
      }
    }
  }

  const enhancedList = list.map(card => ({
    ...card,
    subtitle: MAIN_BUTTON_TITLES[card.label || card?.title]?.subTitle
  }))

  return (
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
  )
}

export default L2MainButton
