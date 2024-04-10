import React, { useEffect } from 'react'
import './index.scss'
import { useState } from 'react'
import DefaultButton from '../../components/elements/button'
import { useGlobalContext } from '../../context/GlobalContext'
import { PATH } from '../../constants/router'
import BookingHistoryList from './BookingHistoryList'
const MyBookingHistory = ({ history }) => {
  const [loading, setLoading] = useState(false)
  const { globalState, handleGetUserPhone } = useGlobalContext();
  useEffect(() => {
    setLoading(true)
    handleGetUserPhone().then(data => {
      setLoading(false)

    }).catch(err => {
      setLoading(false)
    })
  }, [])

  const { userName, phoneNumber } = globalState
  return (
    <div className="w-100" style={{ minHeight: '100vh', maxWidth: 600, margin: 'auto' }}>
      <div className="bookingHistory-main" style={{ padding: "20px 15px 20px 15px" }}>
        <div style={{ padding: '10px 12px' }}>
          <DefaultButton
            colorType="dark"
            title="+ Đặt lịch hẹn"
            action={() => {
              history.push(`${PATH.BOOKING_PARTNER_IFRAME}?apikey=${null}&name=${userName}&phone=${phoneNumber}`)
            }}
          />
        </div>
        <div>
          <BookingHistoryList loading={loading} setLoading={setLoading} phoneNumber={phoneNumber} />
        </div>
      </div>
    </div>
  )
}

export default MyBookingHistory
