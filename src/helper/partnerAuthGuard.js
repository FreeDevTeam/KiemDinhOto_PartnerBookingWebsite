import { PATH } from '../constants/router'
import { parseFromLocalStorage, LocalStorageManager } from './localStorage'
import { MYF88_STORAGE_KEYS } from '../constants/Myf88LoginConstants'

/**
 * CẤU HÌNH CÁC ĐỐI TÁC CÓ YÊU CẦU AUTHENTICATION TRƯỚC KHI VÀO TRANG CHỦ
 * 
 * Cách thêm đối tác mới:
 * 1. Thêm 1 object vào mảng PARTNER_AUTH_CONFIGS
 * 2. Cấu hình các trường:
 *    - envKey: Tên biến môi trường (env) để xác định miniapp đối tác (VD: 'REACT_APP_MINIAPP_F88')
 *    - loginPath: Đường dẫn trang đăng nhập/auth của đối tác đó
 *    - hasValidData: Hàm kiểm tra xem đã có dữ liệu hợp lệ của đối tác chưa
 */
const PARTNER_AUTH_CONFIGS = [
  {
    envKey: 'REACT_APP_MINIAPP_F88',
    loginPath: PATH.MYF88_LOGIN,
    hasValidData: () => {
      // Ưu tiên check profile consent
      const consentProfile = LocalStorageManager.getItem(MYF88_STORAGE_KEYS.CONSENT_USER_PROFILE)
      if (consentProfile && (consentProfile.phoneNumber || consentProfile.username)) {
        return true
      }
      
      // Fallback check raw payload
      const rawPayload = LocalStorageManager.getItem(MYF88_STORAGE_KEYS.RAW_PAYLOAD)
      if (rawPayload && (rawPayload.mobile || rawPayload.username)) {
        return true
      }

      return false
    }
  }
  // Có thể thêm cấu hình cho VNPAY, MOMO,... tại đây
]

/**
 * Kiểm tra và lấy đường dẫn redirect cho đối tác hiện tại (nếu cần)
 * @returns {string|null} Đường dẫn cần redirect tới (nếu chưa auth), hoặc null (nếu đã auth hoặc ko phải partner)
 */
export const getPartnerLoginRedirect = () => {
  for (const config of PARTNER_AUTH_CONFIGS) {
    // Kiểm tra xem có đang chạy trong môi trường của đối tác này không
    const isPartnerActive = parseFromLocalStorage(process.env[config.envKey]) === 1 || parseFromLocalStorage(process.env[config.envKey]) === true
    
    if (isPartnerActive) {
      // Nếu đang trong môi trường đối tác, kiểm tra xem đã có data chưa
      if (!config.hasValidData()) {
        // Chưa có data -> cần redirect về trang login của đối tác
        return config.loginPath
      }
      // Nếu đã có data hợp lệ thì dừng check các đối tác khác và cho qua (return null)
      return null
    }
  }

  // Không có partner nào active -> cho phép qua
  return null
}
