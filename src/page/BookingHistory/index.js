import React , { useEffect } from 'react'
import { routes } from './../../App'
import SearchList from './../../components/shared/search/SearchList'
import TabNotification from './TabNotification'
import './index.scss'
import { useState } from 'react'
import DefaultButton from './../../components/elements/button'
import { useLocation } from "react-router-dom";
import addKeyLocalStorage from './../../helper/localStorage'
import { CheckApiKey } from '../../helper/CheckApiKey'
const Notification = ({ history }) => {
  const location = useLocation();
  const [search, setSearch] = useState(undefined)
  const searchparam = location.search
  const params = new URLSearchParams(searchparam)
  const phoneNumber = params.get('phone') || ''
  const fullName = params.get('name') || ''
  let apiKey = CheckApiKey()
  const handleSearch = (value) => {
    if (!value) {
      setSearch(undefined)
      return
    }
    setSearch(value)
  }


  return (
    <div className="w-100" style={{ minHeight: '100vh', maxWidth: 600, margin: 'auto'}}>
      <div className="bookingHistory-main" style={{ padding: "20px 15px 20px 15px" }}>
        <div style={{ padding: '10px 12px' }}>
          <DefaultButton
            colorType="dark"
            title="+ Đặt lịch hẹn"
            action={() => {
              // history.push(`/booking-partner-iframe?apiKey=${apiKey}&name=${fullName}&phone=${phoneNumber}`)
              history.push(`/?apiKey=${apiKey}&name=${fullName}&phone=${phoneNumber}`)
            }}
          />
          <div style={{ height: '40px' }} />
          <div className='history-lable'>Tìm kiếm lịch hẹn theo số điện thoại:</div>
          {/* <SearchList placeholder="Nhập số điện thoại" className="w-100" onSearch={handleSearch} /> */}
        </div>
        <div>
          <TabNotification search={search} />
        </div>
      </div>
    </div>
  )
}

export default Notification
