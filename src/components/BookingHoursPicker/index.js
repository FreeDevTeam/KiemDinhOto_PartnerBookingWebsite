import React from 'react'
import { Empty } from 'antd'
import './index.scss'
import LoadingPopup from '../LoadingPopup'

export default function BookingHoursPicker({ selectedTime = '', setSelectedTime, listBookingTime = [], loading = false, disabled = true }) {
  const selectedScheduleTime = typeof selectedTime === 'string' ? selectedTime : selectedTime?.scheduleTime

  const handlePickTime = (time) => {
    if (disabled) return
    if (time?.disabled || !time?.scheduleTime) return
    setSelectedTime(time)
  }

  return (
    <div className="booking-hours-picker">
      {loading ? (
        <LoadingPopup type="content" />
      ) : listBookingTime?.length ? (
        <div className="booking-hours-picker_content">
          {listBookingTime.map((value, index) => {
            return (
              <div
                style={{ cursor: disabled || !listBookingTime?.length || value?.disabled ? 'not-allowed' : 'pointer' }}
                onClick={() => handlePickTime(value)}
                className={`${selectedScheduleTime === value?.scheduleTime ? 'active' : ''} booking-hours-picker_item ${
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
        <Empty description="Không có khung giờ trống" />
      )}
    </div>
  )
}
