import addKeyLocalStorage from './localStorage'

// Key lưu token đăng nhập (nhận từ trang loginSuccess) để gắn vào header khi gọi API
const AUTH_TOKEN_KEY = addKeyLocalStorage('token')

export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || ''
  } catch (e) {
    return ''
  }
}

export const setAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export const removeAuthToken = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch (e) {}
}
