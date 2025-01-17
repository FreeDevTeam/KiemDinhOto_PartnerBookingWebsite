import React, { useState } from 'react'
import { useEffect } from 'react'
import "zmp-ui/zaui.min.css";
import BookingService from './../../services/addBookingService'
import { useGlobalContext } from '../../context/GlobalContext'
import { Spin } from 'antd';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const HomeLogin = (props) => {
  const history = useHistory()
  const { globalState } = useGlobalContext();
  const [firstLoading, setFirstLoading] = useState(false)

  const loginByApikey = () => {
    let value = {
      phoneNumber:globalState?.phoneNumber?.replaceAll(" ", ""),
      firstName:globalState?.userName || undefined
    }
    BookingService.loginByApikey(value).then((result) => {
      const { isSuccess, data } = result
      if (isSuccess) {
        let usertoken= data?.token
        localStorage.setItem('userToken',usertoken)
        localStorage.setItem('appUserId',data?.appUserId)
        history.push('/',usertoken)
      } else {
        return
      }
    })
  }
  useEffect(() => {
    if(globalState?.phoneNumber){
      loginByApikey()
      setFirstLoading(true)
    }
  }, []);


  return (
    <>
      <div className="loading">
        <Spin style={{ width: '100%' }} />
      </div>
    </>
  )
}
export default HomeLogin