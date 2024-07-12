import React, { useState } from 'react'
import moment from 'moment'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import './index.scss'
import LoadingPopup from '../LoadingPopup'

const HOURS_LIST_DEFAULT = [
 {label: "7h30-9h00",scheduleTime:""}, {label:"9h30-11h30",scheduleTime:""}, {label:"13h30-15h00",scheduleTime:""}, {label:"15h30-17h00",scheduleTime:""}
]

export default function BookingHoursPicker({
  selectedTime = '',
  setSelectedTime,
  listBookingTime,
  loading = false
}) {
  const bookingTimeData = listBookingTime?.length ? listBookingTime : HOURS_LIST_DEFAULT
  const handlePickTime = (time) => {
    if(time?.disabled || !time?.scheduleTime) return
    setSelectedTime(time)
  }

  return (
    <div className={`booking-hours-picker`}>
      {!loading ? <div className="booking-hours-picker_content">
        {(bookingTimeData).map((value, index) => {
          return (
            <div
              style={{cursor: !listBookingTime?.length ? "not-allowed" : "pointer"}}
              onClick={()=>handlePickTime(value)}
              className={`${selectedTime?.scheduleTime === value?.scheduleTime ? 'active' : ''} booking-hours-picker_item ${value?.disabled ?'booking-hours-picker-disabled' : ''}`}
              index={index}
              key={index}>
              <div className="booking-hours-picker__text">{value?.scheduleTime || value?.label}</div>
            </div>
          )
        })}
      </div> : <LoadingPopup type="content" />}
    </div>
  )
}
