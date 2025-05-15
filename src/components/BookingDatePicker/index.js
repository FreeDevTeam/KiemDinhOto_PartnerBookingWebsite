import React, { useState } from 'react'
import moment from 'moment'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Empty } from 'antd'
import './index.scss'
import 'moment/locale/vi'
import { DATE_DISPLAY_FORMAT } from '../../constants/dateFormats'
import LoadingPopup from '../LoadingPopup'

moment.updateLocale('vi', {
  weekdays: ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'] // Cấu hình ngày trong tuần
})

const MONTH_YEAR_FORMAT = 'MM/YYYY' // Định nghĩa định dạng tháng/năm

function getDaysInMonthFromToday() {
  const currentDate = moment();
  const firstDayOfNextMonth = currentDate.clone().endOf('month').add(1, 'day');
  const daysInMonth = [];
  let currentDay = currentDate.clone();

  while (currentDay.isBefore(firstDayOfNextMonth, 'day')) {
    daysInMonth.push({scheduleDate:currentDay.clone()});
    currentDay = currentDay.add(1, 'day');
  }

  return daysInMonth;
}


export default function BookingDatePicker({
  selectedDate = '',
  disabled = true,
  setSelectedDate,
  listBookingDate = [],
  bookingConfig =[],
  currentMonth,
  setCurrentMonth,
  loading= false,
  minAvailableMonth = moment().format(DATE_DISPLAY_FORMAT)
}) {
  const disablePickDate = disabled || !listBookingDate?.length
  const handlePickDate = (date) => {
    
    if(disabled) return
    if(isDisabledDate(date)) return
    setSelectedDate(date?.scheduleDate)
  }

  const decreaseMonth = () => {
    const checkCurrentMonth = moment(currentMonth, DATE_DISPLAY_FORMAT).subtract(1, 'months')
    if (checkCurrentMonth.isSameOrBefore(moment(), 'month')) {
      setCurrentMonth(moment())
    } else setCurrentMonth(moment(currentMonth, DATE_DISPLAY_FORMAT).subtract(1, 'months'))
  }

  const increaseMonth = () => {
    setCurrentMonth(moment(currentMonth, DATE_DISPLAY_FORMAT).startOf('month').add(1, 'months'))
  }

  const getDisplayTextByScheduleDateStatus = (element) => {
    const fullSchedule = isDisabledDate(element);
    const enableBookingHandler = (bookingConfig || []).some((item) => item?.enableBooking);
    if (element.scheduleDateStatus === 0) {
        if (fullSchedule) {
            return <div style={{ color: 'var(--error-btn-color)' }}>Đã đầy</div>;
        } else {
            if (element?.totalBookingSchedule) {
                return enableBookingHandler ? `${element?.totalBookingSchedule}` : `Đang chờ ${element?.totalBookingSchedule}`;
            } else {
                return enableBookingHandler ? '' : 'Đang chờ 0';
            }
        }
    } else {
        return element?.totalBookingSchedule || element?.totalSchedule ? `${element?.totalBookingSchedule || 0}/${element?.totalSchedule}` : '';
    }
};

const isDisabledDate = (element)=>{
  let fullSchedule = false;

  if (element?.totalSchedule > 0) {
      fullSchedule = element?.totalBookingSchedule >= element?.totalSchedule;
  }
  return fullSchedule
}

const listDateData = listBookingDate
  return (
    <div className={`booking-date-picker`}>
      <div className={`booking-date-picker_header`}>
        <div className="booking-date-picker__day--text">{selectedDate}</div>
        <div>
          <Button
            icon={<LeftOutlined className="booking-date-picker__day--text" />}
    disabled={disabled ? true : moment(currentMonth, DATE_DISPLAY_FORMAT).isSameOrBefore(moment(minAvailableMonth,DATE_DISPLAY_FORMAT), 'month')}
            onClick={decreaseMonth}
          />
          <span className="booking-date-picker__day--text ms-2 me-2">
            {currentMonth ? moment(currentMonth, DATE_DISPLAY_FORMAT).format(MONTH_YEAR_FORMAT) : ''}
          </span>
          <Button disabled={disabled} icon={<RightOutlined className="booking-date-picker__day--text" />} onClick={increaseMonth} />
        </div>
      </div>
      {!loading ? <div className="booking-date-picker_content">
        {listDateData?.length ? listDateData.map((value, index) => {
          const dateObj = moment(value?.scheduleDate, DATE_DISPLAY_FORMAT).locale('vi')
          return (
            <div
              index={index}
              style={{ cursor: disablePickDate ? "not-allowed" : "pointer", height: disablePickDate ? 70 : 100 }}
              onClick={() => handlePickDate(value)}
              className={`${isDisabledDate(value) ? 'disabled-date' : ''} booking-date-picker__day ${selectedDate === value?.scheduleDate ? 'active' : ''}`}
              key={index}>
              <div className="booking-date-picker__day--text">{dateObj.format('dddd')}</div>
              <div className="booking-date-picker__day--text">{dateObj.format('DD')}</div>
              <span className="wrap-text">{getDisplayTextByScheduleDateStatus(value)}</span>
            </div>
          )
        }): <Empty description={"Không có ngày hẹn trống"}></Empty>}
      </div> : <LoadingPopup type="content"/>}
    </div>
  )
}
