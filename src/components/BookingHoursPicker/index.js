import React from 'react'
import { Empty } from 'antd'
import './index.scss'
import LoadingPopup from '../LoadingPopup'

export default function BookingHoursPicker({
  selectedTime = '',
  setSelectedTime,
  listBookingTime,
  loading = false,
  disabled = true
}) {
  const bookingTimeData = listBookingTime

  const handlePickTime = (time) => {
    if (disabled) return
    if (time?.disabled || !time?.scheduleTime) return
    setSelectedTime(time)
  }

  return (
    <div className={`booking-hours-picker`}>
      {loading ? (
        <LoadingPopup type="content" />
      ) : bookingTimeData?.length ? (
        <div className="booking-hours-picker_content">
          {bookingTimeData.map((value, index) => {
            return (
              <div
                style={{ cursor: disabled || !listBookingTime?.length || value?.disabled ? 'not-allowed' : 'pointer' }}
                onClick={() => handlePickTime(value)}
                className={`${selectedTime?.scheduleTime === value?.scheduleTime ? 'active' : ''} booking-hours-picker_item ${
                  value?.disabled ? 'booking-hours-picker-disabled' : ''
                }`}
                index={index}
                key={index}>
                <div className="booking-hours-picker__text">{value?.scheduleTime || value?.label}</div>
              </div>
            )
          })}
        </div>
      ) : (
        <Empty description={'Không có khung giờ trống'}></Empty>
      )}
    </div>
  )
}

