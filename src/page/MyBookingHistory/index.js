import React, { useState, useEffect } from 'react'
import { Form } from 'antd'
import DefaultButton from '../../components/elements/button'
import BookingHistoryList from './BookingHistoryList'
import BookingPartnerForm from '../BookingPartner/bookingPartnerForm'
import { useGlobalContext } from '../../context/GlobalContext'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import { PATH } from '../../constants/router'
import './index.scss'

const MyBookingHistory = () => {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('booking')
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const { globalState, handleGetUserPhone } = useGlobalContext()

  useEffect(() => {
    setLoading(true)
    handleGetUserPhone()
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [])

  const { phoneNumber, userName } = globalState

  return (
    <div className="w-100" style={{ minHeight: '100vh', maxWidth: 600, margin: 'auto' }}>
      <div className="row justify-content-center">
            <div className="card-header bg-white border-bottom-0 px-4 pt-4 pb-2">
              <ul className="nav nav-tabs justify-content-center border-0">
                <li className="nav-item flex-grow-1 text-center d-flex align-items-center justify-content-center">
                  <button
                    className={`nav-link w-100 fw-semibold ${activeTab === 'booking' ? 'active text-primary' : 'text-dark'}`}
                    onClick={() => setActiveTab('booking')}
                  >
                    Đặt lịch
                  </button>
                </li>
                <li className="nav-item flex-grow-1 text-center d-flex align-items-center justify-content-center">
                  <button
                    className={`nav-link w-100 fw-semibold ${activeTab === 'history' ? 'active text-primary' : 'text-dark'}`}
                    onClick={() => setActiveTab('history')}
                  >
                    Lịch hẹn
                  </button>
                </li>
              </ul>
            </div>

            <div className="px-4 py-3">
              {activeTab === 'booking' && (
                <BookingPartnerForm
                  zaloUserPhone={phoneNumber}
                  zaloUserName={userName}
                  form={form}
                />
              )}

              {activeTab === 'history' && (
                <BookingHistoryList
                  loading={loading}
                  setLoading={setLoading}
                  phoneNumber={phoneNumber}
                />
              )}
            </div>
      </div>
    </div>
  )
}

export default MyBookingHistory
