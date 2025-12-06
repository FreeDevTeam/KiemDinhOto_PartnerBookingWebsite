import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'antd'
// import { routes } from 'App'
import successImage from '../../../src/assets/icons/popup-success.png'
import BookingService from './../../services/addBookingService'
import { STATION_SESSION_KEY } from './../../constants/schedule'
import { useLocation } from 'react-router-dom'
import { CheckApiKey } from '../../helper/CheckApiKey'

const BookingSuccess = ({ isModalOpen, onClose, history, scheduleId,setStep,setIsModalOpen }) => {
  const handleClose = () => {
    setIsModalOpen(false)
    window.location.reload()
  }

  return (
    <>
      <Modal title="" visible={isModalOpen} footer={null} closable={false} className="text-center" onClose={onClose}>
        <img src={successImage} style={{margin:'auto'}} alt="successImage" loading="lazy" />
        <div className="login__title__text" style={{ margin: '40px auto 12px' }}>
          Đăng ký lịch hẹn thành công
        </div>
        <div>
          {/* <Button
            className="login__button w-100 custom-df-btn light custom-btn"
            onClick={() => history.push(`/booking-history?apiKey=${apiKey}&name=${fullName}&phone=${phoneNumber}`)}
            style={{ marginTop: 8 }}
            size="large">
            Xem lịch hẹn
          </Button> */}
          <Button
            className="login__button w-100 custom-df-btn light custom-btn"
            onClick={() => handleClose()}
            style={{ marginTop: 8 }}
            size="large">
            Xác nhận
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default BookingSuccess
