import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'antd'
import './index.scss'
import BasicAlertPopup from '../../components/BasicComponent/BasicAlertPopup'

/**
 * Component hiển thị Modal thông báo dùng chung.
 * 
 * @param {object} props
 * @param {boolean} props.isModalOpen - Trạng thái đóng/mở của modal.
 * @param {function} props.onClose - Hàm gọi khi đóng modal.
 * @param {string} props.text - Nội dung thông báo hiển thị bên trong modal.
 * @param {string} props.buttonText - Chữ hiển thị trên nút bấm (mặc định: 'Xác nhận').
 * @param {string} props.type - Tiêu đề của modal. 
 * @param {'success' | 'error' | 'info'} props.status - TRẠNG THÁI thông báo (Rất quan trọng cho theme BIDV).
 * 
 * ⚠️ LƯU Ý QUAN TRỌNG: KHÔNG ĐƯỢC XÓA PROP NÀY!
 * Prop `status` quyết định giao diện Popup (màu sắc, icon) của theme BIDV.
 */
const PopupMessage = (props) => {
  const {
    isModalOpen, 
    onClose,
    text = 'Xử lý thất bại, vui lòng liên hệ CSKH để được hỗ trợ',
    children,
    buttonText = 'Xác nhận',
    type = '',
    status = ''
  } = props

  // NOTE: Theme BIDV sử dụng giao diện popup kiểu mới (BasicAlertPopup)
  // Các theme khác tạm thời vẫn dùng Modal cũ để tránh ảnh hưởng giao diện hiện tại
  const isBIDV = document.body.getAttribute('data-theme') === 'BIDV'

  if (isBIDV && status) {
    const title = type ? type : (status === 'success' ? 'Thành công' : (status === 'info' ? 'Hướng dẫn' : 'Thất bại'))
    return (
      <BasicAlertPopup
        visible={isModalOpen}
        onClose={onClose}
        type={status}
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
