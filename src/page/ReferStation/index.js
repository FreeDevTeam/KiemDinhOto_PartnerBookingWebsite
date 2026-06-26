import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { PATH } from '../../constants/router'
import './index.scss'

const ReferStation = () => {
  const history = useHistory()

  useEffect(() => {
    const timer = setTimeout(() => {
      history.replace(PATH.BOOKING)
    }, 1000)

    return () => clearTimeout(timer)
  }, [history])

  return (
    <div className="refer-station-temp-page">
      <div className="refer-station-temp-page__card">
        <div className="refer-station-temp-page__title">Trang nhập mã trạm</div>
        <div className="refer-station-temp-page__desc">Đang chuyển hướng...</div>
      </div>
    </div>
  )
}

export default ReferStation