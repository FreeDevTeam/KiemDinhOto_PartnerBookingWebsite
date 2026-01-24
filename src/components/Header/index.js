import React from 'react'
import './index.scss'
import { useLocation } from 'react-router-dom'
import { ReactComponent as ArrowLeft } from '../../assets/icons/arrows.svg'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { MESSAGE_BACK_TO_HOME_MINI_APP, PARAM_HEADER_TITLE, PARAM_IS_BACK_TO_HOME_MINI_APP } from '../../constants/params'
import { smartParseParam } from '../../helper/params'
import { checkIsBackToHomeMiniApp } from '../../helper/checkIsEmbeddedView'

export default function Header({ title, onBack }) {
  const location = useLocation()
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  const headerTitle = smartParseParam(params.get(PARAM_HEADER_TITLE)) || 'Thông tin lịch hẹn'
  const history = useHistory()

  const isBackToHomeMiniApp =
    checkIsBackToHomeMiniApp(window.location.href) ||
    sessionStorage.getItem(PARAM_IS_BACK_TO_HOME_MINI_APP) === 'true' ||
    sessionStorage.getItem(PARAM_IS_BACK_TO_HOME_MINI_APP) === '1'
  return (
    <div className={`Header ${smartParseParam(process.env.REACT_APP_HOME_MINIAPP_HEADER_EXPAND) ? 'Header_expand' : ''}`}>
      <div className="Header_fixed">
        <ArrowLeft
          onClick={() => {
            if (isBackToHomeMiniApp) {
              if (window.parent) {
                window.parent.postMessage({ key: MESSAGE_BACK_TO_HOME_MINI_APP }, '*')
              }
              return
            }
            if (onBack) {
              onBack()
            } else {
              history.goBack()
            }
          }}
        />
        <span>{title || headerTitle || ''}</span>
        <div className="no_icon"></div>
      </div>
      <div className="Header_padding"></div>
    </div>
  )
}
