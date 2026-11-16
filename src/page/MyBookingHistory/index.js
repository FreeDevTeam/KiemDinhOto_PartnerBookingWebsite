import React, { useEffect } from 'react'
import './index.scss'
import { useState } from 'react'
import DefaultButton from '../../components/elements/button'
import { useGlobalContext } from '../../context/GlobalContext'
import { PATH } from '../../constants/router'
import BookingHistoryList from './BookingHistoryList'
import { useHistory, useLocation } from 'react-router-dom'
const MyBookingHistory = () => {
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const { globalState, handleGetUserPhone } = useGlobalContext();
  useEffect(() => {
    setLoading(true)
    handleGetUserPhone().then(data => {
      setLoading(false)
    }).catch(err => {
      setLoading(false)
      history.push(PATH.HOME)
    })
  }, [])

  // Zalo: lấy SĐT từ Zalo; Web: lấy SĐT từ param ?phone=
  const phoneNumber = globalState.phoneNumber || new URLSearchParams(location.search).get('phone') || ''
  return (
    <div className="w-100" style={{ minHeight: '100vh', maxWidth: 600, margin: 'auto' }}>
      <div className="bookingHistory-main" style={{ padding: "20px 15px 20px 15px" }}>
        <div style={{ padding: '10px 0px 15px' }}>
          <DefaultButton
            colorType="dark"
            title="+ Đặt lịch hẹn"
            action={() => {
              history.push({ pathname: PATH.HOME, search: location.search })
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
