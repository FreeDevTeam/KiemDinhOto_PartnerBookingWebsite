import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'antd'
import './index.scss'
import BasicAlertPopup from '../../components/BasicComponent/BasicAlertPopup'

const PopupMessage = (props) => {
  const {
    isModalOpen, 
    onClose,
    text = 'Xử lý thất bại, vui lòng liên hệ CSKH để được hỗ trợ',
    children,
    buttonText = 'Xác nhận',
    type = ''
  } = props

  // NOTE: Theme BIDV sử dụng giao diện popup kiểu mới (BasicAlertPopup)
  // Các theme khác tạm thời vẫn dùng Modal cũ để tránh ảnh hưởng giao diện hiện tại
  const isBIDV = document.body.getAttribute('data-theme') === 'BIDV'

  if (isBIDV) {
    const isInfo = text?.includes('Số seri')
    const alertType = isInfo ? 'info' : 'error'
    const title = type ? type : (isInfo ? 'Hướng dẫn' : 'Thất bại')
    return (
      <BasicAlertPopup
        visible={isModalOpen}
        onClose={onClose}
        type={alertType}
        title={title}
        content={
          <>
            {text && <div dangerouslySetInnerHTML={{ __html: text }} />}
            {children}
          </>
        }
        buttonText={buttonText}
      />
    )
  }

  return (
    <div >
      <Modal title={type}  visible={isModalOpen}  onCancel={onClose}
      footer ={<Button className='btn-ok' onClick={onClose}>{buttonText}</Button>}
      className="popup-message"
      style={{
        top: 20,
        maxWidth:'350px',
        textAlign:'center'
      }}
      >
      <div dangerouslySetInnerHTML={{ __html:text }}>
        {children}
      </div>
      </Modal>
    </div>
  )
}

export default PopupMessage
