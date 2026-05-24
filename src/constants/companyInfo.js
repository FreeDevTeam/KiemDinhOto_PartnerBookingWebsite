const DEFAULT_INFO = {
  name: 'CÔNG TY CỔ PHẦN CHUYỂN ĐỔI DỮ LIỆU SỐ SA MỘC',
  shortName: 'TTDK',
  globalName: 'SA MOC DIGITAL DATA TRANSFORMATION JOINT STOCK COMPANY',
  address: 'Số nhà NV2-13, Khu đô thị Dream Town, TDP số 6, Phường Tây Mỗ, Quận Nam Từ Liêm, Thành phố Hà Nội, Việt Nam',
  phoneNumber: '0343.902.960',
  hotline: '1800.6601',
  email: 'info@ttdk.com.vn',
  lastUpdatedAt: '2025-02-12 14:42:57',
  managedBy: 'Chi cục Thuế Quận Nam Từ Liêm',
  taxId: '0110033248',
  director: 'Nguyễn Minh Huệ',
  dateOfOperation: '16/06/2022',
  sotaikhoan: 8603131888,
  tennganhang: 'BIDV',
  chutaikhoan: 'CTCP CHUYEN DOI DU LIEU SO SA MOC',
  facebookLink: 'https://www.facebook.com/groups/940007330455923',
  tiktokLink: 'https://www.tiktok.com/@ttdkdatlichdangkiem?_t=8gGKdPGglGM&_r=1',
  youtubeLink: 'https://www.youtube.com/@TTDK-DatLichDangKiem/about',
  zaloLink: 'https://zalo.me/ttdk2023',
  zaloLink2: 'https://zalo.me/3485707806416347108',
  zaloMiniAppLink: 'https://zalo.me/s/1199840672744416551',
  zaloMiniAppResetPassLink: 'https://zalo.me/s/1199840672744416551/resetPassword',
  bctLink: 'http://online.gov.vn/Website/chi-tiet-128972'
}

const TAMOVE_INFO = {
  name: 'CÔNG TY CỔ PHẦN CHUYỂN ĐỔI DỮ LIỆU SỐ TRƯỜNG AN',
  shortName: 'TAMOVE',
  globalName: 'TRUONG AN DIGITAL DATA CONVERSION JOINT STOCK COMPANY',
  address: 'Số 103 Vạn Phúc, TDP 10, Phường Hà Đông, Thành phố Hà Nội, Việt Nam',
  phoneNumber: '094.828.6798',
  hotline: '094.828.6798',
  email: 'info@tajsc.vn',
  lastUpdatedAt: '2025-10-28 00:00:00',
  managedBy: 'Thuế cơ sở 15 thành phố Hà Nội',
  taxId: '0111229885',
  director: 'Nguyễn Đăng Tuấn Anh',
  dateOfOperation: '25/9/2025',
  sotaikhoan: 11229885,
  tennganhang: 'Techcombank',
  chutaikhoan: 'CONG TY CP CHUYEN DOI DLS TRUONG AN',
  facebookLink: 'https://www.facebook.com/profile.php?id=61583033225267',
  tiktokLink:
    'https://www.tiktok.com/@tajsc.vn?_d=eil2le8cjlbeed&_r=1&enable_checksum=1&item_author_type=1&sec_uid=MS4wLjABAAAAiR5Au5sGRQTBKZfEWW7iO8EnEdBd8fKx8SOMqM7N4GGhM47-KV45QKXfXNlPZcmS&sec_user_id=MS4wLjABAAAAiR5Au5sGRQTBKZfEWW7iO8EnEdBd8fKx8SOMqM7N4GGhM47-KV45QKXfXNlPZcmS&share_app_id=1180&share_author_id=7566569668556440594&share_link_id=5E621BB6-1718-4D5A-B93E-1A193D2212C1&sharer_language=vi&social_share_type=5&source=h5_t&tt_from=more&u_code=f0679f30k59c4d&ug_btm=b8727%2Cb0&user_id=7566569668556440594',
  youtubeLink: 'https://www.youtube.com/channel/UC7gPzRZaS_BuK2o75NxZ6kA',
  zaloLink: 'https://zalo.me/1762527290445502980',
  zaloLink2: 'https://zalo.me/1762527290445502980',
  zaloMiniAppLink: 'https://zalo.me/1762527290445502980',
  zaloMiniAppResetPassLink: 'https://zalo.me/1762527290445502980',
  bctLink: 'http://online.gov.vn/Home/WebDetails/139636'
}

// 🔹 Chọn thông tin theo theme
const TTDK_INFO = DEFAULT_INFO
const THEME_NAME = (process.env.REACT_APP_THEME_NAME || '').trim().toUpperCase()

const COMPANY_INFO_BY_THEME = {
  TTDK: TTDK_INFO,
  TAMOVE: TAMOVE_INFO,
  VNPAY: TAMOVE_INFO
}

const companyInfo = COMPANY_INFO_BY_THEME[THEME_NAME] || TTDK_INFO

// ✅ Giữ nguyên export default (các nơi khác không cần sửa)
export default companyInfo
