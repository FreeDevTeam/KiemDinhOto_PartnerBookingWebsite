if (!process.env.REACT_APP_PROJECT_NAME) {
  console.log('No variable REACT_APP_PROJECT_NAME! file .env')
}

const PROJECT_NAME = process.env.REACT_APP_PROJECT_NAME || ''

const addKeyLocalStorage = (key) => {
  return PROJECT_NAME + '_' + key
}

export default addKeyLocalStorage

export const LOCAL_STORAGE_KEYS = {
  WEBVIEW_CONTAINER_CODE: 'WebviewContainerCode'
}

export const saveClickToLocalStorage = ({ localStorageKey, targetId }) => {
  const existingData = JSON.parse(localStorage.getItem(addKeyLocalStorage(localStorageKey))) || {}
  if (existingData[targetId]) {
    existingData[targetId].count += 1
    existingData[targetId].lastClicked = Date.now()
  } else {
    existingData[targetId] = {
      targetId,
      count: 1,
      lastClicked: Date.now()
    }
  }

  if (JSON.stringify(existingData)) {
    localStorage.setItem(addKeyLocalStorage(localStorageKey), JSON.stringify(existingData))
  }
}

export function formatLocalStorageValue(value) {
  // 1. Null → trả về "null"
  if (value === null) {
    return 'null'
  }

  // 2. Undefined → trả về "undefined"
  if (value === undefined) {
    return 'undefined'
  }

  // 3. Number, boolean → stringify
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  // 4. String → giữ nguyên
  if (typeof value === 'string') {
    return value
  }

  // 5. Array / Object → JSON stringify
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch (e) {
      console.error('formatLocalStorageValue: JSON stringify failed', e)
      return 'undefined' // hoặc null tùy bạn
    }
  }

  // 6. Function / Symbol → không hỗ trợ
  console.warn(`formatLocalStorageValue: unsupported value type`, value)
  return 'undefined'
}

export function parseFromLocalStorage(raw) {
  // Nếu value truyền vào là null hoặc undefined → return ngay
  if (raw === null) return null
  if (raw === undefined) return undefined

  // Chỉ xử lý string, còn type khác thì trả luôn
  if (typeof raw !== 'string') return raw

  // Các giá trị primitive dạng string
  if (raw === 'null') return null
  if (raw === 'undefined') return undefined
  if (raw === 'true') return true
  if (raw === 'false') return false

  // Số (kể cả 0, số dương, số âm)
  if (!isNaN(raw) && raw.trim() !== '') {
    return Number(raw)
  }

  // Thử parse JSON (object, array, string)
  try {
    return JSON.parse(raw)
  } catch (e) {
    // Không phải JSON → trả lại chuỗi gốc
    return raw
  }
}

export const LocalStorageManager = {
  getItem(key) {
    return parseFromLocalStorage(localStorage.getItem(addKeyLocalStorage(key)))
  },
  setItem(key, value) {
    return localStorage.setItem(addKeyLocalStorage(key), formatLocalStorageValue(value))
  },
  removeItem(key) {
    return localStorage.removeItem(addKeyLocalStorage(key))
  },
  clear() {
    return localStorage.clear()
  }
}

export const SessionStorageManager = {
  getItem(key) {
    return parseFromLocalStorage(sessionStorage.getItem(addKeyLocalStorage(key)))
  },
  setItem(key, value) {
    return sessionStorage.setItem(addKeyLocalStorage(key), formatLocalStorageValue(value))
  },
  removeItem(key) {
    return sessionStorage.removeItem(addKeyLocalStorage(key))
  },
  clear() {
    return sessionStorage.clear()
  }
}
