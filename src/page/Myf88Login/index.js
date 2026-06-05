import React from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import Header from '../../components/Header'
import { ENV } from '../../constants/EnvironmentVariables'
import { initWebviewContainer } from '../../actions'
import { redirectByMiniAppBackUrl } from '../../actions/miniAppBackAction'
import { MOBILE_APP_CONTAINER } from '../../constants/MobileAppContainer'
import { getMyf88LoginViewModel, runMyf88LoginFlow } from './action'
import './index.scss'
import { useAppParamsContext } from '../../context/AppParamsContext'

export default function Myf88LoginPage() {
  const { isHeaderMiniApp } = useAppParamsContext()
  const history = useHistory()
  const viewModel = React.useMemo(() => getMyf88LoginViewModel(), [])
  const [logoPath, setLogoPath] = React.useState(viewModel.logoPath)
  const [status, setStatus] = React.useState('loading')

  const handleBack = React.useCallback(() => redirectByMiniAppBackUrl(history), [history])

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
      {isHeaderMiniApp && (
        <Header onBack={handleBack} />
      )}
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
