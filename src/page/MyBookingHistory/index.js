import React, { useEffect } from 'react'
import './index.scss'
import { useState } from 'react'
import DefaultButton from '../../components/elements/button'
import { useGlobalContext } from '../../context/GlobalContext'
import { PATH } from '../../constants/router'
import BookingHistoryList from './BookingHistoryList'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { useAppParamsContext } from '../../context/AppParamsContext'
import Header from '../../components/Header'

const MyBookingHistory = () => {
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const { globalState, handleGetUserPhone } = useGlobalContext();
  const { sdkPhoneNumber, isHeaderMiniApp, isWebView, sdkToken } = useAppParamsContext();

  useEffect(() => {
    const isZaloApp = process.env.REACT_APP_ZALO_AUTH_ENABLE * 1 === 1;

    if (isZaloApp) {
      setLoading(true)
      handleGetUserPhone().then(data => {
        setLoading(false)
        if (!sdkPhoneNumber && !sdkToken && !data && !globalState.phoneNumber) {
          history.goBack()
        }
      }).catch(err => {
        setLoading(false)
        history.goBack()
      })
    } else {
      if (!sdkPhoneNumber && !sdkToken) {
        history.goBack()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { userName, phoneNumber } = globalState
  const finalPhoneNumber = sdkPhoneNumber || phoneNumber

  return (
    <div className="w-100 bookingHistory-wrapper" style={{ minHeight: '100vh', maxWidth: 600, margin: 'auto' }}>
      {isHeaderMiniApp && <Header title="Danh sách lịch hẹn" onBack={() => history.goBack()} />}
      <div className="bookingHistory-main">
        {!isWebView && (
          <div style={{ padding: '10px 0px 15px' }}>
            <DefaultButton
              colorType="dark"
              title="+ Đặt lịch hẹn"
              action={() => {
                history.push(`${PATH.BOOKING}`)
              }}
            />
          </div>
        )}
        <div>
          <BookingHistoryList loading={loading} setLoading={setLoading} phoneNumber={finalPhoneNumber} />
        </div>
      </div>
    </div>
  )
}

export default MyBookingHistory
