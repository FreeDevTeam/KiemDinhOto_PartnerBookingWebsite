import React from 'react'
import BasicButton from '../BasicButton'

// Hiển thị thông báo kèm 1 nút CTA (dùng cho các trạng thái lỗi / không tìm thấy)
function BasicResultMessage({ message, ctaTitle, onCtaClick }) {
  return (
    <div className="text-center" style={{ maxWidth: 600, margin: 'auto', padding: '60px 15px' }}>
      <div className="text-danger mb-4" style={{ fontSize: 18, fontWeight: 500 }}>
        {message}
      </div>
      {ctaTitle && <BasicButton type="primary" title={ctaTitle} onClick={onCtaClick} />}
    </div>
  )
}

export default BasicResultMessage
