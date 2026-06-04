export const ENV = {
  REACT_APP_HOME_MINIAPP_HEADER_TITLE: process.env.REACT_APP_HOME_MINIAPP_HEADER_TITLE || 'Giao thông số',
  // 0 = header bị ẩn (mặc định), 1 = header hiển thị
  REACT_APP_HOME_MINIAPP_HEADER_HIDDEN: process.env.REACT_APP_HOME_MINIAPP_HEADER_HIDDEN || '0',
  REACT_APP_RUNTIME_MODE: process.env.REACT_APP_RUNTIME_MODE || 'developer',
  REACT_APP_MINIAPP_VNPAY: process.env.REACT_APP_MINIAPP_VNPAY || '0'
}
