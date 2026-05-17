import React from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import Header from '../../components/Header'
import { ENV } from '../../constants/EnvironmentVariables'
import { initWebviewContainer } from '../../actions'
import { redirectByMiniAppBackUrl } from '../../actions/miniAppBackAction'
import { MOBILE_APP_CONTAINER } from '../../constants/MobileAppContainer'
import { getVnpayLoginViewModel, runVnpayLoginFlow } from './action'
import './index.scss'

export default function VnpayLoginPage() {
  const history = useHistory()
  const viewModel = React.useMemo(() => getVnpayLoginViewModel(), [])
  const [logoPath, setLogoPath] = React.useState(viewModel.logoPath)
  const [status, setStatus] = React.useState('loading')

  const handleBack = React.useCallback(() => redirectByMiniAppBackUrl(history), [history])

  React.useEffect(() => {
    let isMounted = true

    initWebviewContainer(MOBILE_APP_CONTAINER.VNPAY_INAPP)

    runVnpayLoginFlow()
      .then((result) => {
        if (!isMounted) return

        if (result.status === 'success') {
          history.replace(result.redirectTo)
          return
        }

        setStatus('error')
      })
      .catch((error) => {
        console.error('Unexpected VNPAY login error', error)
        if (isMounted) {
          setStatus('error')
        }
      })

    return () => {
      isMounted = false
    }
  }, [history])

  return (
    <div className="VnpayLoginPage">
      {ENV.REACT_APP_HOME_MINIAPP_HEADER_HIDDEN * 1 !== 0 && (
        <Header onBack={handleBack} />
      )}
      <div className="VnpayLoginPage_card">
        <img
          className="VnpayLoginPage_logo"
          src={logoPath}
          alt="VNPAY loading"
          onError={() => {
            if (logoPath !== viewModel.fallbackLogoPath) {
              setLogoPath(viewModel.fallbackLogoPath)
            }
          }}
        />
        {status === 'loading' ? (
          <div className="VnpayLoginPage_loadingText">{viewModel.loadingText}</div>
        ) : (
          <div className="VnpayLoginPage_errorText">{MOBILE_APP_CONTAINER.VNPAY_INAPP.LoginFailureMessage}</div>
        )}
      </div>
    </div>
  )
}
