import React from 'react'
import { useAppParamsContext } from '../context/AppParamsContext'

/**
 * Hàm khởi tạo Component Icon tự động thay đổi theo theme.
 * 
 * @param {Object} icons - Một object chứa các icon tương ứng với theme. 
 *                         BẮT BUỢC phải truyền một icon vào key `default`.
 *                         Ví dụ: { default: IconThuong, BIDV: IconBIDV }
 * @returns {React.FC} Component tự động chọn icon.
 */
export const createThemeIcon = (icons) => {
  return (props) => {
    // 1. Lấy tên theme hiện tại từ Context
    const { appThemeName } = useAppParamsContext()
    const currentTheme = String(appThemeName || '').toUpperCase()

    // 2. Ưu tiên lấy Icon của theme hiện hành.
    // Nếu theme hiện hành không có icon riêng, TỰ ĐỘNG lấy icon `default`.
    const TargetIcon = icons[currentTheme] || icons.default || icons['DEFAULT']

    // 3. Nếu lỡ quên không truyền default thì cảnh báo
    if (!TargetIcon) {
      console.warn('createThemeIcon: Bạn quên truyền icon mặc định (key `default`)')
      return null
    }

    // 4. Trả về đúng Component đó
    return <TargetIcon {...props} />
  }
}
