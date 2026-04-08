import React from 'react'
import moment from 'moment'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Empty } from 'antd'
import './index.scss'
import 'moment/locale/vi'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'
import LoadingPopup from '../LoadingPopup'

moment.updateLocale('vi', {
  weekdays: ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
})

const MONTH_YEAR_FORMAT = 'MM/YYYY'

export default function BookingDatePicker({
  selectedDate = '',
  disabled = true,
  setSelectedDate,
  listBookingDate = [],
  currentMonth,
  setCurrentMonth,
  loading = false,
  minAvailableMonth = moment().format(DATE_DISPLAY_FORMAT)
}) {
  const disablePickDate = disabled || !listBookingDate?.length

  const handlePickDate = (date) => {
    if (disabled) return
    if (isDisabledDate(date)) return
    setSelectedDate(date?.scheduleDate)
  }

  const decreaseMonth = () => {
    const checkCurrentMonth = moment(currentMonth, DATE_DISPLAY_FORMAT).subtract(1, 'months')
    if (checkCurrentMonth.isSameOrBefore(moment(), 'month')) {
      setCurrentMonth(moment())
    } else {
      setCurrentMonth(moment(currentMonth, DATE_DISPLAY_FORMAT).subtract(1, 'months'))
    }
    if (setSelectedDate) setSelectedDate(undefined)
  }

  const increaseMonth = () => {
    setCurrentMonth(moment(currentMonth, DATE_DISPLAY_FORMAT).startOf('month').add(1, 'months'))
    if (setSelectedDate) setSelectedDate(undefined)
  }

  const getDisplayTextByScheduleDateStatus = (element) => {
    if (!element?.displayText) {
      return ''
    }

    if (element?.isFull) {
      return <div style={{ color: 'var(--error-btn-color)' }}>{element.displayText}</div>
    }

    return element.displayText
  }

  const isDisabledDate = (element) => {
    return !!element?.disabled
  }

  return (
    <div className={`booking-date-picker`}>
      <div className={`booking-date-picker_header`}>
        <div className="booking-date-picker__day--text">{selectedDate}</div>
        <div>
          <Button
            icon={<LeftOutlined className="booking-date-picker__day--text" />}
            disabled={disabled ? true : moment(currentMonth, DATE_DISPLAY_FORMAT).isSameOrBefore(moment(minAvailableMonth, DATE_DISPLAY_FORMAT), 'month')}
            onClick={decreaseMonth}
          />
          <span className="booking-date-picker__day--text ms-2 me-2">
            {currentMonth ? moment(currentMonth, DATE_DISPLAY_FORMAT).format(MONTH_YEAR_FORMAT) : ''}
          </span>
          <Button disabled={disabled} icon={<RightOutlined className="booking-date-picker__day--text" />} onClick={increaseMonth} />
        </div>
      </div>
      {!loading ? (
        <div className="booking-date-picker_content">
          {listBookingDate?.length ? (
            listBookingDate.map((value, index) => {
              const dateObj = moment(value?.scheduleDate, DATE_DISPLAY_FORMAT).locale('vi')
              const isDateDisabled = isDisabledDate(value)

              return (
                <div
                  index={index}
                  style={{ cursor: disablePickDate || isDateDisabled ? 'not-allowed' : 'pointer' }}
                  onClick={() => handlePickDate(value)}
                  className={`${isDateDisabled ? 'disabled-date' : ''} booking-date-picker__day ${selectedDate === value?.scheduleDate ? 'active' : ''}`}
                  key={index}>
                  <div className="booking-date-picker__day--text">{dateObj.format('dddd')}</div>
                  <div className="booking-date-picker__day--text">{dateObj.format('DD')}</div>
                  <span className="wrap-text">{getDisplayTextByScheduleDateStatus(value)}</span>
                </div>
              )
            })
          ) : (
            <Empty description={'Không có ngày hẹn trống'}></Empty>
          )}
        </div>
      ) : (
        <LoadingPopup type="content" />
      )}
    </div>
  )
}

