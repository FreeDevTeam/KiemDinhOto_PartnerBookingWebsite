import React, { useEffect, useState } from 'react'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'
import './index.scss'
import { getPartnerConfig } from '../../constants/partnerConfig'
import { runPartnerLoginFlow } from './partnerLoginAction'

const MIN_LOADING_MS = 2000

export default function PartnerLoginPage() {
  const { partnerName } = useParams()
  const history = useHistory()
  const location = useLocation()
  
  const config = getPartnerConfig(partnerName)
  
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'invalid'
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!config) {
      setStatus('invalid')
      return
    }

    let isMounted = true
    const startTime = Date.now()

    const executeLogin = async () => {
      try {
        const result = await runPartnerLoginFlow(partnerName, location.search)
        
        if (!isMounted) return

        const elapsed = Date.now() - startTime
        const delayMs = Math.max(0, (config.minLoadingMs || MIN_LOADING_MS) - elapsed)
        
        if (result.status === 'success') {
          setTimeout(() => {
            if (isMounted) history.replace('/')
          }, delayMs)
        } else {
          setTimeout(() => {
            if (isMounted) {
              setStatus('error')
              setErrorMsg(result.message || config.errorText)
            }
          }, delayMs)
        }
      } catch (err) {
        console.error('[PartnerLoginPage] Error', err)
        if (isMounted) {
          setStatus('error')
          setErrorMsg(config.errorText)
        }
      }
    }

    executeLogin()

    return () => {
      isMounted = false
    }
  }, [partnerName, location.search, history, config])

  if (status === 'invalid') {
    return (
      <div className="PartnerLoginPage">
        <div className="PartnerLoginPage_card">
          <div className="PartnerLoginPage_errorText" style={{ color: 'red' }}>
            Đối tác "{partnerName}" không hợp lệ hoặc không được hỗ trợ.
          </div>
        </div>
      </div>
    )
  }

  const handleBackToApp = () => {
    if (config?.backToAppUrl) {
      window.location.replace(config.backToAppUrl)
    } else {
      history.replace('/')
    }
  }

  return (
    <div className="PartnerLoginPage">
      <div className="PartnerLoginPage_header">
        <button className="PartnerLoginPage_backButton" onClick={handleBackToApp}>
          <LeftOutlined />
        </button>
      </div>

      <div className="PartnerLoginPage_card">
        {config?.logoPath && (
          <img
            src={config.logoPath}
            className="PartnerLoginPage_logo"
            alt={config.displayName || partnerName}
            onError={(e) => {
              if (config.fallbackLogoPath) {
                e.target.src = config.fallbackLogoPath
              }
            }}
          />
        )}

        {status === 'loading' && (
          <div className="PartnerLoginPage_loadingText">
            {config?.loadingText || 'Đang tải dữ liệu...'}
          </div>
        )}

        {status === 'error' && (
          <div className="PartnerLoginPage_errorText" style={{ color: 'red' }}>
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  )
}
