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

// Chỉ parse number dạng decimal bình thường
// Parse:
// - 0
// - 10
// - -10
// - 1.5
// - -1.5
//
// Không parse:
// - 00123
// - +10
// - .5
// - 1.
// - 1e3
// - NaN
// - Infinity
// - 0x10
const STRICT_NUMBER_REGEX = /^-?(0|[1-9]\d*)(\.\d+)?$/

export function formatLocalStorageValue(value) {
  // LocalStorage chỉ lưu string
  // stringify để khi get lên có thể restore lại đúng kiểu dữ liệu thường gặp
  if (value === undefined) {
    return 'undefined'
  }

  try {
    return JSON.stringify(value)
  } catch (e) {
    console.error('formatLocalStorageValue: JSON stringify failed', e)
    return 'undefined'
  }
}

export function parseFromLocalStorage(raw) {
  // null / undefined -> return ngay
  if (raw === null) return null
  if (raw === undefined) return undefined

  // chỉ xử lý string
  if (typeof raw !== 'string') return raw

  const trimmed = raw.trim()

  // giữ nguyên chuỗi rỗng hoặc toàn khoảng trắng
  if (trimmed === '') return raw

  // special literals
  if (trimmed === 'undefined') return undefined
  if (trimmed === 'null') return null
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false

  // chỉ parse number nếu là decimal bình thường
  if (STRICT_NUMBER_REGEX.test(trimmed)) {
    return Number(trimmed)
  }

  // parse JSON cho object / array / string đã stringify
  const looksLikeJson =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))

  if (looksLikeJson) {
    try {
      return JSON.parse(trimmed)
    } catch (e) {
      return raw
    }
  }

  // còn lại giữ nguyên string gốc
  return raw
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
