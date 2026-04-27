import React from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { getVnpayLoginViewModel, runVnpayLoginFlow } from './action'
import './index.scss'

const VNPAY_LOGIN_FAILURE_MESSAGE = 'Tải dữ liệu thất bại. Vui lòng liên hệ CSKH để được hỗ trợ'

export default function VnpayLoginPage() {
  const history = useHistory()
  const viewModel = React.useMemo(() => getVnpayLoginViewModel(), [])
  const [logoPath, setLogoPath] = React.useState(viewModel.logoPath)
  const [status, setStatus] = React.useState('loading')

  React.useEffect(() => {
    let isMounted = true

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
          <div className="VnpayLoginPage_errorText">{VNPAY_LOGIN_FAILURE_MESSAGE}</div>
        )}
      </div>
    </div>
  )
}
