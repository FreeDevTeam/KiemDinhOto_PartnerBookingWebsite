import React from 'react'
import { LeftOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { initWebviewContainer } from '../../actions'
import { redirectByMiniAppBackUrl } from '../../actions/miniAppBackAction'
import { MOBILE_APP_CONTAINER } from '../../constants/MobileAppContainer'
import { getMyf88LoginViewModel, runMyf88LoginFlow } from './action'
import './index.scss'

export default function Myf88LoginPage() {
  const history = useHistory()
  const viewModel = React.useMemo(() => getMyf88LoginViewModel(), [])
  const [logoPath, setLogoPath] = React.useState(viewModel.logoPath)
  const [status, setStatus] = React.useState('loading')

  const handleBack = React.useCallback(() => {
    const hasRedirected = redirectByMiniAppBackUrl()
    if (hasRedirected) {
      return
    }

    if (window.history.length > 1) {
      history.goBack()
      return
    }

    history.replace('/')
  }, [history])

  React.useEffect(() => {
    let isMounted = true

    initWebviewContainer(MOBILE_APP_CONTAINER.MYF88_INAPP)

    runMyf88LoginFlow()
      .then((result) => {
        if (!isMounted) return

        if (result.status === 'success') {
          history.replace(result.redirectTo)
          return
        }

        setStatus('error')
      })
      .catch((error) => {
        console.error('Unexpected MYF88 login error', error)
        if (isMounted) {
          setStatus('error')
        }
      })

    return () => {
      isMounted = false
    }
  }, [history])

  return (
    <div className="Myf88LoginPage">
      <div className="Myf88LoginPage_header">
        <button
          className="Myf88LoginPage_backButton"
          type="button"
          onClick={handleBack}
          aria-label="Quay lại"
        >
          <LeftOutlined />
        </button>
      </div>
      <div className="Myf88LoginPage_card">
        <img
          className="Myf88LoginPage_logo"
          src={logoPath}
          alt="MYF88 loading"
          onError={() => {
            if (logoPath !== viewModel.fallbackLogoPath) {
              setLogoPath(viewModel.fallbackLogoPath)
            }
          }}
        />
        {status === 'loading' ? (
          <div className="Myf88LoginPage_loadingText">{viewModel.loadingText}</div>
        ) : (
          <div className="Myf88LoginPage_errorText">{MOBILE_APP_CONTAINER.MYF88_INAPP.LoginFailureMessage}</div>
        )}
      </div>
    </div>
  )
}
