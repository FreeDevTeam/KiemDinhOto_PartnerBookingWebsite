import React, { useEffect, useState } from 'react'
import { Spin } from 'antd'

import { ROUTERS } from '../../router'
import StickyHeader from '../../components/elements/header'
import './index.scss'

// Import data dịch vụ
import { SCHEDULE_DATA } from '../../constants/serviceOption'
import ListServiceLayout from '../../components/BasicComponent/ListServiceLayout'
import MainLogo from '../../components/MainLogo'

const BookingServiceSelection = () => {
  // State để lưu data
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const title = 'Đặt lịch hẹn'

  // Khởi tạo data dịch vụ
  useEffect(() => {
    if (SCHEDULE_DATA && SCHEDULE_DATA.length > 0) {
      setData(() => {
        return SCHEDULE_DATA.map((item) => {
          return {
            ...item,
            path: `${ROUTERS.booking.path || '/booking'}?scheduleType=${item.id}`,
            stepParam: 'Car',
            isAuthNessary: true
          }
        })
      })
    }

    // Set loading thành false sau khi load data xong
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // Timeout 1 giây

    return () => clearTimeout(timeoutId)
  }, [])

  if (isLoading) {
    return (
      <div className="loading">
        <div className="text-center">
          <MainLogo height={60} width={60}></MainLogo>
          <Spin className="loading-spinner mt-3" />
        </div>
      </div>
    )
  }

  return (
    <div className="custom-container bg-background">
      <div className="header-container">
        <StickyHeader showLogo={false} showArrowLeft={true} title={title} />
      </div>
      <div className="custom-content-style">
        <ListServiceLayout data={data}></ListServiceLayout>
      </div>
    </div>
  )
}

export default BookingServiceSelection
