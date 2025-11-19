import React, { useCallback } from 'react'
import { SCHEDULE_DATA,SCHEDULE_TYPE } from './../../constants/serviceOption'
import { debounce } from 'lodash'
import { Steps,Button } from 'antd'
import { useHistory, useLocation } from 'react-router-dom'
import { CheckApiKey } from '../../helper/CheckApiKey'

function BookingService({ setStep, setData, step }) {
  let apiKey = CheckApiKey()
  const handleClick = useCallback(
    debounce((_item) => {
      if (_item.disabled) return

      setData((prev) => {
        if (prev) {
          return { ...prev, scheduleType: _item.id }
        } else {
          return { scheduleType: _item.id }
        }
      })
      setStep('Info')
    }, 800),
    [step]
  )
  return (
    <div className="booking-service">
      {SCHEDULE_DATA.map((_item) => {
        return (
          <div
            className="booking-service-item"
            key={_item.id}
            style={_item.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            onClick={() => {
              handleClick(_item)
            }}>
            <div className="content-left" style={{display:'flex',alignItems:'center'}}>
              <img src={_item.icon} style={{maxWidth:'56px'}} alt="img" />
            </div>
            <div className="content-right">
              <div className="title">{_item.title}</div>
              <div className="subTitle">{_item.subTitle}</div>
            </div>
          </div>
        )
      })}
      {/* <div className="w-100 d-flex justify-content-center">
        <Button
          className="login__button df mt-4 custom-default-btn"
          type="primary"
          onClick={()=> history.push(`/booking-history?apiKey=${apiKey}&name=${fullName}&phone=${phoneNumber}`)}
          size="large"
        >
          Lịch hẹn
        </Button>
      </div> */}
    </div>
  )
}

export default BookingService
