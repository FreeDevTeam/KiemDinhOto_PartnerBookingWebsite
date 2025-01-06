import React, { useEffect, useState } from 'react'
import { Modal, Button, Spin } from 'antd'
import './index.scss'
import { LoadingOutlined } from '@ant-design/icons';

const LoadFormBookingFailed = ({ }) => {
   const CheckApiKeys = () => {
    const searchParams = window.location.href
    const webSaladin = 'saladin.ttdk.com.vn'
    
    if (searchParams.includes(webSaladin)) {
      return window.location.href = "https://saladin.ttdk.com.vn/booking?apikey=fe58f4e7-29ac-4ade-86b1-d51a3b0602a5"
    }
  }

  useEffect(() =>{
    CheckApiKeys()
  },[])

  return (
    <>
      <div className="text-center">
        <div className={'register app-container'} style={{ maxWidth: 600, margin: 'auto',padding:'30px 15px'}}>
          <Spin
            indicator={
              <LoadingOutlined
                style={{
                  fontSize: 100,
                }}
                spin
              />
            }
          />
          <div className="register-success text-center">
            <div className="login__title mgt-40">
              <div className='text-danger'>Hiện tại chức năng đang không hoạt động.</div>
            </div>
            <div className="login__title mgt-40">
              <div className='mb-2'>Vui lòng liên hệ đội ngũ TTDK qua CSKH</div>
              <div className='mb-2'>hoặc</div>
              <div className='mb-2'>email: <a href="mailto:info@ttdk.com.vn">info@ttdk.com.vn</a> để được hỗ trợ.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoadFormBookingFailed
